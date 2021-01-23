docker login
docker build -t driver-roundcube .
docker tag driver-roundcube drivereu/driver-roundcube
docker push drivereu/driver-roundcube
pause