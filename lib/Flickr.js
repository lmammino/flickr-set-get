'use strict';

/**
 * Dependencies
 */
var async = require('async');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var _path = require('path');
var request = require('request');
var util = require('util');
var buildUrl = require('./apiUrlBuilder');
var download = require('./download.js');

/**
 * Class that defines allows to download an entire set of photos from
 * a given Flickr set.
 *
 * Available options:
 *   - concurrency {number} the maximum number of concurrent http requests (default: 10)
 *   - outputDir {string} the path where to save the images (default: ".")
 *   - size {string} The size of the image to download (eg. "Original", "Large", "Medium", etc.)
 *   - noOverwrite {boolean} if true avoids to override already existing files (default: false)
 *
 * @class Flickr
 * @param {string} apiKey the apikey to access the Flickr api
 * @param {Object} options an array of options
 * @returns {Flickr}
 * @constructor
 */
function Flickr(apiKey, options) {
  var _this = this;

  options = options || {};
  var defaultOptions = {
    concurrency: 10,
    outputDir: './',
    size: 'Original',
    noOverwrite: false
  };

  _this.apiKey = apiKey;
  _this.options = util._extend(defaultOptions, options);

  /**
   * Parse a Flickr api response and throws in case of error or
   * return the api response data
   * @internal
   * @param {Error} error
   * @param {object} response
   * @param {string} body
   * @param {string} url
   * @return {object}
   */
  function parseResponse(error, response, body, url) {
    if (error || response.statusCode !== 200) {
      throw new Error('Unexpected error with getInfo request (' + url + ')');
    }

    var data = JSON.parse(body);
    if (data.stat === 'fail') {
      throw new Error('Error with flickr API: ' + data.message + ' (' + url + ')');
    }

    return data;
  }

  /**
   * Get the information about a given Flickr set (identified by `setId` and `userId`).
   * Sets response can be paginated, this function extracts only a given page of the set.
   * @internal
   * @async
   * @param {string} setId
   * @param {string} userId
   * @param {number} page
   * @param {function} cb
   */
  function getSetInfoPage(setId, userId, page, cb) {
    var url = buildUrl(_this.apiKey, 'flickr.photosets.getPhotos', {
      photoset_id: setId,
      user_id: userId,
      page: page
    });

    request(url, function onRequestCompleted(error, response, body) {
      var data;

      try {
        data = parseResponse(error, response, body, url);
      } catch (err) {
        return cb(err);
      }

      var info = {
        title: data.photoset.title,
        total: data.photoset.total,
        ownername: data.photoset.ownername,
        photos: data.photoset.photo,
        pages: data.photoset.pages
      };

      cb(null, info);
    });
  }

  /**
   * Get the information about a given Flickr set (identified by `setId` and `userId`).
   * It differs from `getSetInfoPage()` because it starts from the first page and iterates
   * through all the available page, reconstructing the entire set info
   * @internal
   * @async
   * @param {string} setId
   * @param {string} userId
   * @param {function} cb
   */
  function getSetInfo(setId, userId, cb) {
    getSetInfoPage(setId, userId, 1, function onGetFirstPage(err, info) {
      if (!err && info.pages > 1) {

        // Creates the tasks to get the photos from all the pages of the se
        // it will use async.series to run the tasks in series
        var tasks = [];
        for (var page = 2; page <= info.pages; page++) {
          tasks.push(

            (function buildTask(page) {
              return function task(callback) {
                getSetInfoPage(setId, userId, page, function onGetNthPage(err, newInfo) {

                  if (err) {
                    return callback(err);
                  }

                  info.photos = info.photos.concat(newInfo.photos);
                  callback(null, newInfo.photos);
                });
              }
            })(page)

          );

        }

        async.series(tasks, function onTasksCompleted(err, data) {
          cb(err, info);
        });

      } else {
        cb(err, info);
      }
    });
  }

  /**
   * Call the Flickr api to find out the sizes (and the related urls) of a
   * given photo
   * @internal
   * @async
   * @param {string} photoId
   * @param {function} cb
   */
  function getPhotoSizes(photoId, cb) {
    var url = buildUrl(_this.apiKey, 'flickr.photos.getSizes', {
      photo_id: photoId
    });

    request(url, function onRequestCompleted(error, response, body) {
      var data;
      try {
        data = parseResponse(error, response, body, url);
      } catch (err) {
        return cb(err);
      }

      var sizes = {};

      for (var i = 0; i < data.sizes.size.length; i++) {
        sizes[data.sizes.size[i].label] = data.sizes.size[i];
      }

      cb(null, sizes);
    });
  }

  /**
   * Starts the download of the photos from a given Flickr set.
   * Triggers events during the whole process
   * @param {string} setId
   * @param {string} userId
   * @return {Flickr}
   */
  _this.downloadSet = function downloadSet(setId, userId) {

    if (!fs.existsSync(_this.options.outputDir)) {
      fs.mkdirSync(_this.options.outputDir);
    }

    getSetInfo(setId, userId, function onGetSetInfo(err, info) {
      if (err) {
        return _this.emit('error', err);
      }

      _this.emit('setInfo', info);

      var tasks = info.photos.map(function mapTasks(currentValue, index, array) {
        var photoId = currentValue.id;
        return function asyncTask(cb) {
          getPhotoSizes(photoId, function onGetPhotoSizes(err, sizes) {

            if (err) {
              _this.emit('error', err);
              return cb(err);
            }

            _this.emit('photoSizes', photoId, sizes);

            if (!sizes[_this.options.size]) {
              var sizeErr = new Error('Size "' + _this.options.size + '" not available');
              _this.emit('error', sizeErr);

              return cb(sizeErr);
            }

            var path = _path.join(_this.options.outputDir, photoId + '.jpg');
            if (_this.options.noOverwrite && fs.existsSync(path)) {
              _this.emit('photoSkipped', photoId, path);
              return cb(null, path);
            }

            download(sizes[_this.options.size].source, path, function onDownloadComplete() {

              if (err) {
                _this.emit('error', err);
                return cb(err);
              }

              _this.emit('photoDownloaded', photoId, path);
              cb(null, path);
            });
          });
        };
      });

      async.parallelLimit(tasks, _this.options.concurrency, function onTasksCompleted(err, results) {
        _this.emit('done', results);
      });
    });

    return this;
  };

  return _this;
}

util.inherits(Flickr, EventEmitter);

module.exports = Flickr;
