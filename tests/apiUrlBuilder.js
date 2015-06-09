'use strict';

var buildUrl = require('../lib/apiUrlBuilder.js');
var chai = require('chai');
var url = require('url');

chai.should();

describe('apiUrlBuilder', function ƒ() {

  describe('#apiUrlBuilder()', function ƒ() {

    var apiKey = 'apiKey';
    var format = 'json';

    it('should build an url for a method', function ƒ() {
      var u = url.parse(buildUrl('someMethod', {foo:'bar', bar:'baz'}, apiKey, format), true);
      u.protocol.should.equal('https:');
      u.hostname.should.equal('api.flickr.com');
      u.pathname.should.equal('/services/rest');
      u.query.api_key.should.equal(apiKey);
      u.query.method.should.equal('someMethod');
    });

    it('should support an optional set of parameters', function ƒ() {
      var u = url.parse(buildUrl('someMethod', {foo:'bar', bar:'baz'}, apiKey, format), true);
      u.query.foo.should.equal('bar');
      u.query.bar.should.equal('baz');
    });

    it('should support an optional format', function ƒ() {
      var u = url.parse(buildUrl('someMethod', {}, apiKey), true);
      u.query.format.should.be.a('string');

      u = url.parse(buildUrl('someMethod', {}, apiKey, 'someFormat'), true);
      u.query.format.should.equal('someFormat');
    });

    it('should add signature to authenticated requests', function ƒ() {
      var auth = {
        secret: 'someSecret',
        miniToken: '123-456-789',
        authToken: 'someToken'
      };

      // test getFullToken signed request
      var u = url.parse(buildUrl('flickr.auth.getFullToken', {}, apiKey, format, auth), true);
      u.query.mini_token.should.be.a('string');
      u.query.api_sig.should.be.a('string');

      // test other signed requests
      u = url.parse(buildUrl('anyOtherMethod', {}, apiKey, format, auth), true);
      u.query.auth_token.should.be.a('string');
      u.query.api_sig.should.be.a('string');
    });

  });

});
