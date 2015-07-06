FROM google/nodejs

WORKDIR /app
ADD package.json /app/
RUN npm install
ADD . /app
RUN npm test

WORKDIR /work
ENTRYPOINT ["/app/revelry.js"]
