'use strict';

var util = require('util');
var extend = util._extend;
var url = require('url');

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
