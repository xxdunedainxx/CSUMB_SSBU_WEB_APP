# Dev runner for DB
# Example usage: ./inf/db/scripts/run.sh
# This script will clean up any existing containers and run a new one
# TODO - Improvement - add option for building a new container + running it

echo "Runniing Postgres Docker container.."

docker stop csumbdbpg && docker rm csumbdbpg && echo "Stopped and removed running postgres containers" \
 || echo "No running postgres container detected"

docker run -p 5432:5432 --name csumbdbpg -e POSTGRES_DB=test -e POSTGRES_PASSWORD=my-secret-pw -d csumbdb

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