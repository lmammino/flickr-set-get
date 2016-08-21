'use strict';

/**
 * Dependencies
 */
var crypto = require('crypto');

/**
 * md5 shortcut method
 * @param string
 * @returns {string}
 * @internal
 */
function md5(string) {
  return crypto.createHash('md5').update(string).digest('hex');
}

/**
 * Creates a signature for a specific request
 * @param {string} secret
 * @param {object} params
 * @returns {string}
 * @internal
 */
function signature(secret, params) {
  var parts = [secret];
  Object.keys(params)
    .sort()
    .forEach(function each(key) {
      parts.push(key);
      parts.push(params[key]);
    });

  return md5(parts.join(''));
}

module.exports = {

  /**
   * Generates a signature for a full token retrieval API call
   * @param {string} apiKey
   * @param {string} secret
   * @param {string} miniToken
   * @param {object} [params] an optional array of additional parameters included in the request
   * @returns {string}
   */
  forAuthToken: function forFullToken(apiKey, secret, miniToken, params) {
    params = params || {};
    params.api_key = apiKey;
    params.mini_token = miniToken;
    params.method = 'flickr.auth.getFullToken';

    return signature(secret, params);
  },

  /**
   * Generates a signature for a generic API call
   * @param {string} apiKey
   * @param {string} secret
   * @param {string} authToken
   * @param {string} method
   * @param {object} [params] an optional array of additional parameters included in the request
   * @returns {string}
   */
  forApiCall: function forApiCall(apiKey, secret, authToken, method, params) {
    params = params || {};
    params.api_key = apiKey;
    params.auth_token = authToken;
    params.method = method;

    return signature(secret, params);
  }
};
