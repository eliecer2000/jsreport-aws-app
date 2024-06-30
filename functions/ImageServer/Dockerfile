FROM --platform=linux/amd64 node:lts-alpine

EXPOSE 5488

# WORKDIR /usr/src/app

COPY . .

RUN npm install

# ENTRYPOINT [ "npm", "start" ]
CMD [ "node", "server.js" ]
