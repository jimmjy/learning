FROM node:22

WORKDIR /app

COPY package.json .

RUN npm i

COPY . .

VOLUME [ "/app/node_modules" ]

CMD [ "npm", "start" ]
