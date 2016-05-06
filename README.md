# Live Video Kit Thumbs
This microservice is used for uploading thumbnails from [LVK-client](https://github.com/terbooter/LVK-client) (publisher).

LVK - thumbs consists of two parts:
- Uploader
- Nginx

## Usage
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
