#!/usr/bin/env node

'use strict';

var cli = require('cli')
  , flickr = require('./flickr/Flickr.js');

cli.parse({
    apiKey:   ['k', 'The flickr api key', 'string', require('./.apikey.js')],
    parallelRequests:   ['p', 'The number of parallel requests', 'number', 5]
});

cli.main(function(args, options) {
    var api = new flickr(options.apiKey, options.parallelRequests);
    var numPhotos = null;
    var numDownloaded = 0;

    api.on('setInfo', function(info) {
        cli.info('Downloading '+info.total+' photos from "'+info.title+'" by ' + info.ownername);
        numPhotos = info.total;
        cli.progress(0);
    });

    api.on('photoDownloaded', function(){
        numDownloaded++;
        cli.progress(numDownloaded/numPhotos);
    });

    api.on('done', function(results){
        cli.ok('All done.');
    });

    api.getSet(args[0], args[1]);
});

