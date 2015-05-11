# flickr-set-get

[![npm version](https://badge.fury.io/js/flickr-set-get.svg)](http://badge.fury.io/js/flickr-set-get)
[![Build Status](https://travis-ci.org/lmammino/flickr-set-get.svg?branch=master)](https://travis-ci.org/lmammino/flickr-set-get) 
[![Coverage Status](https://coveralls.io/repos/lmammino/flickr-set-get/badge.svg?branch=master)](https://coveralls.io/r/lmammino/flickr-set-get?branch=master) 
[![Dependency Status](https://gemnasium.com/lmammino/flickr-set-get.svg)](https://gemnasium.com/lmammino/flickr-set-get)

Flickr-set-get is a command line application written in node that allows you to download an entire set of 
photos from Flickr (a gallery). Once you have it installed, to start the download you just need to:

```bash
$ flickr-set-get <setid> <userid>
```

## Install

As simple as installing any other global node package. Be sure to have [npm](https://www.npmjs.com) and 
[node](https://nodejs.org/) (`>= 0.8` version, or [io.js](https://iojs.org) `>= 1.0`) installed and launch:

```bash
$ npm install -g flickr-set-get
```

## Usage

![Usage screenshot](http://i.imgur.com/DGEpYtl.png)

Once you have it installed you need to grab a Flickr api key. You can apply for a Flickr api key in the 
[Flickr app garden](https://www.flickr.com/services/apps/create/apply) or you can use the default api key that I got
to develop this [app](https://www.flickr.com/services/apps/72157651747839108/): `0f3a8354998d776fbaac7d87c55c0203` 
(but I suggest you to grab your own one to avoid rate limiting issues).

### Define a global api key

You can specify an api key every time you launch the command with the `--apiKey` option but it's better to set a global 
api key for your user. To do so you need to run:

```bash
$ flickr-set-get --setGlobalApiKey
```

It will prompt you to insert your api key and it will be stored in your user directory. It will load it automatically
from now and you don't need to specify the `--apiKey` option anymore.


### Start the download

Once you setup your api key you just need to have a set to download. A set is identified by two parameters: a `setId`
and a `userId`. Given the url of a set (gallery) you can easily identify these two parameters as shown in the image below:

![SetId and UserId parameters in a Flickr gallery url](http://i.imgur.com/4SrUKjV.png)

So, given the url `https://www.flickr.com/photos/21272841@N05/sets/72157623488969696`, to start the download you need 
to run: 

```bash
$ flickr-set-get 72157623488969696 21272841@N05
```

And then just watch the command to do the hard work for you!


### Options

There are few command line options available. You can have a comprehensive documentation by calling:

```bash
$ flickr-set-get --help
```

Here follows the list of the currently available options:

  - `-h, --help`             output usage information
  - `-V, --version`          output the version number
  - `-k, --apiKey <value>`   The flickr api key
  - `--setGlobalApiKey`      Sets or resets a permanent apiKey
  - `-c, --concurrency <n>`  The number of concurrent requests
  - `-o, --outputDir <s>`    The directory where to save the downloaded images
  - `-s, --size <s>`         The size of the image to download (eg. "Original", "Large", "Medium", etc.)
  - `-n, --noOverwrite`      If set does not overwrite existing files


## Current status

This project is currently on its early days so it's expected to have (a lot of) bugs and imperfections.
Feel free to [contribute to its development](#contributing) and to 
[report bugs](https://github.com/lmammino/flickr-set-get/issues).


## Programmatic API

Developers can integrate part of the code into their own apps. 
Here's a small documentation to get you going in this case.

If you install the package as a dependency into an existing project (`npm install --save flickr-set-get`) you can require
it's main module:

```js
var Flickr = require('flickr-set-get');

var apiKey = 'someApiKey';
var options = {};

var client = new Flickr(apiKey, options);
```

Here follows a comprehensive documentation of the `Flickr` class.

### Class: Flickr
A class that defines a set of methods to download an entire set of photos (`gallery` or `set`) from Flickr.

Available options:

  - **concurrency** `number` the maximum number of concurrent http requests (default: `10`)
  - **outputDir** `string` the path where to save the images (default: `"."`)
  - **size** `string` The size of the image to download, eg. "Original", "Large", "Medium", etc. (default `"Original"`)
  - **noOverwrite** `boolean` if true avoids to override already existing files (default: `false`)

This class extends from {EventEmitter} and emits several events:

  - **error** `Error` in case of error
  - **setInfo** `Object` when info about a given set are successfully retrieved
  - **photoSizes** `Object` when the info about a photo (url to download the sizes) are retrieved
  - **photoDownloaded** `Object` when a photo is successfully downloaded
  - **photoSkipped** `Object` when a photo is skipped (already downloaded)
  - **done** `Object` when all the photo of the set are downloaded

#### Flickr.downloadSet(setId, userId) 

Starts the download of the photos from a given Flickr set.
Triggers events during the whole process

**Parameters**

**setId**: `string`, Starts the download of the photos from a given Flickr set.
Triggers events during the whole process

**userId**: `string`, Starts the download of the photos from a given Flickr set.
Triggers events during the whole process

**Returns**: `Flickr`


## Contributing

Everyone is very welcome to contribute to this project. You can contribute just by submitting bugs or 
suggesting improvements by [opening an issue on GitHub](https://github.com/lmammino/flickr-set-get/issues).

You can also submit PRs as long as you adhere with the code standards and write tests for the proposed changes.

You can read a [dedicated guide on how to contribute](CONTRIBUTING.md).


## License

Licensed under [MIT License](LICENSE). © Luciano Mammino.
