# Ex run: docker run -p 5432:5432 --name csumbdbpg -e POSTGRES_PASSWORD=my-secret-pw -d csumbdb
# Listens on 5432 by default
# Ex build: docker build . -t csumbdb
FROM postgres:14.21-trixie

COPY sql/TEST_DB.sql /docker-entrypoint-initdb.d/TEST_DB.sql