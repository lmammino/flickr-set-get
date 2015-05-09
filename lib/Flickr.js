'use strict';

var EventEmitter = require('events').EventEmitter;
var async = require('async');
var util = require('util');
var extend = util._extend;
var fs = require('fs');
var request = require('request');
var url = require('url');

// TODO add support for output folder
// TODO add support to skip already downloaded files
function Flickr(apiKey, parallelRequests) {
  var _this = this;

  _this.apiKey = apiKey;
  _this.parallelRequests = parallelRequests || 5;

  _this.buildUrl = function(method, params, format) {

    params = params || {};
    format = format || 'json';

    var query = {
      method: method,
      api_key: _this.apiKey,
      format: format
    };

    if (format === 'json') {
      query.nojsoncallback = 1;
    }

    if (params) {
      query = extend(params, query);
    }

    return url.format({
      protocol: 'https',
      host: 'api.flickr.com',
      pathname: 'services/rest',
      query: query
    });
  };

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

  function getSetInfo(setId, userId, cb) {
    var url = _this.buildUrl('flickr.photosets.getPhotos', {
      photoset_id: setId,
      user_id: userId
    });

    request(url, function(error, response, body) {
      var data = parseResponse(error, response, body);

      // TODO manage multi-paged sets
      var info = {
        title: data.photoset.title,
        total: data.photoset.total,
        ownername: data.photoset.ownername,
        photos: data.photoset.photo
      };

      cb(info);
    });
  }

  function getPhotoSizes(photoId, cb) {
    var url = _this.buildUrl('flickr.photos.getSizes', {
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

  function downloadPhoto(url, path, cb) {
    // TODO use temp files until the download is complete
    request(url)
        .pipe(fs.createWriteStream(path))
        .on('close', cb);
  }

  // TODO avoid/reduce pyramid of doom (use promises?)
  _this.getSet = function(setId, userId, path, options) {
    getSetInfo(setId, userId, function(info) {
      _this.emit('setInfo', info);

      var tasks = info.photos.map(function(currentValue, index, array) {
        var photoId = currentValue.id;
        return function(cb) {
          getPhotoSizes(photoId, function(sizes) {
            _this.emit('photoSizes', photoId, sizes);

            var path = photoId + '.jpg';
            downloadPhoto(sizes.Original.source, path, function() {
              _this.emit('photoDownloaded', photoId, path);
              cb(null, path);
            });
          });
        };
      });

      async.parallelLimit(tasks, _this.parallelRequests, function(err, results) {
        _this.emit('done', results);
      });
    });
  };

  return _this;
}

util.inherits(Flickr, EventEmitter);

module.exports = Flickr;
