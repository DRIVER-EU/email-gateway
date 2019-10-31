@echo off
echo Generate SWAGGER code files.

echo Start mail server in background
cd mail-manager\mail-server-api
START /B npm run start >NUL 2>&1

cd ..
cd server
echo Building REST client Mail Server Management API
npm run generate-rest
