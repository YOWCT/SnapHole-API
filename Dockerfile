FROM node:8
LABEL maintainer="Denis Carriere <@DenisCarriere>"

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

# Start App
EXPOSE 8089
CMD ["npm", "start"]
