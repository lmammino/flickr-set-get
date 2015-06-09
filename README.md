# flickr-set-get

[![npm version](https://badge.fury.io/js/flickr-set-get.svg)](http://badge.fury.io/js/flickr-set-get)
[![Build Status](https://travis-ci.org/lmammino/flickr-set-get.svg?branch=master)](https://travis-ci.org/lmammino/flickr-set-get) 
[![Coverage Status](https://coveralls.io/repos/lmammino/flickr-set-get/badge.svg?branch=master)](https://coveralls.io/r/lmammino/flickr-set-get?branch=master) 
[![Dependency Status](https://gemnasium.com/lmammino/flickr-set-get.svg)](https://gemnasium.com/lmammino/flickr-set-get)

Flickr-set-get is a command line application written in node that allows you to download an entire set of 
photos from Flickr (a gallery). Once you have it installed, to start the download you just need to:

```bash
$ flickr-set-get get <setid> <userid>
```


## Install

As simple as installing any other global node package. Be sure to have [npm](https://www.npmjs.com) and 
[node](https://nodejs.org/) (`>= 0.8` version, or [io.js](https://iojs.org) `>= 1.0`) installed and launch:

```bash
$ npm install -g flickr-set-get
```


## Configuration

![Usage screenshot](http://i.imgur.com/DGEpYtl.png)

Flickr-set-get is already configured with a default api key to allow you to use it immediately. Anyway it's highly
recommended to create your own Flickr api key in the [Flickr app garden](https://www.flickr.com/services/apps/create/apply)
especially if you intend to make authenticated requests to download private photos and photo sets. Having your own api key
will allow you to avoid rate limiting and to use a more secure authenticated communication.

To configure flickr-set-get to use your own api key you need to launch the following command:

```bash
$ flickr-set-get config
```

An interactive guide will then help you to complete the configuration process.


### Start the download

At this stage you should be ready to download a Flickr photo set. A set is identified by two parameters: a `setId`
and a `userId`. Given the url of a set (gallery) you can easily spot these two parameters as shown in the image below:

![SetId and UserId parameters in a Flickr gallery url](http://i.imgur.com/4SrUKjV.png)

So, given the url `https://www.flickr.com/photos/21272841@N05/sets/72157623488969696`, to start the download you need 
to run: 

```bash
$ flickr-set-get get 72157623488969696 21272841@N05
```

And then just watch the command to do the hard work for you!

### Download private photos and sets

Flickr supports private photos and private sets (sets that contains only private photos). To be able to download these
photos from your sets you need to authenticate yourself and to send authenticated api requests. In order to do so you
need to do configure your authentication options and get an authentication token with the `flickr-set-get config` command.
Then you need to use the option `--authenticated` when using the `flickr-set-get get` command.

It's highly recommended to use your own api key and secret to achieve an optimal level of security.
In fact the default api *secret* is shared in plain text in the code base of flickr-set-get, so it's not really *a secret*.
Someone that might intercept a flickr-set-get authentication token for your Flickr profile (generated with the 
default api key and api secret) will be able to download all your private photos. 
Anyway it's not mandatory to provide personal api key and api secret and you can use the default values, 
especially if you just want to quick test the application to download some photos (ensure to be in a safe network in 
that case, and to revoke your authentication token at the end of the test).


### Sub-commands, options and help

Flickr set get supports different sub-commands. You can access a comprehensive documentation with:

```bash
$ flickr-set-get --help
```

This will display all the available sub-commands and options. You can also access the specific help of a sub-command
with:

```bash
$ flickr-set-get <sub-command> --help
```

For example `flickr-set-get get --help` will show:

```
  Usage: get|g [options] <setId> <userId>

  download a set of photos

  Options:

    -h, --help             output usage information
    --apiKey <value>       The flickr API key
    --authToken <value>    The flickr auth token
    --authenticated        Use authenticate request to access private photos (ensure to provide a valid `authToken` as option or in your config file)
    --config <value>       Define the config file to use
    -c, --concurrency <n>  The number of concurrent requests
    -o, --outputDir <s>    The directory where to save the downloaded images
    -s, --size <s>         The size of the image to download (eg. "Original", "Large", "Medium", etc.)
    -n, --noOverwrite      If set does not overwrite existing files
```


## Current status

This project is currently on its early days so it's expected to have (a lot of) bugs and imperfections.
Feel free to [contribute to its development](#contributing) and to 
[report bugs](https://github.com/lmammino/flickr-set-get/issues).


## Programmatic API

Developers can integrate part of the code into their own apps (want to build a GUI for this command line app? :P) 
Here's a small documentation to get you going in these cases.

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
  - **size** `string` The size of the image to download, eg. `"Original"`, `"Large"`, `"Medium"`, etc. (default `"Original"`)
  - **noOverwrite** `boolean` if `true` avoids to override already existing files (default: `false`)
  - **auth** `boolean|object` if `false` it will not use authentication. Otherwise it should be an object containing the keys `secret` and  `authToken` (or `miniToken`) (default: false)

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


#### Flickr.getAuthToken(cb)

Get the authToken. Requires that the `auth` option has been correctly configured providing `secret` and `miniToken`
   
**Parameters**

**cb**: `function`, a callback function that gets called (with `error` and `data` arguments) once the request is finished

**Returns**: `Flickr`


## Contributing

Everyone is very welcome to contribute to this project. You can contribute just by submitting bugs or 
suggesting improvements by [opening an issue on GitHub](https://github.com/lmammino/flickr-set-get/issues).

You can also submit PRs as long as you adhere with the code standards and write tests for the proposed changes.

You can read a [dedicated guide on how to contribute](CONTRIBUTING.md).


## License

Licensed under [MIT License](LICENSE). © Luciano Mammino.
