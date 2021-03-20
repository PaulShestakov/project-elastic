FROM node:14.15.0-alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock .
RUN yarn && yarn cache clean

COPY ./src ./src

EXPOSE 3000

CMD node ./src/index.js