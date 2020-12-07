FROM node:latest 

WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json /app/package.json


# RUN npm install -g @angular/cli

# add app
COPY . /app

RUN npm install

# start app
CMD ng serve --host 0.0.0.0
# CMD /bin/bash