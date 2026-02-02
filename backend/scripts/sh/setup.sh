#! /bin/bash

PYTHON_INTERPRETER=($(which python3 || which python))

# TODO - setup script improvement - windows support?
if [[ $? != 0 ]];then
 echo "No python installation detected, trying to install.."
 if [[ $(uname -s) == 'Darwin' ]]; then
   brew install python3
 else
   # Assume ubuntu container
   apt-get install python3
 fi
fi

echo $PYTHON_INTERPRETER

#${PYTHON_INTERPRETER} -m pip install -U --force-reinstall pip
${PYTHON_INTERPRETER} -m pip install requests
${PYTHON_INTERPRETER} -m pip install flask
${PYTHON_INTERPRETER} -m pip install flask-cors
