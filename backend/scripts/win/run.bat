@echo off
REM Windows-compatible run.bat — installs required Python packages

setlocal

REM Try to find a Python 3 interpreter: python, python3, or py -3
where python >nul 2>&1
if %ERRORLEVEL%==0 (
  set "PY=python"
) else (
  where python3 >nul 2>&1
  if %ERRORLEVEL%==0 (
    set "PY=python3"
  ) else (
    where py >nul 2>&1
    if %ERRORLEVEL%==0 (
      set "PY=py"
      set "PY_ARGS=-3"
    ) else (
      echo No Python installation detected. Please install Python 3 and retry.
      exit /b 1
    )
  )
)

echo Using interpreter: %PY% %PY_ARGS%

REM Make sure pip is available and upgraded
if defined PY_ARGS (
  %PY% %PY_ARGS% -m ensurepip --upgrade >nul 2>&1
  %PY% %PY_ARGS% -m pip install -U pip
) else (
  %PY% -m ensurepip --upgrade >nul 2>&1
  %PY% -m pip install -U pip
)

REM Install required packages
if defined PY_ARGS (
  %PY% %PY_ARGS% -m pip install requests flask flask-cors psycopg2 email-validator
) else (
  %PY% -m pip install requests flask flask-cors psycopg2 email-validator
)

echo Done.
endlocal
exit /b 0
