FROM node:0.12.6

WORKDIR /app
ADD package.json /app/
RUN npm install
ADD . /app
RUN npm test

WORKDIR /work
ENTRYPOINT ["/app/revelry.js"]
