#!/bin/bash
# Dev runner for DB
# Example usage: cd inf/db && bash scripts/run.sh
# This script will clean up any existing containers and run a new one

ORIGIN=$(pwd)

echo "Build container, if needed"

parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
db_path=$( cd "$parent_path/.." ; pwd -P )

bash "$parent_path/stop.sh"

cd "$db_path"
bash "$parent_path/build.sh"

cd "$ORIGIN"

echo "Running Postgres Docker container.."

docker run -p 5432:5432 --name csumbdbpg \
 -e POSTGRES_DB=csumb_webapp \
 -e POSTGRES_PASSWORD=my-secret-pw \
 -d csumbdb

echo "Wait for a sec..."
sleep 5

echo "Check if container is up"
dockerIsUp=$(docker ps | grep "csumbdbpg")

if [[ $? -ne 0 ]];then
  echo "Container did not come up!"
  docker logs csumbdbpg
  exit 1
else
  echo "Container is up! $dockerIsUp"
fi

echo "Test port bind 5432"
nc -zv localhost 5432

if [[ $? -ne 0 ]];then
  echo "Failed to connect to port 5432!"
  exit 1
else
  echo "Container is up and available for connections on port 5432!"
fi
