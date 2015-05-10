'use strict';

var buildUrl = require('../lib/apiUrlBuilder.js');
var chai = require('chai');
var url = require('url');

chai.should();

describe('apiUrlBuilder', function ƒ() {

  describe('#apiUrlBuilder()', function ƒ() {

    var apiKey = 'apiKey';

    it('should build an url for a method', function ƒ() {
      var u = url.parse(buildUrl(apiKey, 'someMethod', {foo:'bar', bar:'baz'}), true);
      u.protocol.should.equal('https:');
      u.hostname.should.equal('api.flickr.com');
      u.pathname.should.equal('/services/rest');
      u.query.api_key.should.equal(apiKey);
      u.query.method.should.equal('someMethod');
    });

    it('should support an optional set of parameters', function ƒ() {
      var u = url.parse(buildUrl(apiKey, 'someMethod', {foo:'bar', bar:'baz'}), true);
      u.query.foo.should.equal('bar');
      u.query.bar.should.equal('baz');
    });

    it('should support an optional format', function ƒ() {
      var u = url.parse(buildUrl(apiKey, 'someMethod'), true);
      u.query.format.should.be.a('string');

      u = url.parse(buildUrl(apiKey, 'someMethod', {}, 'someFormat'), true);
      u.query.format.should.equal('someFormat');
    });

  });

});
