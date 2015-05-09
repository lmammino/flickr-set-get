'use strict';

var Flickr = require('../lib/Flickr.js');
var chai = require('chai');
var url = require('url');

chai.should();

describe('Flickr', function() {

  describe('#Flickr', function() {

    it('should be initialized with an apiKey', function() {
      var f = new Flickr('apiKey');
      f.apiKey.should.equal('apiKey');
    });

    it('should be initialized with an optional parallelRequest property', function() {
      var f = new Flickr('apiKey');
      f.parallelRequests.should.be.a('number');
      f = new Flickr('apiKey', 2);
      f.parallelRequests.should.equal(2);
    });

  });

});
