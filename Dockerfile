FROM node:12

WORKDIR /usr/app/src

COPY package*.json ./

RUN npm install

COPY . .

ENTRYPOINT npm run start
