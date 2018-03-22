FROM node:9
MAINTAINER Rich Daley <rich@fishpercolator.co.uk>

WORKDIR /app
ADD package.json yarn.lock /app/
RUN yarn
ADD . /app
RUN yarn run test

WORKDIR /work
ENTRYPOINT ["/app/revelry.js"]
