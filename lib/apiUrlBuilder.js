'use strict';

/**
 * Dependencies
 */
var util = require('util');
var extend = util._extend;
var url = require('url');

/**
 * Build an url to call a specific methof of the flickr api
 * @param {string} apiKey
 * @param {string} method
 * @param {object} [params]
 * @param {string} [format]
 * @returns {string}
 */
module.exports = function buildUrl(apiKey, method, params, format) {
  params = params || {};
  format = format || 'json';

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

  return url.format({
    protocol: 'https',
    host: 'api.flickr.com',
    pathname: 'services/rest',
    query: query
  });
};
