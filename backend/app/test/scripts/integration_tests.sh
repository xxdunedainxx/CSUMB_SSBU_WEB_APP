#! /bin/bash

#########
#
# Author: Zach McFadden
# Date: 2/16/26
# Synopsis: Script for running ONLY integration tests. This will skip e2e and unit testing.
# Example usage: ./test/scripts/integration_tests.sh  ( relative path must be 'backend/app/' )
#
#########

export INTEGRATION_TESTING_ENABLED=true
export END_TO_END_TESTING_ENABLED=false
export UNIT_TESTING_ENABLED=false

# TODO - requires a Test DB To be up
python3 test.py