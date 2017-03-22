var ArticleExtractor, ArticleSentencesExtractor, Boilerpipe, BoilerpipeSAXInput, CanolaExtractor, DefaultExtractor, HTMLFetcher, HTMLHighlighter, ImageExtractor, InputSource, KeepEverythingExtractor, KeepEverythingWithMinKWordsExtractor, LargestContentExtractor, NumWordsRulesExtractor, StringReader, async, convertImageJavaObjectsToJs, java;

async = require('async');

java = require('java');

java.classpath.push(__dirname + "/../jar/nekohtml-1.9.13.jar");

java.classpath.push(__dirname + "/../jar/xerces-2.9.1.jar");

java.classpath.push(__dirname + "/../jar/boilerpipe-core-1.2.0-xissy.jar");

HTMLFetcher = java["import"]('de.l3s.boilerpipe.sax.HTMLFetcher');

InputSource = java["import"]('org.xml.sax.InputSource');

StringReader = java["import"]('java.io.StringReader');

BoilerpipeSAXInput = java["import"]('de.l3s.boilerpipe.sax.BoilerpipeSAXInput');

ArticleExtractor = java["import"]('de.l3s.boilerpipe.extractors.ArticleExtractor');

ArticleSentencesExtractor = java["import"]('de.l3s.boilerpipe.extractors.ArticleSentencesExtractor');

CanolaExtractor = java["import"]('de.l3s.boilerpipe.extractors.CanolaExtractor');

DefaultExtractor = java["import"]('de.l3s.boilerpipe.extractors.DefaultExtractor');

KeepEverythingExtractor = java["import"]('de.l3s.boilerpipe.extractors.KeepEverythingExtractor');

KeepEverythingWithMinKWordsExtractor = java["import"]('de.l3s.boilerpipe.extractors.KeepEverythingWithMinKWordsExtractor');

LargestContentExtractor = java["import"]('de.l3s.boilerpipe.extractors.LargestContentExtractor');

NumWordsRulesExtractor = java["import"]('de.l3s.boilerpipe.extractors.NumWordsRulesExtractor');

HTMLHighlighter = java["import"]('de.l3s.boilerpipe.sax.HTMLHighlighter');

ImageExtractor = java["import"]('de.l3s.boilerpipe.sax.ImageExtractor');

Boilerpipe = (function() {
  Boilerpipe.Extractor = {
    Article: ArticleExtractor.INSTANCE,
    ArticleSentences: ArticleSentencesExtractor.INSTANCE,
    Canola: CanolaExtractor.INSTANCE,
    Default: DefaultExtractor.INSTANCE,
    KeepEverything: KeepEverythingExtractor.INSTANCE,
    KeepEverythingWithMinKWords: KeepEverythingWithMinKWordsExtractor.INSTANCE,
    LargestContent: LargestContentExtractor.INSTANCE,
    NumWordsRules: NumWordsRulesExtractor.INSTANCE
  };

  function Boilerpipe(params, callback) {
    var k, v;
    for (k in params) {
      v = params[k];
      this[k] = v;
    }
    if (this.extractor == null) {
      this.extractor = Boilerpipe.Extractor.Default;
    }
    if (this.isProcessed == null) {
      this.isProcessed = false;
    }
    if (callback != null) {
      this.process(callback);
    }
  }

  Boilerpipe.prototype.process = function(callback) {
    if (!this.url && !this.html) {
      return callback(new Error('No URL or HTML provided'));
    }
    return async.waterfall([
      (function(_this) {
        return function(callback) {
          if (_this.url != null) {
            return async.waterfall([
              function(callback) {
                return java.newInstance('java.net.URL', _this.url, callback);
              }, function(urlObject, callback) {
                return HTMLFetcher.fetch(urlObject, callback);
              }, function(htmlDocument, callback) {
                _this.htmlDocument = htmlDocument;
                return htmlDocument.toInputSource(callback);
              }
            ], callback);
          } else {
            return async.waterfall([
              function(callback) {
                return java.newInstance('java.io.StringReader', _this.html, callback);
              }, function(stringReader, callback) {
                return java.newInstance('org.xml.sax.InputSource', stringReader, callback);
              }
            ], callback);
          }
        };
      })(this), (function(_this) {
        return function(inputSource, callback) {
          return async.waterfall([
            function(callback) {
              return java.newInstance('de.l3s.boilerpipe.sax.BoilerpipeSAXInput', inputSource, callback);
            }, function(saxInput, callback) {
              return saxInput.getTextDocument(callback);
            }
          ], callback);
        };
      })(this)
    ], (function(_this) {
      return function(err, textDocument) {
        _this.textDocument = textDocument;
        _this.isProcessed = true;
        return _this.extractor.process(textDocument, callback);
      };
    })(this));
  };

  Boilerpipe.prototype.setUrl = function(url, callback) {
    this.url = url;
    this.html = null;
    this.isProcessed = false;
    if (callback != null) {
      this.process(callback);
    }
    return this;
  };

  Boilerpipe.prototype.setHtml = function(html, callback) {
    this.url = null;
    this.html = html;
    this.isProcessed = false;
    if (callback != null) {
      this.process(callback);
    }
    return this;
  };

  Boilerpipe.prototype.checkIsProcessed = function(callback) {
    if (!this.isProcessed) {
      return this.process(callback);
    } else {
      return callback(null);
    }
  };

  Boilerpipe.prototype.getText = function(callback) {
    return this.checkIsProcessed((function(_this) {
      return function(err) {
        if (err != null) {
          return callback(err);
        }
        return _this.textDocument.getContent(callback);
      };
    })(this));
  };

  Boilerpipe.prototype.getHtml = function(callback) {
    return this.checkIsProcessed((function(_this) {
      return function(err) {
        if (err != null) {
          return callback(err);
        }
        return async.waterfall([
          function(callback) {
            return HTMLHighlighter.newExtractingInstance(callback);
          }, function(highlighter, callback) {
            var html;
            if (_this.html != null) {
              html = _this.html;
            }
            if (_this.url != null) {
              html = _this.htmlDocument.toInputSourceSync();
            }
            return highlighter.process(_this.textDocument, html, callback);
          }
        ], callback);
      };
    })(this));
  };

  Boilerpipe.prototype.getImages = function(callback) {
    return this.checkIsProcessed((function(_this) {
      return function(err) {
        var html;
        if (err != null) {
          return callback(err);
        }
        if (_this.html != null) {
          html = _this.html;
        }
        if (_this.url != null) {
          html = _this.htmlDocument.toInputSourceSync();
        }
        return ImageExtractor.INSTANCE.process(_this.textDocument, html, function(err, imageJavaObjects) {
          if (err != null) {
            return callback(err);
          }
          return convertImageJavaObjectsToJs(imageJavaObjects, callback);
        });
      };
    })(this));
  };

  return Boilerpipe;

})();

convertImageJavaObjectsToJs = function(imageObjects, callback) {
  if (typeof err !== "undefined" && err !== null) {
    return callback(err);
  }
  return imageObjects.size(function(err, size) {
    var j, results;
    if (err != null) {
      return callback(err);
    }
    if (size === 0) {
      return callback(null, []);
    }
    return async.map((function() {
      results = [];
      for (var j = 0; 0 <= size ? j < size : j > size; 0 <= size ? j++ : j--){ results.push(j); }
      return results;
    }).apply(this), function(i, callback) {
      return imageObjects.get(i, function(err, imageObject) {
        if (err != null) {
          return callback(err);
        }
        return async.parallel({
          src: function(callback) {
            return imageObject.getSrc(callback);
          },
          width: function(callback) {
            return imageObject.getWidth(function(err, width) {
              if (width != null) {
                width = Number(width);
              }
              return callback(err, width);
            });
          },
          height: function(callback) {
            return imageObject.getHeight(function(err, height) {
              if (height != null) {
                height = Number(height);
              }
              return callback(err, height);
            });
          },
          alt: function(callback) {
            return imageObject.getAlt(callback);
          },
          area: function(callback) {
            return imageObject.getArea(callback);
          }
        }, callback);
      });
    }, callback);
  });
};

module.exports = Boilerpipe;

