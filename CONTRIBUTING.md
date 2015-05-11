# Contributing

Everyone is very welcome to contribute to this project. You can contribute just by submitting bugs or 
suggesting improvements by [opening an issue on GitHub](https://github.com/lmammino/flickr-set-get/issues).

You can also submit PRs but please adhere with the code standards and write tests for the proposed changes.

## Common workflow

  1. Create a fork of the repository
  2. Run `npm install` to install the dependencies (will download also the dev dependencies)
  3. Create a specific git branch giving it a descriptive name of the feature you want to work on
  4. Edit the code
  5. Write tests
  6. Run the test suit with `npm test` (will check also code style and report coverage)
  7. If everything seems ok submit the pull request

## Code Standards

The current code standard used in this project is `airbnb` with with 2 small variation:

  - Camel case identifiers are not mandatory
  - anonymous functions are disabled (I believe it's better for debugging).

The project uses `jscs`, so you can use `./node_modules/.bin/jscs lib/ tests/ bin/` to check the code standards.