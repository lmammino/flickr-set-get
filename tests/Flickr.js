'use strict';

var chai = require('chai');
var nock = require('nock');
var fs = require('fs');
var Flickr = require('../lib/Flickr.js');

chai.should();

describe('Flickr', function ƒ() {

  describe('#Flickr()', function ƒ() {

    it('should be initialized with an apiKey', function ƒ() {
      var f = new Flickr('apiKey');
      f.apiKey.should.equal('apiKey');
    });

    it('should be initialized with an optional concurrency property', function ƒ() {
      var f = new Flickr('apiKey');
      f.concurrency.should.be.a('number');
      f = new Flickr('apiKey', 2);
      f.concurrency.should.equal(2);
    });

  });

  describe('#downloadSet()', function ƒ() {

    it('should stop on invalid setId', function ƒ(done) {
      var f = new Flickr('apiKey');

      f.on('error', function onError(error) {
        if (error.message.match(/Photoset not found/)) {
          done();
        }
      });

      nock('https://api.flickr.com')
        .get('/services/rest?photoset_id=someInvalidSet&user_id=someUser&page=1' +
          '&nojsoncallback=1&format=json&api_key=apiKey&method=flickr.photosets.getPhotos')
        .reply(200, fs.readFileSync('./tests/fixtures/getPhotos_fail_setId.json', 'utf8'));

      f.downloadSet('someInvalidSet', 'someUser');
    });

    it('should stop on invalid username', function ƒ(done) {
      var f = new Flickr('apiKey');

      f.on('error', function onError(error) {
        if (error.message.match(/User not found/)) {
          done();
        }
      });

      nock('https://api.flickr.com')
        .get('/services/rest?photoset_id=someSet&user_id=someInvalidUser&page=1' +
        '&nojsoncallback=1&format=json&api_key=apiKey&method=flickr.photosets.getPhotos')
        .reply(200, fs.readFileSync('./tests/fixtures/getPhotos_fail_userId.json', 'utf8'));

      f.downloadSet('someSet', 'someInvalidUser');
    });

    it('should download a set');

    it('should download a set with multiple pages');

    it('should skip not downloadable photos');

  });

});
