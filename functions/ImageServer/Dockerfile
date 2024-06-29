FROM --platform=linux/amd64 node:lts-alpine

EXPOSE 5488

WORKDIR /srv

COPY . /srv

RUN npm install

CMD [ "node", "server.js" ]
