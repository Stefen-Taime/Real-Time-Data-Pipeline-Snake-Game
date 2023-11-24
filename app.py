from flask import Flask, render_template
from flask_cors import CORS
import datetime
import time
import uuid
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import redis
from confluent_kafka import Producer
import pandas as pd
import clickhouse_connect

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return render_template('index.html')
redis_config = {
    "host": '',
    "port": 17135,
    "password": '',
    "username": 'default',
    "db": 0
}

redis_client = redis.StrictRedis(**redis_config)

kafka_config = {
    'bootstrap.servers': '',
    'security.protocol': 'SASL_SSL',
    'sasl.mechanisms': 'PLAIN',
    'sasl.username': '',
    'sasl.password': '',
    'session.timeout.ms': 45000
}

kafka_producer = Producer(kafka_config)

@app.route('/register', methods=['POST'])
def register_user():
    username = request.json['username']
    
    if redis_client.get(username):
        return jsonify({'error': 'Username already exists'}), 409

    user_id = str(uuid.uuid4())
    created_date = datetime.datetime.now().isoformat()
    redis_client.set(username, json.dumps({'user_id': user_id, 'username': username, 'created_date': created_date}))
    
    return jsonify({'message': 'User registered', 'user_id': user_id}), 201

@app.route('/register_or_login', methods=['POST'])
def register_or_login():
    username = request.json['username']
    
    user_data = redis_client.get(username)
    if user_data:
        user_data = json.loads(user_data)
        return jsonify({'message': 'User exists, continue game', 'user_id': user_data['user_id']}), 200

    user_id = str(uuid.uuid4())
    created_date = datetime.datetime.now().isoformat()
    redis_client.set(username, json.dumps({'user_id': user_id, 'username': username, 'created_date': created_date}))
    
    return jsonify({'message': 'New user registered', 'user_id': user_id}), 201


@app.route('/gameover', methods=['POST'])
def game_over():
    data = request.json
    required_keys = ['username', 'score', 'level', 'duration', 'losses']
    
    if not all(key in data for key in required_keys):
        missing_keys = [key for key in required_keys if key not in data]
        return jsonify({'error': f'Missing data: {missing_keys}'}), 400
    
    username = data['username']

    if not isinstance(username, str):
        return jsonify({'error': 'Username must be a string'}), 400

    user_data = redis_client.get(username)

    if user_data is None:
        return jsonify({'error': 'User not found'}), 404

    user_data = json.loads(user_data)
    user_id = user_data['user_id']
    
    score = data['score']
    level = data['level']
    losses = data['losses']
    duration = data['duration']
    
    timestamp = int(time.mktime(datetime.datetime.now().timetuple()) * 1000)

    kafka_producer.produce('game_over_topic', key=username, value=json.dumps({
        'user_id': user_id,
        'score': score,
        'level': level,
        'losses': losses,
        'duration': duration,
        'timestamp': timestamp,
        'username': username
    }))
    kafka_producer.flush()
    
    return jsonify({'message': 'Game over data sent to Kafka'}), 200


@app.route('/data')
def get_data():
    client = clickhouse_connect.get_client(host='', port=8443, username='default', password='')
    query = """
    SELECT 
        username,
        MAX(highest_score_value) AS top_score,
        MAX(highest_level_value) AS top_level,
        MAX(total_losses_value) AS total_losses,
        MAX(longest_duration_value) AS longest_duration,
        RANK() OVER (ORDER BY MAX(highest_score_value) DESC) AS rank
    FROM SUMMARY_STATS_TOPIC
    GROUP BY username
    ORDER BY top_score DESC
    LIMIT 10;
"""
    result = client.command(query)
    lines = ' '.join(result).split('\n')
    formatted_results = [line.split() for line in lines]

    def format_duration(seconds):
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        seconds = seconds % 60
        return f"{int(hours)}h {int(minutes)}min {int(seconds)}sec" if hours > 0 else f"{int(minutes)}min {int(seconds)}sec"

    for row in formatted_results:
        duration_in_seconds = float(row[4])
        row[4] = format_duration(duration_in_seconds)

    df = pd.DataFrame(formatted_results, columns=["Username", "Top Score", "Top Level", "Total Losses", "Longest Duration", "Rank"])
    return jsonify(df.to_dict(orient='records'))


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')

