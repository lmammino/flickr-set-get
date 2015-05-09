'use strict';

var fs = require('fs');
var request = require('request');

module.exports = function download(url, path, cb) {
  var tempPath = path + '.download';
  request(url)
    .pipe(fs.createWriteStream(tempPath))
    .on('close', function() {
      fs.rename(tempPath, path, cb);
    });
};
