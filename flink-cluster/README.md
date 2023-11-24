## What this does

The code in this repo uses Docker Compose to start up a small Flink cluster and Flink's SQL Client.

## How to get it running

First build the image and start all of the containers:

```bash
docker compose up --build -d
```

will drop you into the Flink SQL Client, where you can interact with Flink SQL,

```bash
docker exec -it ­<container_id> /opt/flink/bin/sql-client.sh embedded -f job.sql
```

