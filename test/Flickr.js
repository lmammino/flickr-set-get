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

  describe('#Flickr.buildUrl', function(){

    var apiKey = 'apiKey';
    var f = new Flickr(apiKey);

    it('should build an url for a method', function(){
      var u = url.parse(f.buildUrl('someMethod', {foo:'bar', bar:'baz'}), true);
      u.protocol.should.equal('https:');
      u.hostname.should.equal('api.flickr.com');
      u.pathname.should.equal('/services/rest');
      u.query.api_key.should.equal(apiKey);
      u.query.method.should.equal('someMethod');
    });

    it('should support an optional set of parameters', function(){
      var u = url.parse(f.buildUrl('someMethod', {foo:'bar', bar:'baz'}), true);
      u.query.foo.should.equal('bar');
      u.query.bar.should.equal('baz');
    });

    it('should support an optional format', function(){
      var u = url.parse(f.buildUrl('someMethod'), true);
      u.query.format.should.be.a('string');

      u = url.parse(f.buildUrl('someMethod', {}, 'someFormat'), true);
      u.query.format.should.equal('someFormat');
    });

  });

});
