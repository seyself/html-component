'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _generateInit = require('./generate/generateInit.js');

var _createFilePath = require('./generate/createFilePath.js');

var _createStyleSheet = require('./generate/createStyleSheet.js');

var _createHTMLCode = require('./generate/createHTMLCode.js');

var _exportHTML = require('./generate/exportHTML.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _data = null;
var _components = [];
var $ = null;

var LayoutPreviewGenerator = (function () {
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
      var initParams = (0, _generateInit.generateInit)(params, _data);
      $ = initParams.$;
      params.dest = initParams.dest;
      var filePath = (0, _createFilePath.createFilePath)(params);
      var exportData = {
        style: (0, _createStyleSheet.createStyleSheet)(_data, params, $, _components),
        html: (0, _createHTMLCode.createHTMLCode)(_data.document, filePath, _data, $)
      };
      (0, _exportHTML.exportHTML)(params, filePath, exportData, _components);
    }
  }]);

  return LayoutPreviewGenerator;
})();

exports.default = LayoutPreviewGenerator;