'use strict';

var EventEmitter = require('events').EventEmitter
  , async = require('async')
  , util = require('util')
  , extend = util._extend
  , fs = require('fs')
  , request = require('request')
  , url = require('url');

// TODO add support for output folder
// TODO add support to skip already downloaded files
function Flickr(apiKey, parallelRequests) {
    var self = this;

    self.apiKey = apiKey;
    if (typeof parallelRequests === 'undefined') {
        parallelRequests = 5;
    }
    self.parallelRequests = parallelRequests;

    function buildRequestUrl(method, params, apiKey, format) {
        if (typeof apiKey === 'undefined') {
            apiKey = self.apiKey;
        }

        if (typeof format === 'undefined') {
            format = 'json';
        }

        var query = {
            method : method,
            api_key: apiKey,
            format : format
        };

        if (format === 'json'){
            query.nojsoncallback = 1;
        }

        if (params) {
            query = extend(params, query);
        }

        return url.format({
            protocol : 'https',
            host: 'api.flickr.com',
            pathname : 'services/rest',
            query : query
        });
    }

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
        var url = buildRequestUrl('flickr.photosets.getPhotos', {
            photoset_id : setId,
            user_id : userId
        });

        request(url, function(error, response, body) {
            var data = parseResponse(error, response, body);

            // TODO manage multi-paged sets
            var info = {
                title : data.photoset.title,
                total : data.photoset.total,
                ownername : data.photoset.ownername,
                photos : data.photoset.photo
            };

            cb(info);
        });
    }

    function getPhotoSizes(photoId, cb) {
        var url = buildRequestUrl('flickr.photos.getSizes', {
            photo_id : photoId
        });

        request(url, function(error, response, body) {
            var data = parseResponse(error, response, body);

            var sizes = {};

            for (var i=0; i < data.sizes.size.length; i++) {
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
    self.getSet = function(setId, userId, path, options) {
        getSetInfo(setId, userId, function(info){
            self.emit('setInfo', info);

            var tasks = info.photos.map(function(currentValue, index, array){
                var photoId = currentValue.id;
                return function(cb){
                    getPhotoSizes(photoId, function(sizes){
                        self.emit('photoSizes', photoId, sizes);

                        var path = photoId + ".jpg";
                        downloadPhoto(sizes.Original.source, path, function(){
                            self.emit('photoDownloaded', photoId, path);
                            cb(null, path);
                        });
                    });
                };
            });

            async.parallelLimit(tasks, self.parallelRequests, function(err, results){
                self.emit('done', results);
            });
        });
    };

    return self;
}

util.inherits(Flickr, EventEmitter);

module.exports = Flickr;