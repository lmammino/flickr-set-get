'use strict';

var matchUrl = require('../lib/matchUrl');
var chai = require('chai');
var expect = chai.expect;

/*
 * Check the following valid urls
 *
 *   - `https://www.flickr.com/photos/21272841@N05/sets/72157623488969696`
 *   - `http://www.flickr.com/photos/21272841@N05/sets/72157623488969696`
 *   - `http://flickr.com/photos/21272841@N05/sets/72157623488969696`
 *   - `www.flickr.com/photos/21272841@N05/sets/72157623488969696`
 *   - `flickr.com/photos/21272841@N05/sets/72157623488969696`
 *   - `/photos/21272841@N05/sets/72157623488969696`
 */
describe('matchUrl', function ƒ() {

  var expectedResult = {
    userId: '21272841@N05',
    setId: '72157623488969696'
  };

  describe('#matchUrl()', function ƒ() {

    it('should match valid urls', function ƒ() {
      var urls = [
        'https://www.flickr.com/photos/21272841@N05/sets/72157623488969696',
        'http://www.flickr.com/photos/21272841@N05/sets/72157623488969696',
        'http://flickr.com/photos/21272841@N05/sets/72157623488969696',
        'www.flickr.com/photos/21272841@N05/sets/72157623488969696',
        'flickr.com/photos/21272841@N05/sets/72157623488969696',
        '/photos/21272841@N05/sets/72157623488969696'
      ];

      urls.forEach(function each(url) {
        expect(matchUrl(url)).to.be.deep.equal(expectedResult);
      });
    });

    it('should not match invalid urls', function ƒ() {
      var match = matchUrl('Invalid url');
      expect(match).to.be.null;
    });

  });

});
