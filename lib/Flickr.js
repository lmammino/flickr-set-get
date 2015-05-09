'use strict';

var EventEmitter = require('events').EventEmitter;
var async = require('async');
var util = require('util');
var request = require('request');
var buildUrl = require('./apiUrlBuilder');
var download = require('./download.js');

// TODO add support for output folder
// TODO add support to skip already downloaded files
function Flickr(apiKey, concurrency) {
  var _this = this;

  _this.apiKey = apiKey;
  _this.concurrency = concurrency || 10;

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

  function getSetInfoPage(setId, userId, page, cb) {
    var url = buildUrl(_this.apiKey, 'flickr.photosets.getPhotos', {
      photoset_id: setId,
      user_id: userId,
      page: page
    });

    request(url, function(error, response, body) {
      var data = parseResponse(error, response, body);

      var info = {
        title: data.photoset.title,
        total: data.photoset.total,
        ownername: data.photoset.ownername,
        photos: data.photoset.photo,
        pages: data.photoset.pages
      };

      cb(info);
    });
  }

  function getSetInfo(setId, userId, cb) {
    getSetInfoPage(setId, userId, 1, function onGetFirstPage(info) {
      if (info.pages > 1) {

        var tasks = [];
        for (var page = 2; page < info.pages; page++) {
          tasks.push(

            (function(page) {
              return function(callback) {
                getSetInfoPage(setId, userId, page, function(newInfo) {
                  info.photos = info.photos.concat(newInfo.photos);
                  callback(null, newInfo.photos);
                });
              }
            })(page)

          );
        }

        async.series(tasks, function(err, data) {
          cb(info);
        });

      } else {
        cb(info);
      }
    });
  }

  function getPhotoSizes(photoId, cb) {
    var url = buildUrl(_this.apiKey, 'flickr.photos.getSizes', {
      photo_id: photoId
    });

    request(url, function(error, response, body) {
      var data = parseResponse(error, response, body);

      var sizes = {};

      for (var i = 0; i < data.sizes.size.length; i++) {
        sizes[data.sizes.size[i].label] = data.sizes.size[i];
      }

      cb(sizes);
    });
  }

  // TODO avoid/reduce pyramid of doom (use promises?)
  // TODO support destDir, size and noOverride options
  // TODO check if a photo is not downloadable
  _this.downloadSet = function(setId, userId, options) {
    getSetInfo(setId, userId, function(info) {
      _this.emit('setInfo', info);

      var tasks = info.photos.map(function(currentValue, index, array) {
        var photoId = currentValue.id;
        return function(cb) {
          getPhotoSizes(photoId, function(sizes) {
            _this.emit('photoSizes', photoId, sizes);

            var path = photoId + '.jpg';
            download(sizes.Original.source, path, function() {
              _this.emit('photoDownloaded', photoId, path);
              cb(null, path);
            });
          });
        };
      });

      async.parallelLimit(tasks, _this.concurrency, function(err, results) {
        _this.emit('done', results);
      });
    });
  };

  return _this;
}

util.inherits(Flickr, EventEmitter);

module.exports = Flickr;
