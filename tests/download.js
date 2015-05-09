'use strict';

var nock = require('nock');
var chai = require('chai');
var fs = require('fs');
var download = require('../lib/download');

chai.should();

describe('download', function() {

  describe('#download()', function() {

    it('should download a file creating a temp file', function(done) {
      var fileContent = 'This is the file content';
      var dest = './tests/temp.txt';
      var tempDest = './tests/temp.txt.download';

      nock('http://somedomain.com')
        .get('/somefile.txt')
        .delay(1)
        .reply(200, fileContent)
      ;

      download('http://somedomain.com/somefile.txt', dest, function onDownloadFinished(err, data) {
        // tests whether the file has been correctly renamed and has the correct content
        chai.assert(fs.existsSync(dest));
        var content = fs.readFileSync(dest, {encoding:'utf8'});
        content.should.equal(fileContent);
        fs.unlink(dest, done);
      });

      // Tests if the temp file has been created
      chai.assert(fs.existsSync(tempDest));
    });

  });

});
