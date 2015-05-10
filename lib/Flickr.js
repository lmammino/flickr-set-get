'use strict';

/**
 * Dependencies
 */
var EventEmitter = require('events').EventEmitter;
var async = require('async');
var util = require('util');
var request = require('request');
var buildUrl = require('./apiUrlBuilder');
var download = require('./download.js');

/**
 * Class that defines allows to download an entire set of photos from
 * a given Flickr set.
 * @class Flickr
 * @param {string} apiKey the apikey to access the Flickr api
 * @param {number} concurrency the maximum number of concurrent requests
 * @returns {Flickr}
 * @constructor
 */
function Flickr(apiKey, concurrency) {
  var _this = this;

  _this.apiKey = apiKey;
  _this.concurrency = concurrency || 10;

  /**
   * Parse a Flickr api response and throws in case of error or
   * return the api response data
   * @internal
   * @param {Error} error
   * @param {object} response
   * @param {string} body
   * @return {object}
   */
  function parseResponse(error, response, body) {
    if (error || response.statusCode !== 200) {
      throw new Error('Unexpected error with getInfo request');
    }

    var data = JSON.parse(body);
    if (data.stat === 'fail') {
      throw new Error('Error with flickr API: ' + data.message);
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
        data = parseResponse(error, response, body);
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
        data = parseResponse(error, response, body);
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

  // TODO support destDir, size and noOverride options
  // TODO check if a photo is not downloadable
  /**
   * Starts the download of the photos from a given Flickr set.
   * Triggers events during the whole process
   * @param {string} setId
   * @param {string} userId
   * @param {object} [options]
   * @return {Flickr}
   */
  _this.downloadSet = function downloadSet(setId, userId, options) {
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
              return _this.emit('error', err);
            }

            _this.emit('photoSizes', photoId, sizes);

            var path = photoId + '.jpg';
            download(sizes.Original.source, path, function onDownloadComplete() {

              if (err) {
                return _this.emit('error', err);
              }

              _this.emit('photoDownloaded', photoId, path);
              cb(null, path);
            });
          });
        };
      });

      async.parallelLimit(tasks, _this.concurrency, function onTasksCompleted(err, results) {
        _this.emit('done', results);
      });
    });

    return this;
  };

  return _this;
}

util.inherits(Flickr, EventEmitter);

module.exports = Flickr;
