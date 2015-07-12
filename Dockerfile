FROM node:0.12.6
MAINTAINER Rich Daley <rich@fishpercolator.co.uk>

WORKDIR /app
ADD package.json /app/
RUN npm install --unsafe-perm
ADD . /app
RUN npm test

WORKDIR /work
ENTRYPOINT ["/app/revelry.js"]
