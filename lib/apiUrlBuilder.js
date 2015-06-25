'use strict';

/**
 * Dependencies
 */
var util = require('util');
var extend = util._extend;
var url = require('url');
var signature = require('./signature');

/**
 * Build an url to call a specific method of the flickr api
 * @param {string} method
 * @param {object} [params]
 * @param {string} [apiKey]
 * @param {string} [format]
 * @param {object} [auth]
 * @returns {string}
 */
module.exports = function buildUrl(method, params, apiKey, format, auth) {
  params = params || {};
  apiKey = apiKey || '';
  format = format || 'json';
  auth = auth || false;

  var query = {
    method: method,
    api_key: apiKey,
    format: format
  };

  if (format === 'json') {
    query.nojsoncallback = 1;
  }

  if (params) {
    query = extend(params, query);
  }

  if (auth) {
    var signatureParams = extend(query, {});
    delete signatureParams.api_key;

    if (method === 'flickr.auth.getFullToken') {
      query.mini_token = auth.miniToken;
      query.api_sig = signature.forAuthToken(apiKey, auth.secret, auth.miniToken, signatureParams);
    } else {
      query.auth_token = auth.authToken;
      query.api_sig = signature.forApiCall(apiKey, auth.secret, auth.authToken, method, signatureParams);
    }
  }

  return url.format({
    protocol: 'https',
    host: 'api.flickr.com',
    pathname: 'services/rest',
    query: query
  });
};
