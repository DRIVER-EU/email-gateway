@echo off
echo Generate SWAGGER code files.

echo Start mail server in background
cd mail-manager\mail-server-api
START /B npm run start >NUL 2>&1

cd ./../../server
echo Start mail server gateway in background
START /B npm run start >NUL 2>&1

cd ..
cd server
echo Building REST client Mail Server Management API
npm run generate-rest
echo Building REST client Mail Server Gateway API
cd ./../server-monitor
npm run generate-rest-client
pause