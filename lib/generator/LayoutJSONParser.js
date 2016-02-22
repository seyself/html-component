'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createDocumentData = require('./parser/createDocumentData.js');

var _setupIndexData = require('./parser/setupIndexData.js');

var _setLayerOption = require('./parser/setLayerOption.js');

var _MetaDataLoader = require('./parser/MetaDataLoader.js');

var _MetaDataLoader2 = _interopRequireDefault(_MetaDataLoader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _layouts = null;
var _options = null;
var _meta = null;

var LayoutJSONParser = function () {
  function LayoutJSONParser() {
    _classCallCheck(this, LayoutJSONParser);
  }

  _createClass(LayoutJSONParser, [{
    key: 'load',
    value: function load(layoutJson, callback) {
      _layouts = require(layoutJson);
      _options = _layouts.options;

      var metaDataLoader = new _MetaDataLoader2.default();
      var metaDataURL = metaDataLoader.getSpreadSheetURL(_options);
      if (metaDataURL) {
        metaDataLoader.loadSpreadSheet(metaDataURL, function (metaData) {
          _meta = metaData;
          if (callback) {
            callback();
          }
        });
      } else {
        if (callback) {
          callback();
        }
      }
    }
  }, {
    key: 'parse',
    value: function parse() {
      (0, _setupIndexData.setupIndexData)(_layouts, _options);
      (0, _setLayerOption.setLayerOption)(_layouts, _options);
      return {
        meta: _meta,
        document: (0, _createDocumentData.createDocumentData)(_layouts, _options),
        index: _layouts.index,
        layers: _layouts.layers
      };
    }
  }]);

  return LayoutJSONParser;
}();

exports.default = LayoutJSONParser;