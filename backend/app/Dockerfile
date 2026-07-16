# docker build -t csumbssbu_backend .
# docker run -e "CONF_FILE=$(cat ./conf.json)" csumbssbu_backend

ARG ARCH=linux/arm64
FROM --platform=$ARCH python:3.8

ENV CONF_FILE="none"

COPY ./scripts/setup.sh ./setup.sh
COPY ./scripts/run.sh ./run.sh
COPY app.py ./app.py
COPY toggles.json ./toggles.json
COPY src/ src/

RUN ./setup.sh

ENTRYPOINT ["./run.sh"]