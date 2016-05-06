/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/formidable/formidable.d.ts" />
"use strict";
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
function serverHandler(req, res) {
    console.dir(req.url);
    var url = url_module.parse(req.url, true);
    console.dir(url);
    var jpgFile = url.query.jpgFile;
    var token = url.query.token;
    var customParam = url.query.customParam;
    if (url.pathname == '/crossdomain.xml') {
        res.writeHead(200, { "Content-Type": "text/xml" });
        var fileStream = fs.createReadStream('crossdomain.xml');
        fileStream.on('data', function (data) {
            res.write(data);
        });
        fileStream.on('end', function () {
            res.end();
        });
    }
    else if (url.pathname == '/upload' && req.method.toLowerCase() == 'post') {
        handleUpload(req, res, jpgFile, token);
    }
    else {
        res.writeHead(200, { 'content-type': 'text/html' });
        res.end("LVK thumbs server");
    }
}
function handleUpload(req, res, jpgFile, token) {
    if (!checkToken(jpgFile, token, process.env.SECRET)) {
        console.log("wrong_token");
        res.end("wrong_token");
        return;
    }
    var form = new formidable.IncomingForm();
    form.maxFields = 1;
    form.uploadDir = "/tmp_files";
    form.parse(req, function (err, fields, files) {
        var file = files["file"];
        var tmpPath = file.path;
        var subDir = makeSubpath(token);
        var newDir = '/files/' + subDir;
        var newPath = newDir + "/" + jpgFile;
        fs.exists(newDir, function (exists) {
            if (!exists) {
                console.log("Folder " + newDir + " not exist");
                mkdirp(newDir, function (err) {
                    if (err) {
                        res.end("cant_create_subdir");
                        console.error(err);
                    }
                    else {
                        moveFile(tmpPath, newPath);
                    }
                });
            }
            else {
                moveFile(tmpPath, newPath);
            }
        });
        res.writeHead(200, { 'content-type': 'text/plain' });
        res.end(JSON.stringify({ ok: true, url: subDir + "/" + jpgFile }));
    });
    form.on('error', function (err) {
        console.error(err);
    });
}
function checkToken(jpgFile, token, secret) {
    if (secret === void 0) { secret = "SECRET"; }
    if (jpgFile === undefined || token === undefined) {
        return false;
    }
    if (token == md5(jpgFile + secret)) {
        return true;
    }
    return false;
}
function md5(s) {
    var md5Hash = crypto.createHash("md5");
    md5Hash.update(s);
    return md5Hash.digest('hex');
}
function makeSubpath(s) {
    return s.substr(0, 2) + "/" + s.substr(2, 2);
}
function moveFile(oldPath, newPath) {
    var readStream = fs.createReadStream(oldPath);
    var writeStream = fs.createWriteStream(newPath);
    readStream.pipe(writeStream);
    readStream.on('end', function () {
        fs.unlink(oldPath, function (err) {
            if (err) {
                console.log(err);
            }
        });
    });
}
//# sourceMappingURL=app.js.map