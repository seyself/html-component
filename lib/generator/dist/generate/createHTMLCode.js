'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createHTMLCode = createHTMLCode;

var _cheerio2 = require('cheerio');

var _cheerio3 = _interopRequireDefault(_cheerio2);

var _jsBeautify = require('js-beautify');

var _jsBeautify2 = _interopRequireDefault(_jsBeautify);

var _HtmlTemplate = require('../HtmlTemplate');

var _HtmlTemplate2 = _interopRequireDefault(_HtmlTemplate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var htmlTemplate = new _HtmlTemplate2.default();
var _componentExportable = true;
var _data = null;

function createHTMLCode(document, filePath, data, $) {
  _data = data;
  var $body = $('div');
  var body = $body.html();
  body = '<div id="container">' + body + '</div>';
  if (_componentExportable) {
    body += htmlTemplate.scriptTags(filePath.jsPath);
  }

  var htmlCode = _createHTML(document.title, filePath.cssPath, body);
  htmlCode = _jsBeautify2.default.html(htmlCode);
  return htmlCode;
}

function _createHTML(title, cssPath, body, exportComment, baseCSS) {
  var code = htmlTemplate.head(title);
  if (exportComment) {
    var jsPath = cssPath.replace('.css', '.js');
    code += htmlTemplate.componentCssCode(cssPath, baseCSS);
    code += htmlTemplate.componentBodyCode(body, htmlTemplate.componentScriptTags(jsPath));
  } else {
    code += _getMetaData();
    code += htmlTemplate.cssCode(cssPath);
    code += htmlTemplate.bodyCode(body);
  }
  return code;
}

function _getMetaData() {
  return htmlTemplate.metaData(_data.meta);
}