FROM node:lts-alpine AS build

WORKDIR /app

ENV NODE_ENV=production

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
COPY ./src /app/src

RUN npm i --production

RUN npm i -g @vercel/ncc

RUN ncc build src/deta -o dist

FROM node:lts-alpine

WORKDIR /app

COPY --from=build /app/dist/index.js /app/dover.js

CMD [ "node", "/app/dover.js" ]