FROM node:18

WORKDIR /app

COPY  package.json .

RUN npm i

COPY . .

VOLUME [ "/app/node_modules" ]

EXPOSE 4000

CMD [ "npm", "start" ]
