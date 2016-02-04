'use strict';

var _exec = require('exec');

var _exec2 = _interopRequireDefault(_exec);

var _stylus = require('stylus');

var _stylus2 = _interopRequireDefault(_stylus);

var _jsBeautify = require('js-beautify');

var _jsBeautify2 = _interopRequireDefault(_jsBeautify);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _html2jade = require('html2jade');

var _html2jade2 = _interopRequireDefault(_html2jade);

var _nib = require('nib');

var _nib2 = _interopRequireDefault(_nib);

var _LayoutPreviewGenerator = require('./LayoutPreviewGenerator');

var _LayoutPreviewGenerator2 = _interopRequireDefault(_LayoutPreviewGenerator);

var _HtmlTemplate = require('./HtmlTemplate');

var _HtmlTemplate2 = _interopRequireDefault(_HtmlTemplate);

var _StylusTemplate = require('./StylusTemplate');

var _StylusTemplate2 = _interopRequireDefault(_StylusTemplate);

var _LayoutJSONParser = require('./LayoutJSONParser');

var _LayoutJSONParser2 = _interopRequireDefault(_LayoutJSONParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var jsx = jsx || {};

function init() {

  var RE_ASSET_FILE = /"[^"]+\.(png|jpg|gif|json|svg|swf|mp3|mp4|mov|wav|ogg|webm)"/gm;
  var INDENT_STR = '  ';
  var _moduleDir = module.filename.replace(/\/[^\/]+$/, '/');

  jsx.LayoutPreviewGenerator = _LayoutPreviewGenerator2.default;
  jsx.HtmlTemplate = _HtmlTemplate2.default;
  jsx.StylusTemplate = _StylusTemplate2.default;
  jsx.LayoutJSONParser = _LayoutJSONParser2.default;
}

jsx.init = init;

module.exports = jsx;