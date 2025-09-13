FROM node:20

# set the working directory in container
WORKDIR /app

COPY package.json /app

# from /app run npm install 
RUN npm install 

# copy everything from this base to /app folder in container
# we have this at the bottom due to cache and speed, the steps above will happen faster
# as these files are all that will change typically
COPY . /app

# which port the container is listening on
EXPOSE 80 

CMD [ "node", "server.js" ]

