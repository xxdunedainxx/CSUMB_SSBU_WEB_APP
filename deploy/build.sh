#!/bin/bash

echo "BUILD THE ENTIRE APP"


HOME=$(pwd)

function buildDB(){
  echo "Building db container..."


  cd inf/db

  ./scripts/clear.sh
  ./scripts/stop.sh
  ./scripts/build.sh
}


function buildRedis(){
  echo "Building redis container..."


  cd inf/redis

  ./scripts/redis_setup.sh
}

function buildIngress(){
  echo "Building Ingress container..."

  cd inf/ingress
  docker build . -f Dockerfile -t csumbssbu-ingress
}

function buildBackend(){
  echo "Building backend container..."

  cd backend/app
  docker build -t csumbssbu_backend .
}

function buildFrontend(){
  echo "Building frontend container..."

  cd frontend

  ./build.sh
}

buildDB

cd $HOME

buildRedis

cd $HOME

buildIngress

cd $HOME

buildBackend

cd $HOME

buildFrontend