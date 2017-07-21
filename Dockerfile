FROM node:8
LABEL maintainer="Denis Carriere <@DenisCarriere>"

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install
RUN npm install pm2 -g

# Bundle app source
COPY . /usr/src/app

# Start App
EXPOSE 8089
CMD ["pm2-docker", "process.yml"]
