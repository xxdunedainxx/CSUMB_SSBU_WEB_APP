# Ex run: docker run -p 5432:5432 --name csumbdbpg -e POSTGRES_PASSWORD=my-secret-pw -d csumbdb
# Listens on 5432 by default
# Ex build: docker build . -t csumbdb
FROM postgres:14.21-trixie

# Placing SQL here, postgres will auto run them
COPY sql/01.createDb.sql /docker-entrypoint-initdb.d/01.createDb.sql
COPY sql/02.createTestTable.sql /docker-entrypoint-initdb.d/02.createTestTable.sql
COPY sql/03.createMainTables.sql /docker-entrypoint-initdb.d/03.createMainTables.sql

# Copy backup script into container for periodic backups
COPY scripts/backup.sh backup.sh