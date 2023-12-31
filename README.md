# Real-Time Data Pipeline for Snake Game
![Architecture Splunk](img/game.png)

## Getting Started
This project enables users to play the classic Snake game online. It integrates Redis for connection data management, Flask API for game data retrieval, Kafka for event processing, Flink SQL for real-time analysis, and ClickHouse for data storage. A dashboard designed with Chart.js displays player rankings, updated every 5 seconds.

## Features
- Online Snake game with score recording.
- Real-time analytics with Kafka, Flink SQL, and ClickHouse.
- Interactive dashboard with automatic updates.

### Prerequisites

- **Confluent Cloud Account**: If you do not have a Confluent Cloud account, you can [create one here](https://www.confluent.io/confluent-cloud/tryfree/). It's free for a trial period of more than 30 days, and no credit card is required.
-  **clickhouse Cloud**: You can also try clickhouse for free at [clickhouse Free Trial](https://clickhouse.cloud/signUp?loc=doc-card-banner).
- **Redis**: You can also try Redis for free at [Redis Free Trial](https://redis.com/try-free/).

Alternatively, if you prefer, you can deploy a local Kafka and Redis cluster using Docker Compose.

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/Stefen-Taime/Real-Time-Data-Pipeline-Snake-Game.git
   ```
2. Navigate to the cloned directory:
   ```
   cd Real-Time-Data-Pipeline-Snake-Game
   ```
3. Your directory should look like this:
   ```
   .
   ├── app.py
   ├── dashboard
   │   ├── index.html
   │   ├── package.json
   │   ├── package-lock.json
   │   ├── scoreboard.css
   │   ├── scoreboard.js
   │   └── unnamed.png
   ├── Dockerfile
   ├── flink-cluster
   │   ├── docker-compose.yml
   │   ├── jobs
   │   │   └── job.sql
   │   ├── LICENSE
   │   ├── README.md
   │   └── sql-client
   │       └── Dockerfile
   ├── requirements.txt
   ├── static
   │   ├── img.jpg
   │   ├── snake.js
   │   └── style.css
   └── templates
       └── index.html
   ```


### Configuring ClickHouse to import real-time data from Kafka
To configure ClickHouse to import real-time data from Kafka, follow these steps:

1. Access the ClickHouse web console.
2. Open the SQL console.
3. On the left-hand side of the interface, select the 'Import' option.
4. Choose 'Kafka' as import source.
5. Enter the necessary credentials:
   - API Key
   - API Secret
   - Servers
   - Integration Name
6. In the next step, select the 'SUMMARY_STATS_TOPIC' topic in JSON format.

### Setting Up
1. Go to Confluent Cloud and create two topics: `game_over_topic` and `SUMMARY_STATS_TOPIC`.
2. In the `app.py` file, fill in the connection values for Redis and Kafka.
3. Build and start the Flask API and game server:
   ```
   docker build -t my-flask-app .
   docker run -p 5000:5000 my-flask-app
   ```
   Once done, navigate to `localhost:5000` to see the game interface.
   ![Architecture Splunk](img/game1.png)

### Running the Pipeline

1. In a separate terminal, navigate to the `flink-cluster` directory and start the Flink cluster locally:
   ```
   docker-compose up --build -d
   ```
2. Submit the Flink job:
   ```
   docker exec -it <container_id> /opt/flink/bin/sql-client.sh embedded -f job.sql
   ```
   You can check `localhost:8081` to see if the job is running correctly.
   ![Architecture Splunk](img/flink.png)

### Dashboard

1. Navigate to the `dashboard` directory and execute the dashboard application to view real-time player rankings:
   ```
   npm install chart.js
   python -m http.server
   ```
2. Access it on port 8000.
   ![Architecture Splunk](img/dashboard.png)
4. Refresh the page to switch users when playing game on port 5000.
5. You can also check your topics after each game over to view the data.
   
   
