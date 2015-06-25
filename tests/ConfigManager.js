'use strict';

var ConfigManager = require('../lib/ConfigManager');
var mock = require('mock-fs');
var chai = require('chai');
var expect = chai.expect;

chai.should();

describe('ConfigManager', function ƒ() {

  describe('#ConfigManager()', function ƒ() {

    it('it should be initialized with default options', function ƒ() {
      var config = new ConfigManager();
      config.options.should.be.an('object');
      config.options.apiKey.should.be.a('string');
      config.options.secret.should.be.a('string');
      config.options.authUrl.should.be.a('string');
    });

    it('it should be initialized with a path', function ƒ() {

      mock({
        file: '{ \
          "fileVersion": 1,\
          "apiKey": "someKey",\
          "secret": "someSecret",\
          "authUrl": "someUrl"\
        }'
      });

      var config = new ConfigManager('file');
      config.options.should.be.an('object');
      config.options.apiKey.should.be.equal('someKey');
      config.options.secret.should.be.equal('someSecret');
      config.options.authUrl.should.be.equal('someUrl');

      mock.restore();
    });

  });

  describe('#load()', function ƒ() {

    it('it should load a config file', function ƒ() {

      mock({
        file: '{ \
          "fileVersion": 1,\
          "apiKey": "someKey",\
          "secret": "someSecret",\
          "authUrl": "someUrl"\
        }'
      });

      var config = new ConfigManager();
      config.load('file');

      config.options.should.be.an('object');
      config.options.apiKey.should.be.equal('someKey');
      config.options.secret.should.be.equal('someSecret');
      config.options.authUrl.should.be.equal('someUrl');
    });

    it('it should convert an old config file', function ƒ() {

      var oldApiKey = '12345678901234567890123456789012';

      mock({
        file: oldApiKey
      });

      var config = new ConfigManager();
      config.load('file');

      config.options.should.be.an('object');
      config.options.apiKey.should.be.equal(oldApiKey);
      expect(config.options.secret).to.be.null;
      expect(config.options.authUrl).to.be.null;

      mock.restore();
    });

    it('it should raise and exception on invalid config', function ƒ() {

      mock({
        file: 'invalid'
      });

      var config = new ConfigManager();
      expect(function ƒ() {
        config.load('file');
      }).to.throw(Error, /InvalidConfig/);

      mock.restore();

    });

  });

  describe('#save()', function ƒ() {

    it('it should persist config on file', function ƒ() {

      // TODO

      mock({
        file: ''
      });

      // save a new config
      var config1 = new ConfigManager();
      config1.options.apiKey = 'newApiKey';
      config1.save('file');

      // load a new instance with the previously saved config
      var config2 = new ConfigManager('file');

      // check if the 2 configs have the same data
      config2.options.should.deep.equal(config1.options);

      mock.restore();

    });

  });

});
