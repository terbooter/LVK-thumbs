#Live Video Kit Thumbs
Demo: http://terbooter.github.io/LVK-thumbs/
This microservice is part of Live Video Kit (LVK).
LVK helps stream live video in RTMP format
LVK consists of 3 parts:
* [**LVK-server**](https://github.com/terbooter/LVK-server) Based on nginx rtmp module
* [**LVK-client**](https://github.com/terbooter/LVK-client) Has two adobe flash files (publisher.swf and player.swf)
* [**LVK-thumbs**](https://github.com/terbooter/LVK-thumbs) To make thumbnail for live streams


# About
This microservice is used for uploading thumbnails from [LVK-client](https://github.com/terbooter/LVK-client) (publisher).

LVK-thumbs consists of two parts:
* Uploader (nodejs application)
* Nginx

# Usage
Call publisher API method from JS
```
takeScreenshot(uploadURL:String,
               jpgFile:String,
               token:String,
               width:int = 160,
               heigth:int = 120,
               customParam:String = null)
```
to make thumbnail from current publisher video.
After thumbnail uploaded publisher fire "thumb_uploaded" event.
Call getStatus() method to get thumbnail URL

#How to build and start container
* Clone this repo to `/docker-data` directory
* Go to project dir `cd /docker-data/LVK-thumbs/`
* Make file `.dockerenv`
* Set `SECRET` param in `.dockerenv` file
* Create file `docker-compose.override.yml` with following content:
```
nginx:
  ports:
     - "80:80"
```
and change exposed port if needed
* `docker-compose up -d`
* Check crossdomain URL `/crossdomain.xml` (need for flash player secret policy)
* Check `/upload` URL (have to show LVK thumbs server info)

# GET params
publisher.swf sends 3 GET params: 
* `jpgFile` - имя загружаемого файла
* `token` - md5(jpgFile + SECRET) SECRET - переменная окружения устанавливается в файле .dockerenv   
* `customParam` - зарезервировано для передачи дополнительного параметра