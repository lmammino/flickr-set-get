'use strict';

var Flickr = require('../lib/Flickr.js');
var chai = require('chai');
var url = require('url');

chai.should();

describe('Flickr', function() {

  describe('#Flickr()', function() {

    it('should be initialized with an apiKey', function() {
      var f = new Flickr('apiKey');
      f.apiKey.should.equal('apiKey');
    });

    it('should be initialized with an optional concurrency property', function() {
      var f = new Flickr('apiKey');
      f.concurrency.should.be.a('number');
      f = new Flickr('apiKey', 2);
      f.concurrency.should.equal(2);
    });

  });

  describe('#downloadSet()', function() {

    it('should download a set');
    it('should stop on invalid setId');
    it('should stop on invalid username');
    it('should skip not downloadable photos');

  });

});
