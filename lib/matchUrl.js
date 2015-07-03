'use strict';

var regex = /^(?:(?:https?:\/\/)?(?:www.)?flickr.com)?\/photos\/(\d+@\w+)\/sets\/(\d+)$/i;

/**
 * Extract meaningful data from a given Flickr set url (userId and setId).
 * It supports complete absolute urls and partial relative url, eg:
 *
 *   - `https://www.flickr.com/photos/21272841@N05/sets/72157623488969696`
 *   - `http://www.flickr.com/photos/21272841@N05/sets/72157623488969696`
 *   - `http://flickr.com/photos/21272841@N05/sets/72157623488969696`
 *   - `flickr.com/photos/21272841@N05/sets/72157623488969696`
 *   - `/photos/21272841@N05/sets/72157623488969696`
 *
 * @param {string} url the url to match
 * @returns {null|object} `null` if the url is not matched, an object containing `userId` and `setId` otherwise
 */
module.exports = function matchUrl(url) {
  var match = url.match(regex);

  if (match) {
    return {
      userId: match[1],
      setId: match[2]
    }
  }

  return null;
};
