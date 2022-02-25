FROM roundcube/roundcubemail:latest

MAINTAINER DRIVER-EU
# https://github.com/roundcube/roundcubemail-docker
# https://github.com/stremlau/html5_notifier

LABEL name="RoundCube drive-eu"
LABEL version="1.0"
LABEL description="RoundCube drive-eu"
RUN RUN set -ex; \
    apt-get update; \
	apt-get install -y dos2unix; \
    apt-get install -y --no-install-recommends \
    apt-get install -y git; \
	composer   --working-dir=/usr/src/roundcubemail/ --prefer-dist --prefer-stable  --update-no-dev --no-interaction --optimize-autoloader require kitist/html5_notifier
	
COPY roundcube_logo.png /var/www/html/skins/larry/images/roundcube_logo.png
COPY roundcube_logo.png /usr/src/roundcubemail/skins/larry/images/
COPY CustomModifications.sh /CustomModifications.sh 
RUN dos2unix /CustomModifications.sh 
RUN sed -i.bak '/^exec/i echo Modified version of RoundCube ' /docker-entrypoint.sh 
RUN sed -i.bak '/^exec/i bash /CustomModifications.sh ' /docker-entrypoint.sh 

