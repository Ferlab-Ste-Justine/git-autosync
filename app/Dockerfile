FROM node:14

COPY package.json package-lock.json /home/node/src/

WORKDIR /home/node/src

RUN npm install --prod

COPY src/ /home/node/src/

CMD ["node", "index.js"]