FROM node:18.17.0-alpine

WORKDIR /app

COPY package*.json ./
COPY --chown=node:node . .
RUN npm install

COPY . .

EXPOSE 9000

# # add this line
# RUN apt-get update -y && apt-get install -y openssl


CMD ["npm", "run", "start:dev"]

