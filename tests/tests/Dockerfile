FROM node:14

COPY package.json  /home/node/src/

WORKDIR /home/node/src

RUN npm install --prod

COPY index.js /home/node/src/

CMD ["node", "index.js"]