echo "Publish to driver-eu hub.docker.com"
docker login
npm run docker:publish
pause