# node-boilerpipe

A node.js wrapper for [Boilerpipe](https://code.google.com/p/boilerpipe/), an excellent Java library for boilerplate removal and fulltext extraction from HTML pages.


## Installation

node-boilerpipe depends on [Boilerpipe](https://code.google.com/p/boilerpipe/) v1.2.0 or higher.

WARNING: Don't forget to set JAVA variable referred to [node-java](https://github.com/nearinfinity/node-java).

Via [npm](https://npmjs.org):

    $ npm install boilerpipe

### Source code project

    $ mvn compile
    $ mvn package

## Usage

### Load in the module
```javascript
  var Boilerpipe = require('boilerpipe');
```

### Create a new instance
The constructor takes a `extractor`, being one of the available boilerpipe extractor types:

  * DefaultExtractor
  * ArticleExtractor
  * ArticleSentencesExtractor
  * KeepEverythingExtractor
  * KeepEverythingWithMinKWordsExtractor
  * LargestContentExtractor
  * NumWordsRulesExtractor
  * CanolaExtractor

If no extractor is passed the `DefaultExtractor` will be used by default. Additional keyword arguments are either `html` for HTML text or `url`.
```javascript
  var boilerpipe = new Boilerpipe();

  var boilerpipe = new Boilerpipe({
    extractor: Boilerpipe.Extractor.Canola
  });

  var boilerpipe = new Boilerpipe({
    extractor: Boilerpipe.Extractor.Article,
    url: 'http://...'
  });

  var boilerpipe = new Boilerpipe({
    extractor: Boilerpipe.Extractor.ArticleSentences,
    html: '<html>...</html>'
  }, function(err) {
    ...
  });
```

### Set URL or HTML
If you set both URL and HTML then only URL will work for you. HTML will be ignored at this case.
```javascript
  boilerpipe.setUrl('http://...');

  boilerpipe.setHtml('<html>...</html>');
```

### Get text, html and images
```javascript
  boilerpipe.getText(function(err, text) {
    ...
  });

  boilerpipe.getHtml(function(err, html) {
    ...
  });

  boilerpipe.getImages(function(err, images) {
    ...
  });
```

## License
