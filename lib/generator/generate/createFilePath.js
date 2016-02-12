'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createFilePath = createFilePath;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createFilePath(params) {
  var htmlFile = _path2.default.join(params.dest_dir, params.filename);
  var jadeFile = './src/pages/' + params.filename.replace('.html', '.jade');
  var cssFile = _path2.default.join(params.dest_dir, 'css');
  cssFile = _path2.default.join(cssFile, _path2.default.basename(htmlFile).replace('.html', '.css'));
  var stylusFile = './src/pages/css/' + params.filename.replace('.html', '.styl');
  var cssPath = _path2.default.relative(_path2.default.dirname(htmlFile), cssFile);
  var jsPath = cssPath.replace(/[^\/]+\/([^.]+)\.css/, 'js/$1.js');
  return {
    htmlFile: htmlFile,
    jadeFile: jadeFile,
    cssFile: cssFile,
    stylusFile: stylusFile,
    cssPath: cssPath,
    jsPath: jsPath
  };
}