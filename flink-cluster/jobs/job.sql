-- read in the data from the source in kafka
CREATE TABLE game_over (
  user_id STRING,
  username STRING,
  score INT,
  level INT,
  losses INT,
  duration DOUBLE,
  proctime AS PROCTIME()
) WITH (
  'connector' = 'kafka',
  'topic' = 'game_over_topic',
  'properties.bootstrap.servers' = '',
  'properties.group.id' = 'demoGroup',
  'scan.startup.mode' = 'earliest-offset',
  'properties.security.protocol' = 'SASL_SSL',
  'properties.sasl.mechanism' = 'PLAIN',
  'properties.sasl.jaas.config' = 'org.apache.kafka.common.security.plain.PlainLoginModule required username="" password="";',
  'format' = 'json'
);
-- create a view LOSSES_PER_USER
CREATE VIEW LOSSES_PER_USER AS 
  SELECT 
    username, 
    COUNT(*) AS total_losses 
  FROM game_over 
  GROUP BY username;

-- create a view SUMMARY_STATS_TOPIC
CREATE VIEW SUMMARY_STATS_TOPIC AS 
  SELECT
    username, 
    MAX(score) AS highest_score_value,
    MAX(level) AS highest_level_value,
    COUNT(*) AS total_losses_value,
    MAX(duration) AS longest_duration_value
  FROM game_over 
  GROUP BY username;


-- create a kafka sink table
CREATE TABLE kafka_summary_stats (
  username STRING,
  highest_score_value INT,
  highest_level_value INT,
  total_losses_value BIGINT,
  longest_duration_value DOUBLE,
  PRIMARY KEY (username) NOT ENFORCED
) WITH (
  'connector' = 'upsert-kafka',
  'topic' = 'SUMMARY_STATS_TOPIC',
  'properties.bootstrap.servers' = '',
  'properties.group.id' = 'demoGroup',
  'properties.security.protocol' = 'SASL_SSL',
  'properties.sasl.mechanism' = 'PLAIN',
  'properties.sasl.jaas.config' = 'org.apache.kafka.common.security.plain.PlainLoginModule required username="" password="";',
  'value.format' = 'json',
  'key.format' = 'json'
);

-- insert the aggregated records into the kafka sink table
INSERT INTO kafka_summary_stats
SELECT * FROM SUMMARY_STATS_TOPIC;



