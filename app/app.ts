/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/formidable/formidable.d.ts" />

import {IncomingMessage, ServerResponse} from "http";
import {Fields, Files, File} from "formidable";
import {Url} from "url";

var fs = require('fs');
var crypto = require('crypto');
var formidable = require('formidable');
var http = require('http');
var mkdirp = require('mkdirp');
var url_module = require('url');

//Path - full path to file with filename /var/lib/my.xml
//Dir - full path to file without filename and withoud trailing slash /var/lib

var httpServer = http.createServer(serverHandler);
httpServer.listen(80);

function serverHandler(req:IncomingMessage, res:ServerResponse) {
    console.dir(req.url);
    var url:Url = url_module.parse(req.url, true);
    console.dir(url);
    var jpgFile:string = url.query.jpgFile;
    var token:string = url.query.token;
    var customParam:string = url.query.customParam;

    if (url.pathname == '/crossdomain.xml') {
        res.writeHead(200, {"Content-Type": "text/xml"});
        var fileStream = fs.createReadStream('crossdomain.xml');
        fileStream.on('data', function (data) {
            res.write(data);
        });
        fileStream.on('end', function () {
            res.end();
        });
    } else if (url.pathname == '/upload' && req.method.toLowerCase() == 'post') {
        handleUpload(req, res, jpgFile, token);
    } else {
        res.writeHead(200, {'content-type': 'text/html'});
        res.end("LVK thumbs server");
    }
}

function handleUpload(req:IncomingMessage, res:ServerResponse, jpgFile, token) {
    if (!checkToken(jpgFile, token, process.env.SECRET)) {
        console.log("wrong_token");
        res.end("wrong_token");
        return;
    }

    var form = new formidable.IncomingForm();
    form.maxFields = 1;
    form.uploadDir = "/tmp_files";

    form.parse(req, (err, fields:Fields, files:Files)=> {

        var file = files["file"];
        var tmpPath = file.path;
        var subDir = makeSubpath(token);
        var newDir = '/files/' + subDir;
        var newPath = newDir + "/" + jpgFile;

        fs.exists(newDir, (exists:boolean)=> {
            if (!exists) {
                console.log("Folder " + newDir + " not exist");
                mkdirp(newDir, (err)=> {
                    if (err) {
                        res.end("cant_create_subdir");
                        console.error(err);
                    } else {
                        moveFile(tmpPath, newPath);
                    }
                });
            } else {
                moveFile(tmpPath, newPath);
            }
        });

        res.writeHead(200, {'content-type': 'text/plain'});
        res.end(JSON.stringify({ok: true, url: subDir + "/" + jpgFile}));
    });

    form.on('error', (err)=> {
        console.error(err);
    });
}

function checkToken(jpgFile:string, token:string, secret = "SECRET"):boolean {
    if (jpgFile === undefined || token === undefined) {
        return false;
    }

    if (token == md5(jpgFile + secret)) {
        return true;
    }

    return false;
}

function md5(s:string):string {
    var md5Hash = crypto.createHash("md5");
    md5Hash.update(s);
    return md5Hash.digest('hex');
}

function makeSubpath(s:string):string {
    return s.substr(0, 2) + "/" + s.substr(2, 2);
}

function moveFile(oldPath:string, newPath:string) {
    var readStream = fs.createReadStream(oldPath);
    var writeStream = fs.createWriteStream(newPath);

    readStream.pipe(writeStream);
    readStream.on('end', ()=> {
        fs.unlink(oldPath, (err)=> {
            if (err) {
                console.log(err);
            }
        });
    });
}