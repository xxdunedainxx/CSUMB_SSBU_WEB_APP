#! /bin/bash

#########
#
# Author: Zach McFadden
# Date: 2/16/26
# Synopsis: Script for running ONLY integration tests. This will skip e2e and unit testing.
# Example usage: ./test/scripts/integration_tests.sh  ( relative path must be 'backend/app/' )
#                ./test/scripts/integration_tests.sh "YES" /usr/bin/python3
#########

export INTEGRATION_TESTING_ENABLED=true
export END_TO_END_TESTING_ENABLED=false
export UNIT_TESTING_ENABLED=false

ALL_ON_ONE_MACHINE_ARG="${1:-NO}"
PYTHON_INTERPRETER="${2:-python3}"

function postGresSetup(){
  back=$(pwd)

  cd ../..
  # Startup a postgres container
  echo "Init post gres container"

  cd ./inf/db

  # Run it
  ./scripts/run.sh

  cd $back

  echo "Dependency setup complete"
}

function setupBackendPythonApp(){
  echo "SETUP BACKEND PYTHON APP"
  nohup ${PYTHON_INTERPRETER} app.py  > backend.log 2>&1 &
  sleep 2
  echo "Startup info..."
  cat backend.log
  primaryPID=$(cat PRIMARY.PID)
  echo "Running on pid '${primaryPID}'"
}

# Used when integration tests are run on a single machine
function setupDependencies(){
  postGresSetup

  setupBackendPythonApp
}

function cleanup(){
  echo "cleanup"
  ../../inf/db/scripts/stop.sh

  backendPrimaryPID=$(cat PRIMARY.PID)

  echo "Stop backend PID ${backendPrimaryPID}"

  kill -9 $backendPrimaryPID

  echo "Cleanup complete"
}



echo "'ALL_ON_ONE_MACHINE_ARG': $ALL_ON_ONE_MACHINE_ARG"

if [[ $ALL_ON_ONE_MACHINE_ARG == "YES" ]];then
  echo "RUNNING ALL TESTS ON ONE MACHINE, SETUP DEPENDENCIES"
  setupDependencies
  echo "Wait 5 seconds for dependencies to come up..."
  sleep 5
fi

echo "Using python interpreter $PYTHON_INTERPRETER"

${PYTHON_INTERPRETER} test.py && echo "TESTS PASSED" || echo "TESTS FAILED"

cleanup || echo "OH NO, CLEANUP FAILED"