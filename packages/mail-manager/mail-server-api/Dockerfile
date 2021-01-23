# TODO Create build docker image and a production docker image 


# Based on debian:stretch-slim
# FROM debian:stretch-slim
FROM tvial/docker-mailserver:latest
# FROM docker.io/mailserver/docker-mailserver:latest

MAINTAINER DRIVER-EU

LABEL name="MAIL SERVICE"
LABEL version="1.0"
LABEL description="MAIL SERVICE"


# Default packages
RUN apt-get update && apt-get install -y curl software-properties-common dos2unix
# install nodejs
RUN curl -sL https://deb.nodesource.com/setup_12.x | /bin/bash -
RUN apt-get install nodejs


RUN mkdir -p /home/node/app/node_modules 

# Create app directory
WORKDIR /home/node/app

# Install app dependencies
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# Copy local files to docker:
#.dockerignore holds directories that are skipped
COPY  . .

COPY mail-manager-app.conf /etc/supervisor/conf.d/

# Global rule for all mails
# COPY mailserver/dovecot/sieve/10-sent.sieve /usr/lib/dovecot/sieve-global/before/

COPY mailserver/addmailuserandsieve /usr/local/bin/addmailuserandsieve

RUN dos2unix /usr/local/bin/addmailuserandsieve
RUN dos2unix /etc/supervisor/conf.d/mail-manager-app.conf
# RUN dos2unix /usr/lib/dovecot/sieve-global/before/10-sent.sieve
RUN dos2unix /home/node/app/*.sh
RUN chmod +x /usr/local/bin/addmailuserandsieve

RUN npm run build

RUN mkdir /tmp/docker-mailserver 

EXPOSE 3000

CMD ["supervisord", "-c", "/etc/supervisor/supervisord.conf"]

# ENTRYPOINT ["/bin/sh"]
# ENTRYPOINT ["npm", "run", "start:prod"]
