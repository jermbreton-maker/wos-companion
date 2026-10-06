@echo off
setlocal
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":4173 .*LISTENING"') do taskkill /PID %%P /F >nul 2>&1
set "APP_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%APP_NODE%" (
  for /f "delims=" %%N in ('where node 2^>nul') do if not defined APP_NODE_FOUND set "APP_NODE_FOUND=%%N"
  if defined APP_NODE_FOUND set "APP_NODE=%APP_NODE_FOUND%"
)
if not exist "%APP_NODE%" (
  echo Impossible de trouver le moteur necessaire au lancement.
  echo Ouvre Whiteout Companion depuis Codex ou installe Node.js.
  pause
  exit /b 1
)
start "Whiteout Companion" /min "%APP_NODE%" "%~dp0work\server-node.js"
timeout /t 1 /nobreak >nul
start "" "http://127.0.0.1:4173/"
endlocal
