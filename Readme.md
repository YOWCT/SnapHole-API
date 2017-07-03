# Open 311

An app that receives a photo from a client app and sends a request to the City of Ottawa for pot hole repair.

# Open 311 Docs
- http://wiki.open311.org/GeoReport_v2/#post-service-request
- http://data.ottawa.ca/en/dataset/open311

# Open 311 Endpoints
- https://city-of-ottawa-dev.apigee.net/open311/v2/requests.json

# Open 311 Post Request

``` 
POST /dev/v2/requests.xml
Host: api.city.gov
Content-Type: application/x-www-form-urlencoded; charset=utf-8

api_key=xyz&jurisdiction_id=city.gov&service_code=001&lat=37.76524078&long=-122.4212043&address_string=1234+5th+street&email=smit333%40sfgov.edu&device_id=tt222111&account_id=123456&first_name=john&last_name=smith&phone=111111111&description=A+large+sinkhole+is+destroying+the+street&media_url=http%3A%2F%2Ffarm3.static.flickr.com%2F2002%2F2212426634_5ed477a060.jpg&attribute[WHISPAWN]=123456&attribute[WHISDORN]=COISL001

```
# Run the app

## Environment Variables


Add these variables in a file called ```.env```.
```
KEY_PATH=key.pem
CERT_PATH=cert.pem
LOCAL=127.0.0.1
PRODUCTION=prod_ip
DOMAIN=https://example.com
PORT=8089
DB_USER=db_user
DB_HOST=db_ip_or_url
DB_PASS=password

```

- development: ``` npm run dev ```
- stage/docker: 
    1. ``` docker build -t <your username>/ott311 . ```
    2. ``` docker run -p 49160:8089 -d <your username>/ott311 ```
    3. visit ``` localhost:49160 ```

- production: ```NODE_ENV=production pm2 start bin/www --name ott311 --watch ```

* Requires a Mongo DB to run locally. Connection strings are in ``` models/db.js ```. Dockerized version uses prod database.

# Useful docs

- https://medium.com/@adinugroho/upload-image-from-ios-app-using-alamofire-ecc6ad7fccc#.mbzk0125w
- https://github.com/expressjs/multer/blob/master/StorageEngine.md