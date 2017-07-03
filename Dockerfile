FROM node:boron
# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install
RUN npm install nodemon -g

# Bundle app source
COPY . /usr/src/app

EXPOSE 8089
CMD ["npm", "start"]
#CMD [ "nodemon", "bin/www --watch" ]