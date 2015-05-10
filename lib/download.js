'use strict';

/**
 * Dependencies
 */
var fs = require('fs');
var request = require('request');

/**
 * Downloads a file from an url into a given path.
 * It creates a temp file during the download.
 * Returns a string representing the download and accepts a callback
 * that gets executed at the end of the download
 * @async
 * @param {string} url
 * @param {string} path
 * @param {function} cb
 * @returns {Stream}
 */
module.exports = function download(url, path, cb) {
  var tempPath = path + '.download';

  return request(url)
    .pipe(fs.createWriteStream(tempPath))
    .on('close', function onClose() {
      fs.rename(tempPath, path, cb);
    });
};
