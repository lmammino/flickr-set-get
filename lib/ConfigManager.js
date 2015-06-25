'use strict';

/**
 * Dependencies
 */
var fs = require('fs');

var defaults = {
  fileVersion: 1,
  apiKey: '0f3a8354998d776fbaac7d87c55c0203',
  secret: '9c912eddff27a2d2',
  authUrl: 'https://www.flickr.com/auth-72157651747839108'
};

/**
 * Migrates an old config object to the last version
 * @param {object|string} data
 * @returns {object}
 */
var migrateConfig = function migrateConfig(data) {
  if (data === defaults.apiKey) {
    return defaults;
  }

  return {
    fileVersion: '1',
    apiKey: data,
    secret: null,
    authUrl: null,
    authToken: null
  };
};

/**
 * Constructor to build a new ConfigManager instance
 * @param {string} [path] an optional path to load a given
 * @returns {ConfigManager}
 * @constructor
 */
var ConfigManager = function ConfigManager(path) {
  this.options = defaults;

  if (path) {
    this.load(path);
  }

  return this;
};

/**
 * Load the configuration from a file
 * @param {string} path A path from which to load the config
 * @returns {{fileVersion: number, apiKey: string, secret: string, authUrl: string}}
 * @throws InvalidConfig in case the config has an invalid content
 */
ConfigManager.prototype.load = function load(path) {
  this.path = path;

  // if the config file does not exist creates a new one with default options
  if (!fs.existsSync(path)) {
    this.save();
  } else {
    var content = fs.readFileSync(path, 'utf8');

    // read the option if it looks like a json file
    if (content.substring(0, 1) === '{') {
      this.options = JSON.parse(content);

      return this.options;
    }

    // if it's not a json file it's probably an old version of the config file
    // try to open and migrate it (old files contained only api keys as a string, 32 chars length)
    if (content.length === 32) {
      this.options = migrateConfig(content);
      this.save();

      return this.options;
    }

    throw new Error('InvalidConfig');
  }
};

/**
 * Persists the config to a file
 * @param {string} [path] an optional file (if none given the current path will be used)
 */
ConfigManager.prototype.save = function save(path) {
  path = path || this.path;
  fs.writeFileSync(path, JSON.stringify(this.options, null, '\t'));
};

module.exports = ConfigManager;
