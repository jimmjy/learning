FROM node:24.4.0-alpine3.21

WORKDIR /app

COPY ./package*.json .

RUN npm install 

COPY . .

RUN npm run build

EXPOSE 8000

CMD [ "npm", "run", "dev-docker"]


