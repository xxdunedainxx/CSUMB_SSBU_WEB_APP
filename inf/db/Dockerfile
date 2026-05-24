# Ex run: docker run -p 5432:5432 --name csumbdbpg -e POSTGRES_PASSWORD=my-secret-pw -d csumbdb
# Listens on 5432 by default
# Ex build: docker build . -t csumbdb
# Example cli from inside container: psql -U postgres -d csumb_webapp

ARG MODE=dev
FROM postgres:14.21-trixie as pg-base

# Placing SQL here, postgres will auto run them
COPY sql/01.createDb.sql /docker-entrypoint-initdb.d/01.createDb.sql
COPY sql/02.createTestTable.sql /docker-entrypoint-initdb.d/02.createTestTable.sql
COPY sql/03.createMainTables.sql /docker-entrypoint-initdb.d/03.createMainTables.sql

# Image logic
FROM pg-base AS pg-dev
COPY sql/04.seedTestData.sql /docker-entrypoint-initdb.d/04.seedTestData.sql
# Prod Image Logic
FROM pg-base AS pg-prod

FROM pg-${MODE} AS pg-final