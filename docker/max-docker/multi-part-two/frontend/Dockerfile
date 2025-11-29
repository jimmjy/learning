FROM node:22

WORKDIR /app

COPY package.json .

RUN npm i

COPY . .

VOLUME [ "/app/node_modules" ]

EXPOSE 3000

CMD [ "npm", "start" ]
