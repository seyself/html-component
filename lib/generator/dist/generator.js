'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HtmlTemplate = function () {
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
      tag += ' src="' + path.join(assetsPath, meta.image.url) + '"';
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
}();

exports.default = HtmlTemplate;
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nodeRestClient = require('node-rest-client');

var _nodeRestClient2 = _interopRequireDefault(_nodeRestClient);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _layouts = null;
var _options = null;
var _meta = null;
var _data = null;

var LayoutJSONParser = function () {
  function LayoutJSONParser() {
    _classCallCheck(this, LayoutJSONParser);
  }

  _createClass(LayoutJSONParser, [{
    key: 'load',
    value: function load(layoutJson, callback) {
      _layouts = layoutJson;
      _options = _layouts.options;

      if (_options.root.docs_url) {
        try {
          var client = new _nodeRestClient2.default.Client();
          client.get(_options.root.docs_url, function (data, response) {
            try {
              if (data) {
                _meta = {};
                var tsv = String(data).split('\r\n');
                var len = tsv.length;

                var tmpArray = [];
                for (var j = 0; j < len; j++) {
                  tmpArray.push(j);
                }
                for (var i in tmpArray) {
                  var cols = tsv[i].split('\t');
                  var key = cols[1];
                  var value = cols[2];
                  _meta[key] = value;
                }
              }
            } catch (e) {
              console.log('Parse Error : Google Spreadsheets');
            }
            if (callback) {
              callback();
            }
          });
        } catch (e) {
          console.log('Load Error : Google Spreadsheets');
        }
        if (callback) {
          callback();
        }
      } else {
        if (callback) {
          callback();
        }
      }
    }
  }, {
    key: 'parse',
    value: function parse() {
      _data = {
        meta: _meta
      };
      _setupDocumentData(_data, _layouts, _options);
      _setupIndexData(_layouts.index, _layouts.layers);
      // console.log JSON.stringify(_layouts.index, null, '  ')
      _setupLayoutNodesData(_data, _layouts, _options);
      return _data;
    }
  }]);

  return LayoutJSONParser;
}();

exports.default = LayoutJSONParser;

function _setupIndexData(index, layers) {
  var list = index.children;
  var len = list.length;
  var prev_id = null;
  var next_id = null;
  var parent_id = index.id;
  var minY = 9999999999;
  var maxY = 0;

  var tmpArray = [];
  for (var j = 0; j < len; j++) {
    tmpArray.push(j);
  }
  for (var i in tmpArray) {
    var item = list[i];
    var layer = layers[item.id];

    if (layer) {
      layer.parent_id = parent_id;
      layer.childIndex = i;
    }
    var option = _options[item.id];
    if (option.use_background) {
      var parent = layers[parent_id];
      parent.background = {
        image: option.layer_name,
        pos_x: option.horizontal,
        pos_y: option.vertical
      };
      item.enabled = false;
      option.enabled = false;
      item.top = 0;
      item.left = 0;
      item.bottom = 0;
      item.right = 0;
      continue;
    }
    if (layer) {
      item.top = layer.meta.position.absolute.y;
      item.left = layer.meta.position.absolute.x;
      item.bottom = layer.meta.size.height + item.top;
      item.right = layer.meta.size.width + item.left;
      layer.bounds = {
        top: item.top,
        left: item.left,
        bottom: item.bottom,
        right: item.right
      };
    } else {
      item.top = 0;
      item.left = 0;
      item.bottom = 0;
      item.right = 0;
    }
  }
  list.sort(_indexPositionSort);
  var isPositionRelative = true;
  var bottomBorder = 0;
  tmpArray = [];
  for (var j = 0; j < len; j++) {
    tmpArray.push(j);
  }
  for (var i in tmpArray) {
    item = list[i];
    if (item.enabled) {
      if (bottomBorder <= item.bottom) {
        bottomBorder = item.bottom;
      } else {
        isPositionRelative = false;
        break;
      }
    }
  }
  tmpArray = [];
  for (var j = 0; j < len; j++) {
    tmpArray.push(j);
  }
  for (var i in tmpArray) {
    item = list[i];
    item.positionRelative = isPositionRelative;
    var next = list[i + 1];
    var tmp_next_id;
    if (next) {
      tmp_next_id = next.id;
    } else {
      tmp_next_id = null;
    }
    next_id = tmp_next_id;
    item.next_id = next_id;
    item.prev_id = prev_id;

    var layer = layers[item.id];
    if (layer) {
      layer.next_id = next_id;
      layer.prev_id = prev_id;
    }
    if (item.enabled) {
      prev_id = item.id;
    }
    _setupIndexData(item, layers);
  }
}

function _indexPositionSort(a, b) {
  if (a.top == b.top) {
    if (a.left == b.left) {
      return 0;
    } else if (a.left < b.left) {
      return -1;
    }
    return 1;
  } else if (a.top < b.top) {
    return -1;
  }
  return 1;
}

function _setupDocumentData(data, layouts, options) {
  var minX = 999999;
  var minY = 0;
  var maxX = 0;
  var maxY = 0;
  var layers = layouts.layers;
  var referers = [];
  for (var id in layers) {
    var item = layers[id];
    var layerName = options[id].layer_name;
    if (layerName.match(/^@\d+$/)) {
      var ref_id = layerName.match(/^@(\d+)$/)[1];
      if (referers.indexOf(ref_id) < 0) {
        referers.push(ref_id);
      }
    }
    var pos = item.meta.position.absolute;
    var size = item.meta.size;

    var left = pos.x;
    var top = pos.y;
    var right = left + size.width;
    var bottom = top + size.height;

    if (minX > left) {
      minX = left;
    }
    if (maxX < right) {
      maxX = right;
    }
    if (maxY < bottom) {
      maxY = bottom;
    }
  }
  var root = options.root;
  var width = maxX - minX;
  var height = maxY;
  var offsetX = minX;
  var offsetY = minY;

  data.document = {
    title: root.doc_title,
    filename: root.name.split('.').shift(),
    psd: root.name,
    horizontal: root.horizontal,
    vertical: root.vertical,
    device: root.doc_type,
    width: width,
    height: height,
    offsetX: -offsetX,
    offsetY: -offsetY,
    bgcolor: root.bgcolor,
    margin: root.margin,
    referers: referers
  };
  return;
}

function _setupLayoutNodesData(data, layouts, options) {
  var nodes = {};
  var layers = layouts.layers;
  var index = layouts.index;
  for (var id in layers) {
    var item = layers[id];
    item.option = options[id];
  }
  data.index = index;
  data.layers = layers;
}
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

var _cheerio2 = require('cheerio');

var _cheerio3 = _interopRequireDefault(_cheerio2);

var _html2jade = require('html2jade');

var _html2jade2 = _interopRequireDefault(_html2jade);

var _nib = require('nib');

var _nib2 = _interopRequireDefault(_nib);

var _StylusTemplate = require('./StylusTemplate');

var _StylusTemplate2 = _interopRequireDefault(_StylusTemplate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _data = null;
var _params = null;
var _components = null;
var _assets = 'test_layout-assets/';
var _componentExportable = true;
var _ref_elements = {};
var _packageJsonTemplate = '';
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
      _params = params;
      _generateInit(params);
      var filePath = _createFilePath(params);
      var exportData = {
        style: _createStyleSheet(_data),
        html: _createHTMLCode(_data.document, filePath)
      };
      _exportHTML(params, filePath, exportData);
    }
  }]);

  return LayoutPreviewGenerator;
}();

exports.default = LayoutPreviewGenerator;

function _generateInit(params) {
  $ = _cheerio.load('<div><div id="main" class="_' + _data.document.filename + '"></div></div>', { decodeEntities: false });
  params.dest = '../app/build';
  _components = [];
  _ref_elements = {};
}

function _createStyleSheet(jsonData) {
  var $main = $('div#main');
  var params = {};
  var styleCode = _getBasicStyle(jsonData.document);
  _generateRelativeLayout(jsonData, $main, params);
  styleCode += params.css;
}

function _createHTMLCode(document, filePath) {
  var $body = $('div');
  var body = $body.html();
  body = '<div id="container">' + body + '</div>';
  if (_componentExportable) {
    body += htmlTemplate.scriptTags(filePath.jsPath);
  }

  var htmlCode = _createHTML(document.title, filePath.cssPath, body);
  htmlCode = beautify.html(htmlCode);
  return htmlCode;
}

function _exportHTML(params, filePath, data) {
  _createDestDir(params.dest, function () {
    _fs2.default.writeFile(filePath.htmlFile, data.html, { encoding: 'utf8' }, null);
    _copyHTMLAssets(data.html, function () {
      _exportJadeFile(params, data.html, filePath.jadeFile, filePath.stylusFile, data.style, filePath.cssFile);
    });
  });
}

function _createFilePath(params) {
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

function _exportCssFile(stylusFile, style, cssFile) {
  (0, _exec2.default)('mkdir -p ' + './src/pages/css', function () {
    _fs2.default.writeFile(stylusFile, style, { encoding: 'utf8' }, null);
    _generateCSS(cssFile, style);
  });
  if (_componentExportable) {
    _createComponents();
  }
}

function _createDestDir(dest, callback) {
  var dir = [_path2.default.join(dest, 'js'), _path2.default.join(dest, 'css'), 'src/pages/js', 'src/pages/css', 'src/assets', 'src/libs'].join(' ');
  (0, _exec2.default)('mkdir -p ' + dir, function () {
    if (callback) {
      callback();
    }
  });
}

function _replaceJadeFormat(jade) {
  jade = jade.replace(/([\r\n]+)\s+\|\s*[\r\n]+/g, '$1');
  jade = jade.replace(/\/\/\s/g, '//');
  jade = jade.split('//- if (debug) {').join('- if (debug) {');
  jade = jade.split('//- }').join('- }');
  return jade;
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

function _isIgnoreAssetFilePath(path) {
  if (_isFullURL(path)) {
    return true;
  }
  if (_isComponentDebugJS(path)) {
    return true;
  }
  return false;
}

function _isFullURL(url) {
  return url.match(/^https?:\/\//) != null;
}

function _isComponentDebugJS(path) {
  return path.indexOf('html-component-debug.js') >= 0;
}

function _deleteQuartFromURLText(text) {
  return text.replace(/"/g, '');
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

function _writePackageJsonTemplate() {
  var tmplPath = _path2.default.join(_moduleDir, '../../../template/package.json');
  _packageJsonTemplate = _fs2.default.readFileSync(tmplPath, { encoding: 'utf8' });
}

function _isComponent(packageJsonPath) {
  return _fs2.default.existsSync(packageJsonPath);
}

function _setComponentFiles(data) {
  var html = data.node.html();
  html = '<div class="pse ' + data.name + '">' + html + '</div>';
  var cssFile = data.name + '.css';

  _StylusTemplate2.default.componentBaseCSS(function (baseCSS) {
    html = _createHTML(data.name, cssFile, html, true, baseCSS);
    html = beautify.html(html);
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

function _createGulpFile(data) {
  var gulpFilePath = 'components/' + data.name;
  gulpFilePath = _path2.default.join(_params.cwd, gulpFilePath);
  var tmplGulpPath = _path2.default.join(_moduleDir, '../../../template/gulpfile.js');
  (0, _exec2.default)('cp ' + tmplGulpPath + ' ' + gulpFilePath, function () {
    console.log('-------- create gulp');
  });
}

function _createPackageJson(data) {
  var filePath = 'components/' + data.name + '/package.json';
  filePath = _path2.default.join(_params.cwd, filePath);
  var json = _packageJsonTemplate.split('${name}').join(data.name);
  _fs2.default.writeFileSync(filePath, json, { encoding: 'utf8' });
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

function _copyComponentAssets(data, params, callback) {
  var procList = [];
  copyProc = function copyProc(asset) {
    return function () {
      (0, _exec2.default)('mkdir -p ' + asset.mkdir, function () {
        var cmd = ['cp -fr', asset.cpSrc, asset.cpDst].join(' ');
        (0, _exec2.default)(cmd, function () {
          nextProc();
        });
      });
    };
  };
  nextProc = function nextProc() {
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

function _generateRelativeLayout(params, $main, result) {
  var doc = params.document;
  var layers = params.layers;
  var indexes = params.index;
  var offsetX = doc.offsetX;
  var offsetY = doc.offsetY;
  var className = '_' + doc.filename;
  result.css = '.' + className + '\n';
  var indentLevel = 1;
  _generateNodeList(indexes.children, className, indentLevel, doc, layers, $main, $main, result, doc.offsetX, doc.offsetY, className, false);
}

function _generateNodeList(list, parentName, indentLevel, doc, layers, $root, $element, result, offsetX, offsetY, component, isRoot) {
  for (var child in list) {
    if (child.enabled) {
      _generateNode(child, parentName, indentLevel, doc, layers, $root, $element, result, offsetX, offsetY, component, isRoot);
    }
  }
}

function _createElementTag(id, layers) {
  var data = layers[id];
  var option = data.option;
  var meta = data.meta;
  var tag = '';

  if (meta.type == 'text') {
    tag = _getText(meta.text.text);
  } else if (meta.type == 'image') {
    tag = htmlTemplate.imageBlock(meta, _params.assets_src_path);
  }
  if ((option != null).link_url) {
    tag = '<a href="' + option.link_url + '" target="' + option.link_target + '">' + tag + '</a>';
  }
  tag = '<div class="pse ' + option.name + '">' + tag + '</div>';
  return tag;
}

function _generateNode(node, parentName, indentLevel, doc, layers, $root, $element, result, offsetX, offsetY, component, isRoot) {
  var config = _setConfig(node, layers, parentName);
  var tag = _createElementTag(config.id, layers);
  var $$ = _cheerio.load(tag, { decodeEntities: false });
  var$div = $$('div');
  var childContainer = $div;
  if ((config.option != null).link_url) {
    childContainer = $$('a');
  }
  var argumentList = _makeArgumentList(config, result, indentLevel, node, layers);
  result = _createResultCSS(argumentList, isRoot, offsetX, offsetY);
  if (doc.referers.indexOf(config.id) >= 0) {
    _ref_elements[config.id] = childContainer;
  }
  _appendNodeOption(argumentList, childContainer, doc, $root, component);
  _appendComponentElement(argumentList, _cheerio, _components, $element, $div);
}

function _makeArgumentList(config, result, indentLevel, node, layers) {
  return {
    config: config,
    result: result,
    indentLevel: indentLevel,
    node: node,
    layers: layers
  };
}

function _appendNodeOption(list, childContainer, doc, $root, component) {
  var option = list.config.option;
  if (option.embed) {
    childContainer.append(unescape(option.embed));
  } else if (_layerNameIsLink(option.layer_name)) {
    _appendReferenceNode(childContainer, _ref_elements, option.layer_name);
  } else {
    _generateNodeList(list.node.children, list.config.classPath, list.indentLevel + 1, doc, list.layers, $root, childContainer, list.result, 0, 0, component, false);
  }
}

function _appendComponentElement(list, _cheerio, _components, $element, $div) {
  if (_componentExportable && list.config.data.option.component) {
    _appendComponent(list.config.id, _cheerio, _components, list.config.data.option.component, $div, list.result, $element);
  } else {
    $element.append($div);
  }
}

function _createResultCSS(list, isComponentRoot, offsetX, offsetY) {
  if (_componentExportable && list.config.data.option.component) {
    isComponentRoot = true;
    var component = list.config.data.option.component;
    list.config.className = component;

    list.result.css += _createComponentCSS(list.config.id, list.config.className, list.indentLevel, list.node, list.layers, offsetX, offsetY);
    list.result = {
      css: ''
    };
    list.indentLevel = 0;
  }
  var css = _createElementCSS(list.config.id, list.config.className, list.indentLevel, list.node, list.layers, offsetX, offsetY, component, isComponentRoot);
  list.result.css += css + '\n';
  return list.result;
}

function _appendComponent(id, cheerio, componentList, componentName, $div, result, $element) {
  componentList.push({
    id: id,
    name: componentName,
    node: $div,
    data: result
  });
  var $component = cheerio.load('<' + componentName + '></' + componentName + '>', { decodeEntities: false })(componentName);
  $element.append($component);
}

function _layerNameIsLink(layerName) {
  return layerName.match(/^@\d+/) != null;
}

function _appendReferenceNode(container, elements, layerName) {
  var ref_id = layerName.match(/^@(\d+)/)[1];
  var ref_node = elements[ref_id];
  if (ref_node) {
    container.append(ref_node.html());
  }
}

function _setConfig(node, layers, parentName) {
  var id = node.id;
  var data = layers[id];
  var option = data.option;
  var className = option.name;
  var classPath = _setClassPath(parentName, className);
  return {
    id: id,
    data: data,
    option: option,
    className: className,
    classPath: classPath
  };
}

function _setClassPath(parentName, className) {
  if (parentName) {
    var classPath = parentName + ' ' + className;
    return classPath;
  } else {
    var classPath = className;
    return classPath;
  }
}

function _createComponentCSS(id, classPath, indentLevel, node, layers, offsetX, offsetY) {
  var data = layers[id];
  var meta = data.meta;
  var _indent = _getIndent(indentLevel, INDENT_STR);
  var css = '';
  if (_indent) {
    css += _indent + '& > .' + classPath + '\n';
  } else {
    css += _indent + '.' + classPath + '\n';
  }
  _indent += INDENT_STR;
  data.top = meta.position.relative.y + offsetY;
  data.left = meta.position.relative.x + offsetX;
  var isRelative = _isPositionRelative(data, meta, node, layers);
  var parent = layers[data.parent_id];
  css += _StylusTemplate2.default.position(data, _indent, parent, isRelative, false);
  // css += stylusTemplate.size(data, _indent)
  return css;
}

function _createElementCSS(id, classPath, indentLevel, node, layers, offsetX, offsetY, component, isComponentRoot) {
  var data = layers[id];
  var meta = data.meta;
  var _indent = _getIndent(indentLevel, INDENT_STR);
  var css = '';

  css = _appendCSSElementIndent(_indent, css, classPath);
  _indent += INDENT_STR;
  css = _createTextElementCSS(meta, _indent, css);
  _setDataPosition(data, meta, offsetX, offsetY);
  css = _setDataBackground(data, css, _indent);

  var isRelative = _isPositionRelative(data, meta, node, layers);
  var parent = layers[data.parent_id];

  css += _StylusTemplate2.default.position(data, _indent, parent, isRelative, isComponentRoot);
  css += _StylusTemplate2.default.size(data, _indent);
  css += '';
  css += '';

  return css;
}

function _setDataPosition(data, meta, offsetX, offsetY) {
  data.top = meta.position.relative.y + offsetY;
  data.left = meta.position.relative.x + offsetX;
}

function _setDataBackground(data, css, _indent) {
  if (data.background && data.background.image) {
    css += _StylusTemplate2.default.background(data, _indent, _params.assets_src_path);
    return css;
  } else {
    return css;
  }
}

function _appendCSSElementIndent(_indent, css, classPath) {
  if (_indent) {
    css += _indent + '& > .' + classPath + '\n';
  } else {
    css += _indent + '.' + classPath + '\n';
  }

  return css;
}

function _getIndent(level, str) {
  if (!str) {
    str = '\t';
  }
  var code = '';
  var tmpArray = [];
  for (var j = 0; j < level; j++) {
    tmpArray.push(j);
  }
  for (var i in tmpArray) {
    code += str;
  }
  return code;
}

function _createTextElementCSS(meta, indent, css) {
  if (meta.text) {
    css += _StylusTemplate2.default.textElement(meta, indent);
    return css;
  } else {
    return css;
  }
}

function _isPositionRelative(data, meta, node, layers) {
  // if data.meta.name == 'title'
  //   console.log data.meta.name
  //   prev = layers[node.prev_id]
  //   console.log data
  //   console.log prev
  //   console.log node.positionRelative

  if (node.prev_id) {
    var prev = layers[node.prev_id];
    if (prev) {
      return _compareNodeHeight(prev, data, node, meta);
    }
  }
  if (!node.prev_id) {
    return true;
  }
  return false;
}

function _compareNodeHeight(prev, data, node, meta) {
  if (prev.bounds.bottom <= data.bounds.top) {
    data.top = data.bounds.top - prev.bounds.bottom;
    return true;
  }
  if (node.positionRelative) {
    data.top = meta.position.absolute.y - prev.bounds.bottom;
    return true;
  }
}

function _getBasicStyle(params) {
  return _StylusTemplate2.default.basicStyle(params);
}

function _getStylePSE() {
  return _StylusTemplate2.default.pse();
}

function _getText(text) {
  return htmlTemplate.textBlock(text);
}
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _stylus = require('stylus');

var _stylus2 = _interopRequireDefault(_stylus);

var _nib = require('nib');

var _nib2 = _interopRequireDefault(_nib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var INDENT_STR = '  ';
var _PSE_CSS = '';

var StylusTemplate = function () {
  function StylusTemplate() {
    _classCallCheck(this, StylusTemplate);
  }

  _createClass(StylusTemplate, [{
    key: 'basicStyle',
    value: function basicStyle(params) {
      var indent = INDENT_STR;
      var style = 'body' + '\n';
      style += indent + 'position: relative' + '\n';
      style += indent + 'margin: 0' + '\n';
      style += indent + 'padding: 0' + '\n';
      style += indent + 'min-height: 100%' + '\n';
      style += indent + 'background: ' + (params.bgcolor || '#FFF') + '\n';
      style += '\n';
      style += '#container' + '\n';
      style += indent + 'position: relative' + '\n';
      style += indent + 'margin: ' + (params.margin || 0) + '\n';
      style += indent + 'padding: 0' + '\n';
      style += indent + 'width: 100%' + '\n';
      style += '\n';
      style += '#main' + '\n';
      style += indent + 'position: relative' + '\n';
      style += indent + 'margin: 0 auto' + '\n';
      style += indent + 'padding: 0' + '\n';
      style += indent + 'width: ' + 100 + '%' + '\n';
      style += indent + 'max-width: ' + params.width + 'px' + '\n';
      style += '\n';
      style += 'p' + '\n';
      style += indent + 'position: relative' + '\n';
      style += indent + 'margin: 0 0 32px' + '\n';
      style += indent + 'padding: 0' + '\n';
      style += '\n';
      style += 'span, a' + '\n';
      style += indent + 'display: inline-block' + '\n';
      style += indent + 'margin: 0' + '\n';
      style += indent + 'padding: 0' + '\n';
      style += '\n';
      style += 'img' + '\n';
      style += indent + 'display: block' + '\n';
      style += indent + 'margin: 0' + '\n';
      style += indent + 'padding: 0' + '\n';
      style += '\n';
      style += this.pse();
      return style;
    }
  }, {
    key: 'pse',
    value: function pse() {
      var indent = INDENT_STR;
      var style = '';
      style += '.pse' + '\n';
      style += indent + 'position: absolute' + '\n';
      style += indent + 'display: block' + '\n';
      style += indent + 'box-sizing: border-box' + '\n';
      style += indent + 'top: 0' + '\n';
      style += indent + 'left: 0' + '\n';
      style += indent + 'margin: 0' + '\n';
      style += indent + 'padding: 0' + '\n';
      // style += indent + 'overflow: hidden' + '\n';
      // style += 'border: solid 1px #999' + '\n';
      // style += 'transparent: true' + '\n';
      // style += 'opacity: 0.5' + '\n';
      // style += 'background: #FF0000' + '\n';
      style += '\n';
      return style;
    }
  }, {
    key: 'componentBase',
    value: function componentBase() {
      var indent = INDENT_STR;
      var style = '';
      style += this.pse();
      return style;
    }
  }, {
    key: 'componentBaseCSS',
    value: function componentBaseCSS(callback) {
      if (_PSE_CSS) {
        callback(_PSE_CSS);
      } else {
        (0, _stylus2.default)(this.componentBase()).set('compress', false).use((0, _nib2.default)()).render(function (err, css) {
          if (err) {
            console.log('stylus #render() >>', err);
          } else {
            _PSE_CSS = css;
            callback(_PSE_CSS);
          }
        });
      }
    }
  }, {
    key: 'textElement',
    value: function textElement(meta, indent) {
      var size = Number(meta.text.size.replace(/\spx/, ''));
      var css = '';
      css += indent + 'font-family: "' + meta.text.font + '"' + '\n';
      css += indent + 'font-size:' + meta.text.size.replace(/\s+/g, '') + '' + '\n';
      css += indent + 'color: #' + meta.text.color + '' + '\n';
      css += indent + 'text-align: ' + meta.text.align + '' + '\n';
      if (typeof meta.text.line_height == 'number') {
        css += indent + 'line-height: ' + meta.text.line_height + '' + '\n';
      } else if (typeof meta.text.line_height == 'string') {
        css += indent + 'line-height: ' + (meta.text.line_height != null).replace(/\s+/g, '') + '' + '\n';
      }
      css += indent + 'letter-spacing: ' + (meta.text != null).letter_spacing / 6000 * size + 'px' + '\n';
      return css;
    }
  }, {
    key: 'position',
    value: function position(data, indent, parent) {
      var isRelative = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
      var isRoot = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];

      var css = '';
      var translateX = 0;
      var translateY = 0;
      var isFirstNode = data.prev_id == null;
      var isLastNode = data.next_id == null;
      var isInlineBlock = false;
      // if isFirstNode && data.top != 0 && data.option.horizontal != 'right'
      //   css += indent + 'display: inline-block' + '\n'
      //   isInlineBlock = true
      if (isRelative) {
        css += indent + 'position: relative' + '\n';
      }
      if (isRoot) {
        return css;
      }
      if (data.option.horizontal == 'center') {
        if (parent) {
          var posLeft = data.left - (parent.bounds.right - parent.bounds.left) / 2;
          css += indent + 'left: 50%' + '\n';
          css += indent + 'margin-left: ' + posLeft + 'px' + '\n';
        } else if (isRelative && !isInlineBlock) {
          css += indent + 'margin-left: auto' + '\n';
          css += indent + 'margin-right: auto' + '\n';
        } else {
          css += indent + 'left: 50%' + '\n';
          translateX = '-50%';
        }
      } else if (data.option.horizontal == 'right' && parent) {
        if (isRelative && !isInlineBlock) {
          css += indent + 'margin-left: auto' + '\n';
          css += indent + 'margin-right: ' + (parent.meta.size.width - data.meta.size.width - data.left) + 'px' + '\n';
        } else {
          css += indent + 'right: ' + (parent.meta.size.width - data.meta.size.width - data.left) + 'px' + '\n';
        }
      } else if (data.left != 0) {
        //if data.option.horizontal == 'left'
        css += indent + 'left: ' + data.left + 'px' + '\n';
      }
      if (data.option.vertical == 'middle') {
        css += indent + 'margin-top: 50%' + '\n';
        translateY = '-50%';
      } else if (data.option.vertical == 'bottom' && parent) {
        css += indent + 'bottom: ' + (parent.meta.size.height - data.meta.size.height - data.top) + 'px' + '\n';
      } else if (data.top != 0) {
        //if data.option.vertical == 'top'
        css += indent + 'margin-top: ' + data.top + 'px' + '\n';
        if (isFirstNode && data.meta.type == 'image') {
          css += indent + 'display: inline-block' + '\n';
        }
      }
      if (translateX || translateY) {
        css += indent + 'transform: translate(' + translateX + ', ' + translateY + ')' + '\n';
      }

      return css;
    }
  }, {
    key: 'size',
    value: function size(data, indent) {
      var size = data.meta.size;
      var css = '';
      if (data.option.flex == 'w100') {
        css += indent + 'width: ' + '100%' + '\n';
        css += indent + 'max-width: ' + size.width + 'px' + '\n';
      } else {
        css += indent + 'width: ' + size.width + 'px' + '\n';
      }
      css += indent + 'height: ' + size.height + 'px' + '\n';
      return css;
    }
  }, {
    key: 'background',
    value: function background(data, indent, assetsPath) {
      var bg_url = _path2.default.join(assetsPath, data.background.image);
      var bg_x = data.background.pos_x;
      var bg_y = data.background.pos_y;
      if (bg_y == 'middle') {
        bg_y = 'center';
      }
      var css = '';
      css += indent + 'background: url("../' + bg_url + '") no-repeat' + '\n';
      css += indent + 'background-position: ' + bg_x + ' ' + bg_y + '' + '\n';
      css += indent + 'background-size: cover' + '\n';
      css += indent + 'overflow: hidden' + '\n';
      return css;
    }
  }]);

  return StylusTemplate;
}();

exports.default = StylusTemplate;
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
