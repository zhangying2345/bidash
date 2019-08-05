FROM node:8-alpine
RUN mkdir /home/nodejs
WORKDIR /home/nodejs
ARG NPM_TOKEN
COPY package.json ./
COPY .npmrc ./
RUN npm i
RUN rm -f .npmrc
COPY . .

# Served port number despends on config.yml, use docker volumes to bind it from host OS
CMD node --inspect=0.0.0.0:9229 app/index.js
