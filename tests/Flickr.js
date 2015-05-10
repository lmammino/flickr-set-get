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
        .reply(200, fs.readFileSync('./tests/fixtures/getPhotos_fail_setId.json', 'utf8'))
      ;

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
        .reply(200, fs.readFileSync('./tests/fixtures/getPhotos_fail_userId.json', 'utf8'))
      ;

      f.downloadSet('someSet', 'someInvalidUser');
    });

    /**
     * Checks if it downloads a set correctly.
     * All the https requests to the flickr api are mocked
     * Intentionally uses a low concurrency
     */
    it('should download a set', function ƒ(done) {
      var f = new Flickr('apiKey', 2);

      f.on('done', function onDone() {
        var ok = true;

        for (var i = 1; i < 6; i++) {
          var path = 'photo' + i + '.jpg';
          if (fs.readFileSync(path, 'utf8') !== 'This is a photo') {
            ok = false;
          }

          fs.unlinkSync(path);
        }

        if (ok) {
          done();
        }
      });

      nock('https://api.flickr.com')
        .get('/services/rest?photoset_id=someSet&user_id=someUser&page=1' +
        '&nojsoncallback=1&format=json&api_key=apiKey&method=flickr.photosets.getPhotos')
        .reply(200, fs.readFileSync('./tests/fixtures/getPhotos_ok.json', 'utf8'))
      ;

      nock('https://api.flickr.com')
        .filteringPath(/photo_id=[^&]*/g, 'photo_id=XXX')
        .get('/services/rest?photo_id=XXX&nojsoncallback=1&format=json' +
          '&api_key=apiKey&method=flickr.photos.getSizes')
        .times(5)
        .reply(200, fs.readFileSync('./tests/fixtures/getSizes_ok.json', 'utf8'))
      ;

      nock('https://farm9.staticflickr.com')
        .get('/1234/12345678910_2a37e1c3ac_o.jpg')
        .times(5)
        .reply(200, 'This is a photo')
      ;

      f.downloadSet('someSet', 'someUser');
    });

    /**
     * Similar to the previous test but simulates a set with more than one page
     * so that the code needs to download all the pages of the set to build the
     * list of images to download
     */
    it('should download a set with multiple pages', function ƒ(done) {
      var f = new Flickr('apiKey', 2);

      f.on('done', function onDone() {
        var ok = true;

        for (var i = 1; i < 6; i++) {
          var path = 'photo' + i + '.jpg';
          if (fs.readFileSync(path, 'utf8') !== 'This is a photo') {
            ok = false;
          }

          fs.unlinkSync(path);
        }

        if (ok) {
          done();
        }
      });

      nock('https://api.flickr.com')
        .get('/services/rest?photoset_id=someSet&user_id=someUser&page=1' +
        '&nojsoncallback=1&format=json&api_key=apiKey&method=flickr.photosets.getPhotos')
        .reply(200, fs.readFileSync('./tests/fixtures/getPhotos_ok_multi_page1.json', 'utf8'))
      ;

      nock('https://api.flickr.com')
        .get('/services/rest?photoset_id=someSet&user_id=someUser&page=2' +
        '&nojsoncallback=1&format=json&api_key=apiKey&method=flickr.photosets.getPhotos')
        .reply(200, fs.readFileSync('./tests/fixtures/getPhotos_ok_multi_page2.json', 'utf8'))
      ;

      nock('https://api.flickr.com')
        .filteringPath(/photo_id=[^&]*/g, 'photo_id=XXX')
        .get('/services/rest?photo_id=XXX&nojsoncallback=1&format=json' +
        '&api_key=apiKey&method=flickr.photos.getSizes')
        .times(5)
        .reply(200, fs.readFileSync('./tests/fixtures/getSizes_ok.json', 'utf8'))
      ;

      nock('https://farm9.staticflickr.com')
        .get('/1234/12345678910_2a37e1c3ac_o.jpg')
        .times(5)
        .reply(200, 'This is a photo')
      ;

      f.downloadSet('someSet', 'someUser');
    });

  });

});
