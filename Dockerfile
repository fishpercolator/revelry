FROM node:0.12.6
MAINTAINER Rich Daley <rich@fishpercolator.co.uk>

RUN npm install -g grunt-cli

WORKDIR /app
ADD package.json /app/
ADD Gruntfile.js /app/
RUN npm install
RUN grunt subgrunt
ADD . /app
RUN grunt nodeunit

WORKDIR /work
ENTRYPOINT ["/app/revelry.js"]
