FROM node:24

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 6000

VOLUME [ "/app/node_modules" ]

CMD [ "npm", "run", "start" ]
