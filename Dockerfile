FROM node:lts-alpine

WORKDIR /app

ENV NODE_ENV production

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
COPY ./src /app/src

RUN npm i --production

CMD [ "node", "src/deta.js" ]