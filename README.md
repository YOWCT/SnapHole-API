# SnapHole API Server

[![Build Status](https://travis-ci.org/YOWCT/SnapHole-API.svg?branch=master)](https://travis-ci.org/YOWCT/SnapHole-API)
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/YOWCT/SnapHole-API/master/LICENSE)

An app that receives a photo from a client app and sends a request to the City of Ottawa for pot hole repair.

## Codeowners

Contact these people for information and ideas about how you may contribute :)

@devisscher, @vatdaell, @jsivakumaran

### Install Dependencies

You must first install all dependencies using the [latest version of NodeJS](https://nodejs.org/en/).  Must have [Docker](https://store.docker.com/search?type=edition&offering=community) and [MongoDB](https://www.mongodb.com/download-center#community) installed beforehand.

Then you must clone 2 repos as follows in the same parent folder.

- 📁 apps
    - 📁 Snaphole-Api
    - 📁 snaphole-webapp


```bash
$ git clone git@github.com:YOWCT/SnapHole-API.git
$ cd SnapHole-API
$ npm install
```

```bash
$ git clone git@github.com:YOWCT/snaphole-webapp.git
$cd snaphole-webapp
$npm install
```


### Environment Variables

Add these variables in a file called `.env` at the root of `SnapHole-Api`. If you don't have credentials, contact someone in the Slack channel #Snap311.

```env
LOCAL=127.0.0.1
PRODUCTION=prod_ip
APP_NAME=SnapHole.io
DOMAIN=http://localhost:8089
PORT=8089
DB_PASSWORD=password
MAILGUN_DOMAIN=mg.snaphole.io
MAILGUN_KEY=key
FROM_EMAIL=accounts@snaphole.io

AWS_BUCKET=snaphole
AWS_ACCESS_KEY_ID=key
AWS_SECRET_ACCESS_KEY=key

```

**Docker Compose (start/stop)**

From `SnapHole-Api`. Start the web server and the client. 

```bash
$ docker-compose up
```

### Start the API only

```bash
$ npm start

> SnapHole-API@0.0.0 prestart /Users/mac/Github/SnapHole-API
> jsdoc services/index.js -d public/docs


> SnapHole-API@0.0.0 start /Users/mac/Github/SnapHole-API
> node ./bin/www

server running on port: 8089
```

Using your favorite web browser visit [`http://localhost:8089`](http://localhost:8089).

If you started the system with docker, you can also visit the client by visiting: [`http://localhost:3000`](http://localhost:3000).

### Client

Refer to the readme in the client app.

## References

### Open 311 Docs
- http://wiki.open311.org/GeoReport_v2/#post-service-request
- http://data.ottawa.ca/en/dataset/open311

### Open 311 Endpoints
- https://city-of-ottawa-dev.apigee.net/open311/v2/requests.json

### Open 311 Post Request

```http
POST /dev/v2/requests.xml
Host: api.city.gov
Content-Type: application/x-www-form-urlencoded; charset=utf-8

api_key=xyz&jurisdiction_id=city.gov&service_code=001&lat=37.76524078&long=-122.4212043&address_string=1234+5th+street&email=smit333%40sfgov.edu&device_id=tt222111&account_id=123456&first_name=john&last_name=smith&phone=111111111&description=A+large+sinkhole+is+destroying+the+street&media_url=http%3A%2F%2Ffarm3.static.flickr.com%2F2002%2F2212426634_5ed477a060.jpg&attribute[WHISPAWN]=123456&attribute[WHISDORN]=COISL001
```

### Useful docs

**Deploy using Heroku**

- https://devcenter.heroku.com/articles/local-development-with-docker-compose
- https://devcenter.heroku.com/articles/container-registry-and-runtime

**Host Images**

- https://medium.com/@adinugroho/upload-image-from-ios-app-using-alamofire-ecc6ad7fccc
- https://github.com/expressjs/multer/blob/master/StorageEngine.md

**IOS**

- https://youtu.be/zAWO9rldyUE
- http://jayeshkawli.ghost.io/ios-custom-url-schemes/

**Create React App && Docker**

- https://www.peterbe.com/plog/how-to-create-react-app-with-docker
