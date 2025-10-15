# use this empty Dockerfile to build your assignment
FROM node:24

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 3000

CMD [ "npm", "run", "start" ]

# NOTE: The instructions are now in the README.md file in this directory.
