@echo off
setlocal
cd /d "%~dp0"

echo === Reportes CIE: instalar dependencias ===
node -v >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js no esta instalado. Instale Node 20 LTS o 22 LTS desde https://nodejs.org
  exit /b 1
)

node -e "const v=process.version.slice(1).split('.').map(Number); if(v[0]<20||(v[0]===20&&v[1]<19)){console.error('ERROR: Node '+process.version+' — se requiere v20.19.0 o superior');process.exit(1);} console.log('Node OK:', process.version);"
if errorlevel 1 exit /b 1

if exist node_modules (
  echo Eliminando node_modules anterior...
  rmdir /s /q node_modules
)

if exist package-lock.json (
  echo npm ci --omit=dev ...
  call npm ci --omit=dev
) else (
  echo npm install --omit=dev ...
  call npm install --omit=dev
)
if errorlevel 1 exit /b 1

echo Probando driver SQL...
node -e "require('mssql'); console.log('mssql OK');"
if errorlevel 1 (
  echo ERROR: no se pudo cargar mssql. Revise la version de Node.
  exit /b 1
)

echo.
echo Listo. Ejecute: node server.js
exit /b 0
