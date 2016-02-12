'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HtmlTemplate = (function () {
  function HtmlTemplate() {
    _classCallCheck(this, HtmlTemplate);
  }

  _createClass(HtmlTemplate, [{
    key: 'head',
    value: function head(title) {
      var code = '<!DOCTYPE html><html><head>';
      code += '<meta charset="utf-8">';
      code += '<title>' + title + '</title>';
      code += '<meta name="viewport" content="width=device-width, initial-scale=1">';
      return code;
    }
  }, {
    key: 'scriptTags',
    value: function scriptTags(jsPath) {
      var code = '';
      code += '<script src="../components/libs/bundle.js"></script>';
      code += '<!--- if (debug) {-->';
      code += '<script src="../components/html-component/dist/env.js"></script>';
      code += '<script src="../components/html-component/dist/html-component.js"></script>';
      code += '<script src="../components/html-component/dist/html-component-debug.js"></script>';
      code += '<!--- }-->';
      code += '<!--include components-js-->';
      code += '<!--script(src="' + jsPath + '")-->';
      return code;
    }
  }, {
    key: 'componentScriptTags',
    value: function componentScriptTags(jsPath) {
      var code = '';
      code += '<script src="../../libs/bundle.js" exclude></script>';
      code += '<script src="../../html-component/dist/env.js" exclude></script>';
      code += '<script src="../../html-component/dist/html-component.js" exclude></script>';
      code += '<script src="../../html-component/dist/html-component-debug.js" exclude></script>';
      code += '<!--script(src="' + jsPath + '")-->';
      return code;
    }
  }, {
    key: 'bodyCode',
    value: function bodyCode(body) {
      var code = '';
      code += '<body>' + body;
      code += '</body></html>';
      return code;
    }
  }, {
    key: 'componentBodyCode',
    value: function componentBodyCode(body, script) {
      var code = '';
      code += '<body><!--export-->' + body;
      code += script;
      code += '<!--/export-->';
      code += '</body></html>';
      return code;
    }
  }, {
    key: 'cssCode',
    value: function cssCode(cssPath) {
      var code = '';
      code += '<!--- if (debug) {-->';
      code += '<link rel="stylesheet" href="../components/html-component/dist/html-component.css">';
      code += '<!--- }-->';
      code += '<!--include components-css-->';
      code += '<link rel="stylesheet" href="' + cssPath + '">';
      code += '</head>';
      return code;
    }
  }, {
    key: 'componentCssCode',
    value: function componentCssCode(cssPath, excludeCSS) {
      var code = '';
      code += '<link rel="stylesheet" href="../../html-component/dist/html-component.css" exclude>';
      code += '<style exclude>';
      code += excludeCSS || '';
      code += '</style>';
      code += '<!--export-->';
      code += '<link rel="stylesheet" href="' + cssPath + '">';
      code += '<!--/export-->';
      code += '</head>';
      return code;
    }
  }, {
    key: 'imageBlock',
    value: function imageBlock(meta, assetsPath) {
      var alt = meta.image.text.join('');
      var tag = '<img';
      tag += ' src="' + _path2.default.join(assetsPath, meta.image.url) + '"';
      // tag += ' width="' + meta.size.width + '"';
      // tag += ' height="' + meta.size.height + '"';
      // tag += ' height="auto"';
      if (alt) {
        alt = alt.replace(/[\r\n]/gm, '');
        tag += ' alt="' + alt + '"';
      }
      tag += '>';
      return tag;
    }
  }, {
    key: 'textBlock',
    value: function textBlock(text) {
      var texts = text.split('\n\n');
      text = '<p>' + texts.join('</p><p>') + '</p>';
      text = text.replace(/\n/g, '<br>');
      return text;
    }
  }, {
    key: 'metaData',
    value: function metaData(meta) {
      var code = '';
      if (meta) {
        code += '<meta name="description" content="' + meta.meta_description + '">';
        code += '<meta name="keywords" content="' + meta.meta_keywords + '">';
        code += '<meta name="viewport" content="width=device-width,initial-scale=1">';
        code += '<meta property="og:title" content="' + meta.meta_name + '">';
        code += '<meta property="og:site_name" content="' + meta.meta_name + '">';
        code += '<meta property="og:type" content="website">';
        code += '<meta property="og:url" content="' + meta.meta_url + '">';
        code += '<meta property="og:description" content="' + meta.meta_description + '">';
        code += '<meta property="og:image" content="' + meta.meta_image + '">';
        code += '<meta property="og:locale" content="' + meta.meta_locale + '">';
        code += '<meta http-equiv="X-UA-Compatible" content="IE=edge">';
        code += '<meta http-equiv="Content-Style-Type" content="text/css">';
        code += '<meta http-equiv="Content-Script-Type" content="text/javascript">';
        code += '<!--link rel="apple-touch-icon" href="images/touch-icon-iphone.png"-->';
        code += '<!--link rel="shortcut icon" href="images/favicon.ico"-->';
      }
      return code;
    }
  }]);

  return HtmlTemplate;
})();

exports.default = HtmlTemplate;