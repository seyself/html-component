'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cheerio2 = require('cheerio');

var _cheerio3 = _interopRequireDefault(_cheerio2);

var _generateInit2 = require('./generate/generateInit.js');

var _createFilePath = require('./generate/createFilePath.js');

var _createStyleSheet = require('./generate/createStyleSheet.js');

var _createHTMLCode = require('./generate/createHTMLCode.js');

var _exportHTML = require('./generate/exportHTML.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _data = null;
var _components = [];
var $ = null;

var LayoutPreviewGenerator = function () {
  function LayoutPreviewGenerator() {
    _classCallCheck(this, LayoutPreviewGenerator);
  }

  _createClass(LayoutPreviewGenerator, [{
    key: 'load',
    value: function load(data) {
      _data = data;
      return;
    }
  }, {
    key: 'generate',
    value: function generate(params) {
      _generateInit(params);
      var filePath = (0, _createFilePath.createFilePath)(params);
      var exportData = {
        style: (0, _createStyleSheet.createStyleSheet)(_data, params, $, _components),
        html: (0, _createHTMLCode.createHTMLCode)(_data.document, filePath, _data, $)
      };
      (0, _exportHTML.exportHTML)(params, filePath, exportData, _components);
    }
  }]);

  return LayoutPreviewGenerator;
}();

exports.default = LayoutPreviewGenerator;

function _generateInit(params) {
  $ = _cheerio3.default.load('<div><div id="main" class="_' + _data.document.filename + '"></div></div>', { decodeEntities: false });
  params.dest = '../app/build';
}