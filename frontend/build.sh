#! /bin/bash

envToDeploy=${DEPLOY_ENV:-local}

echo "ENV TO DEPLOY TO: '${envToDeploy}'"

rm -rf docker/tmp
mkdir docker/tmp

./transpileApp.sh

cp -r ./dist/ docker/tmp

cd docker
docker build . -f Dockerfile.ReactApp -t csubmssbu-react-app \
--no-cache --platform linux/arm64 --build-arg="ARCH=linux/arm64"
