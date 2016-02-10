'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.exportHTML = exportHTML;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _exec = require('exec');

var _exec2 = _interopRequireDefault(_exec);

var _html2jade = require('html2jade');

var _html2jade2 = _interopRequireDefault(_html2jade);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _stylus = require('stylus');

var _stylus2 = _interopRequireDefault(_stylus);

var _jsBeautify = require('js-beautify');

var _jsBeautify2 = _interopRequireDefault(_jsBeautify);

var _StylusTemplate = require('../StylusTemplate');

var _StylusTemplate2 = _interopRequireDefault(_StylusTemplate);

var _HtmlTemplate = require('../HtmlTemplate');

var _HtmlTemplate2 = _interopRequireDefault(_HtmlTemplate);

var _nib = require('nib');

var _nib2 = _interopRequireDefault(_nib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var stylusTemplate = new _StylusTemplate2.default();
var htmlTemplate = new _HtmlTemplate2.default();
var _componentExportable = true;
var _packageJsonTemplate = '';
var RE_ASSET_FILE = /"[^"]+\.(png|jpg|gif|json|svg|swf|mp3|mp4|mov|wav|ogg|webm)"/gm;
var _params = null;
var _moduleDir = module.filename.replace(/\/[^\/]+$/, '/');
var _components = null;

function exportHTML(params, filePath, data, components) {
  _components = components;
  _params = params;
  _createDestDir(params.dest, function () {
    _fs2.default.writeFile(filePath.htmlFile, data.html, { encoding: 'utf8' }, null);
    _copyHTMLAssets(data.html, function () {
      _exportJadeFile(params, data.html, filePath.jadeFile, filePath.stylusFile, data.style, filePath.cssFile);
    });
  });
}

function _createDestDir(dest, callback) {
  var dir = [_path2.default.join(dest, 'js'), _path2.default.join(dest, 'css'), 'src/pages/js', 'src/pages/css', 'src/assets', 'src/libs'].join(' ');

  (0, _exec2.default)('mkdir -p ' + dir, function (e) {
    if (callback) {
      callback();
    }
  });
}

function _copyHTMLAssets(html, callback) {
  var pathes = [];
  var matches = html.match(RE_ASSET_FILE);
  if (matches) {
    _getAssetFilePathList(pathes, matches);
  }
  var copyList = _createCopyList(pathes);
  _copyComponentAssets(null, { assets: copyList }, callback);
}

function _exportJadeFile(params, html, jadeFile, stylusFile, style, cssFile) {
  if (params.export_jade) {
    (0, _exec2.default)('mkdir -p ' + './src/pages', function () {
      _html2jade2.default.convertHtml(html, { donotencode: true }, function (err, jade) {
        jade = _replaceJadeFormat(jade);
        _fs2.default.writeFile(jadeFile, jade, { encoding: 'utf8' }, null);
        _exportCssFile(stylusFile, style, cssFile);
      });
    });
  } else {
    if (_componentExportable) {
      _createComponents();
    }
  }
}

function _getAssetFilePathList(dest, filePathList) {
  filePathList.forEach(function (filePath) {
    filePath = _deleteQuartFromURLText(filePath);
    var src = _path2.default.dirname(filePath);
    if (_isIgnoreAssetFilePath(filePath)) {
      // not replace
      // console.log filePath
    } else if (dest.indexOf(src) < 0) {
        dest.push(src);
      }
  });
}

function _createCopyList(pathes) {
  var copyList = [];
  for (var src in pathes) {
    var src_diff_1 = _path2.default.join(_params.cwd, src.replace(_params.assets_src_path, _params.assets_dest));
    var src_diff_2 = _path2.default.join(_params.cwd, _params.assets_dest);
    var srcDir = _path2.default.join(_params.assets_src, src_diff_1.replace(src_diff_2, ''));
    var dstDir = _path2.default.dirname(src_diff_1);
    copyList.push({
      mkdir: dstDir,
      cpSrc: srcDir,
      cpDst: dstDir
    });
  }
  return copyList;
}

function _copyComponentAssets(data, params, callback) {
  var procList = [];
  var copyProc = function copyProc(asset) {
    return function () {
      (0, _exec2.default)('mkdir -p ' + asset.mkdir, function () {
        var cmd = ['cp -fr', asset.cpSrc, asset.cpDst].join(' ');
        (0, _exec2.default)(cmd, function () {
          nextProc();
        });
      });
    };
  };
  var nextProc = function nextProc() {
    var proc = procList.shift();
    if (proc) {
      proc();
    } else {
      callback();
    }
  };
  for (var item in params.assets) {
    procList.push(copyProc(item));
  }
  nextProc();
}

function _replaceJadeFormat(jade) {
  jade = jade.replace(/([\r\n]+)\s+\|\s*[\r\n]+/g, '$1');
  jade = jade.replace(/\/\/\s/g, '//');
  jade = jade.split('//- if (debug) {').join('- if (debug) {');
  jade = jade.split('//- }').join('- }');
  return jade;
}

function _exportCssFile(stylusFile, style, cssFile) {
  (0, _exec2.default)('mkdir -p ' + './src/pages/css', function () {
    _fs2.default.writeFile(stylusFile, style, { encoding: 'utf8' }, null);
    _generateCSS(cssFile, style);
  });
  if (_componentExportable) {
    _createComponents();
  }
}

function _createComponents() {
  if (!_packageJsonTemplate) {
    _writePackageJsonTemplate();
  }

  var data = _components.shift();

  if (data) {
    var packageJsonPath = 'components/' + data.name + '/package.json';
    var isWritable = true;
    if (_isComponent(packageJsonPath)) {
      var packageJson = _fs2.default.readFileSync(packageJsonPath, { encoding: 'utf8' });
      if (packageJson) {
        packageJson = JSON.parse(packageJson);
        // package.jsonのversionが'0.0.0'以外の時はコンポーネントは作らない
        if (packageJson.version != '0.0.0') {
          _createComponents();
          return;
        }
      }
      console.log('create component #' + data.name);
      _setComponentFiles(data);
    }
  }
}

function _deleteQuartFromURLText(text) {
  return text.replace(/"/g, '');
}

function _isIgnoreAssetFilePath(path) {
  if (_isFullURL(path)) {
    return true;
  }
  if (_isComponentDebugJS(path)) {
    return true;
  }
  return false;
}

function _generateCSS(cssFile, style) {
  (0, _stylus2.default)(style).set('compress', false).use((0, _nib2.default)()).render(function (err, css) {
    if (err) {
      console.log('stylus #render() >>', err);
    } else {
      _fs2.default.writeFile(cssFile, css, { encoding: 'utf8' }, null);
    }
  });
}

function _writePackageJsonTemplate() {
  var tmplPath = _path2.default.join(_moduleDir, '../../../../template/package.json');
  _packageJsonTemplate = _fs2.default.readFileSync(tmplPath, { encoding: 'utf8' });
}

function _isComponent(packageJsonPath) {
  return _fs2.default.existsSync(packageJsonPath);
}

function _setComponentFiles(data) {
  var html = data.node.html();
  html = '<div class="pse ' + data.name + '">' + html + '</div>';
  var cssFile = data.name + '.css';

  stylusTemplate.componentBaseCSS(function (baseCSS) {
    html = _createHTML(data.name, cssFile, html, true, baseCSS);
    html = _jsBeautify2.default.html(html);
    var params = _replaceAssetPath(data, html);
    _copyComponentAssets(data, params, function () {
      _createComponentFiles(data, params, function () {
        _createPackageJson(data);
        _createGulpFile(data);
        _createComponents();
      });
    });
  });
}

function _isFullURL(url) {
  return url.match(/^https?:\/\//) != null;
}

function _isComponentDebugJS(path) {
  return path.indexOf('html-component-debug.js') >= 0;
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

function _replaceAssetPath(data, html) {
  var pathes = [];
  var result = {
    html: html,
    base: 'components/' + data.name + '/dist/',
    assets: []
  };
  var dstBase = result.base;
  var matches = html.match(RE_ASSET_FILE);
  (matches != null).forEach(function (code) {
    code = code.replace(/"/g, '');
    var src = _path2.default.dirname(code);
    if (code.match(/^https?:\/\//) || code.indexOf('html-component-debug.js') >= 0) {
      // not replace
      // console.log code
      return pathes;
    } else if (pathes.indexOf(src) < 0) {
      pathes.push(src);
    }
  });
  for (var src in pathes) {
    result = _setAssetPathList(dstBase, src, result);
  }
  return result;
}

function _createComponentFiles(data, params, callback) {
  var filePath = _createComponentFilePath(data);
  (0, _exec2.default)('mkdir -p ' + filePath.dstDir, function () {
    _fs2.default.writeFileSync(filePath.htmlFile, params.html, { encoding: 'utf8' });
    _generateCSS(filePath.cssFile, filePath.style);
    if (_params.export_jade) {
      _createSrcFiles(filePath, params, callback);
    } else {
      callback();
    }
  });
}

function _createPackageJson(data) {
  var filePath = 'components/' + data.name + '/package.json';
  filePath = _path2.default.join(_params.cwd, filePath);
  var json = _packageJsonTemplate.split('${name}').join(data.name);
  _fs2.default.writeFileSync(filePath, json, { encoding: 'utf8' });
}

function _createGulpFile(data) {
  var gulpFilePath = 'components/' + data.name;
  gulpFilePath = _path2.default.join(_params.cwd, gulpFilePath);
  var tmplGulpPath = _path2.default.join(_moduleDir, '../../../template/gulpfile.js');
  (0, _exec2.default)('cp ' + tmplGulpPath + ' ' + gulpFilePath, function () {
    console.log('-------- create gulp');
  });
}

function _getMetaData() {
  return htmlTemplate.metaData(_data.meta);
}

function _setAssetPathList(dstBase, src, result) {
  var asset = _path2.default.join('component-assets', src.replace(_params.assets_src_path, ''));
  var srcDir = _path2.default.join(_params.assets_src, src.replace(_params.assets_src_path, ''));
  var dst = _path2.default.join(dstBase, asset);
  var dstDir = _path2.default.join(_params.cwd, _path2.default.dirname(dst));
  result.html = result.html.split(src).join(asset);
  result.assets.push({
    mkdir: dst,
    cpSrc: srcDir,
    cpDst: dstDir
  });
  return result;
}

function _createComponentFilePath(data) {
  var dstDir = 'components/' + data.name + '/dist/';
  var srcDir = 'components/' + data.name + '/src/';
  var style = data.data.css;
  var htmlFile = './' + dstDir + data.name + '.html';
  var cssFile = './' + dstDir + data.name + '.css';
  var jadeFile = './' + srcDir + data.name + '.jade';
  var stylFile = './' + srcDir + data.name + '.styl';
  return {
    dstDir: dstDir,
    srcDir: srcDir,
    style: style,
    htmlFile: htmlFile,
    cssFile: cssFile,
    jadeFile: jadeFile,
    stylFile: stylFile
  };
}

function _createSrcFiles(filePath, params, callback) {
  (0, _exec2.default)('mkdir -p ' + filePath.srcDir, function () {
    _html2jade2.default.convertHtml(params.html, { donotencode: true }, function (err, jade) {
      jade = _replaceJadeFormat(jade);
      _fs2.default.writeFileSync(filePath.jadeFile, jade, { encoding: 'utf8' });
      _fs2.default.writeFileSync(filePath.stylFile, filePath.style, { encoding: 'utf8' });
      callback();
    });
  });
}