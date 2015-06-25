'use strict';

var signature = require('../lib/signature');
var chai = require('chai');

chai.should();

// based on examples provided in the flickr api documentation
// https://www.flickr.com/services/api/auth.howto.mobile.html
describe('signature', function ƒ() {

  var apiKey = '9a0554259914a86fb9e7eb014e4e5d52';
  var secret = '000005fab4534d05';

  describe('#forAuthToken()', function ƒ() {

    var miniToken = '123-456-789';

    it('should generate a valid signature for an AuthToken request', function ƒ() {
      var expected = 'fddd34ac63af89b1b73b144aef8ef3d5';
      signature.forAuthToken(apiKey, secret, miniToken).should.equal(expected);
    });

    it('should accept an optional set of additional parameters', function ƒ() {
      var params = {
        format: 'json',
        nojsoncallback: 1
      };

      var expected = '5865d12efd79dfc031e32e9106a7e307';
      signature.forAuthToken(apiKey, secret, miniToken, params).should.equal(expected);
    });

  });

  describe('#forApiCall()', function ƒ() {

    var method = 'flickr.blogs.getList';
    var authToken = '45-76598454353455';

    it('should generate a valid signature for an API method call', function ƒ() {
      var expected = '09f16d79f53bc24f440149af875cdf9d';
      signature.forApiCall(apiKey, secret, authToken, method).should.equal(expected);
    });

    it('should accept an optional set of additional parameters', function ƒ() {
      var params = {
        format: 'json',
        nojsoncallback: 1
      };

      var expected = 'e699e0d612d35b025dcec54a38fbae24';
      signature.forApiCall(apiKey, secret, authToken, method, params).should.equal(expected);
    });

  });

});
