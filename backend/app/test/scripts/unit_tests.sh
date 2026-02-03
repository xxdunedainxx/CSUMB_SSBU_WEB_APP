#! /bin/bash

#########
#
# Author: Zach McFadden
# Date: 2/2/26
# Synopsis: Script for running ONLY unit tests. This will skip e2e and integration testing.
# Example usage: ./test/scripts/unit_tests.sh  ( relative path must be 'backend/app/' )
#
#########

export INTEGRATION_TESTING_ENABLED=false
export END_TO_END_TESTING_ENABLED=false
export UNIT_TESTING_ENABLED=true

python3 test.py