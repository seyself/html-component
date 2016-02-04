
import exec from 'exec';
import stylus from 'stylus';
import beautify from 'js-beautify';
import path from 'path';
import fs from 'fs';
import _cheerio from 'cheerio';
import html2jade from 'html2jade';
import nib from 'nib';

import _stylusTemplate from './StylusTemplate';
import _htmlTemplate from './HtmlTemplate';
var stylusTemplate = new _stylusTemplate();
var htmlTemplate = new _htmlTemplate();

var _data = null;
var _params = null;
var _components = null;
var _assets = 'test_layout-assets/';
var _componentExportable = true;
var _ref_elements = {};
var _packageJsonTemplate = '';
var $ = null;
var RE_ASSET_FILE = /"[^"]+\.(png|jpg|gif|json|svg|swf|mp3|mp4|mov|wav|ogg|webm)"/gm;
var INDENT_STR = '  ';
var _moduleDir = module.filename.replace(/\/[^\/]+$/, '/');

export default class LayoutPreviewGenerator{

  constructor(){
  }

  load(data){
    _data = data;
    return;
  }

  generate(params){
    _params = params;
    _generateInit(params);
    var filePath = _createFilePath(params);
    var exportData = {
      style: _createStyleSheet(_data),
      html: _createHTMLCode(_data.document, filePath)
    };
    _exportHTML(params, filePath, exportData);
  }
}

function _generateInit(params){
  $ = _cheerio.load('<div><div id="main" class="_' + _data.document.filename + '"></div></div>', {decodeEntities: false});
  params.dest = '../app/build';
  _components = [];
  _ref_elements = {};
}

function _createStyleSheet(jsonData){
  var $main = $('div#main');
  var params = {};
  var styleCode = _getBasicStyle(jsonData.document);
  _generateRelativeLayout(jsonData, $main, params);
  styleCode += params.css;
  return styleCode;
}

function _createHTMLCode(document, filePath){
  var $body = $('div');
  var body = $body.html();
  body = '<div id="container">' + body + '</div>';
  if(_componentExportable){
    body += htmlTemplate.scriptTags(filePath.jsPath);
  }

  var htmlCode = _createHTML(document.title, filePath.cssPath, body);
  htmlCode = beautify.html(htmlCode);
  return htmlCode;
}

function _exportHTML(params, filePath, data){
  _createDestDir(params.dest, function(){
    fs.writeFile(filePath.htmlFile, data.html, {encoding:'utf8'}, null);
    _copyHTMLAssets(data.html, function(){
      _exportJadeFile(params, data.html, filePath.jadeFile, filePath.stylusFile, data.style, filePath.cssFile);
    });
  });
}

function _createFilePath(params){
  var htmlFile = path.join(params.dest_dir, params.filename);
  var jadeFile = './src/pages/' + params.filename.replace('.html', '.jade');
  var cssFile = path.join(params.dest_dir, 'css');
  cssFile = path.join(cssFile, path.basename(htmlFile).replace('.html', '.css'));
  var stylusFile = './src/pages/css/' + params.filename.replace('.html', '.styl');
  var cssPath = path.relative(path.dirname(htmlFile), cssFile);
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

function _exportJadeFile(params, html, jadeFile, stylusFile, style, cssFile){
  if(params.export_jade){
    exec('mkdir -p ' + './src/pages', function(){
      html2jade.convertHtml(html, {donotencode:true}, function(err, jade){
        jade = _replaceJadeFormat(jade);
        fs.writeFile(jadeFile, jade, {encoding:'utf8'}, null);
        _exportCssFile( stylusFile, style, cssFile);
      });
    });
  }
  else{
    if(_componentExportable){
      _createComponents();
    }
  }
}

function _exportCssFile(stylusFile, style, cssFile){
  exec('mkdir -p ' + './src/pages/css', function(){
    fs.writeFile(stylusFile, style, {encoding:'utf8'}, null);
    _generateCSS(cssFile, style);
  });
  if(_componentExportable){
    _createComponents();
  }
}

function _createDestDir(dest, callback){
  var dir = [
    path.join(dest, 'js'),
    path.join(dest, 'css'),
    'src/pages/js',
    'src/pages/css',
    'src/assets',
    'src/libs'
  ].join(' ');

  exec('mkdir -p ' + dir, function(e){
    if(callback){
      callback();
    }
  });
}

function _replaceJadeFormat(jade){
  jade = jade.replace(/([\r\n]+)\s+\|\s*[\r\n]+/g, '$1');
  jade = jade.replace(/\/\/\s/g, '//');
  jade = jade.split('//- if (debug) {').join('- if (debug) {');
  jade = jade.split('//- }').join('- }');
  return jade;
}

function _generateCSS(cssFile, style){
  stylus(style)
  .set('compress', false)
  .use(nib())
  .render(function(err, css){
    if(err){
      console.log('stylus #render() >>', err);
    }else{
      fs.writeFile(cssFile, css, {encoding:'utf8'}, null);
    }
  });
}

function _getAssetFilePathList(dest, filePathList){
  filePathList.forEach(function(filePath){
    filePath = _deleteQuartFromURLText(filePath);
    var src = path.dirname(filePath);
    if(_isIgnoreAssetFilePath(filePath)){
      // not replace
      // console.log filePath
    }else if(dest.indexOf(src) < 0){
      dest.push(src);
    }
  });
}

function _isIgnoreAssetFilePath(path){
  if(_isFullURL(path)){
    return true;
  }
  if(_isComponentDebugJS(path)){
    return true;
  }
  return false;
}

function _isFullURL(url){
  return url.match(/^https?:\/\//) != null;
}

function _isComponentDebugJS(path){
  return path.indexOf('html-component-debug.js') >= 0;
}

function _deleteQuartFromURLText(text){
  return text.replace(/"/g, '');
}

function _copyHTMLAssets(html, callback){
  var pathes = [];
  var matches = html.match(RE_ASSET_FILE);
  if(matches){
    _getAssetFilePathList(pathes, matches);
  }
  var copyList = _createCopyList(pathes);
  _copyComponentAssets(null, {assets:copyList}, callback);
}

function _createCopyList(pathes){
  var copyList = [];
  for(var src in pathes){
    var src_diff_1 = path.join(_params.cwd, src.replace(_params.assets_src_path, _params.assets_dest));
    var src_diff_2 = path.join(_params.cwd, _params.assets_dest);
    var srcDir = path.join(_params.assets_src, src_diff_1.replace(src_diff_2, ''));
    var dstDir = path.dirname(src_diff_1);
    copyList.push({
          mkdir: dstDir,
          cpSrc: srcDir,
          cpDst: dstDir
        });
  }
  return copyList;
}

function _createComponents(){
  if(!_packageJsonTemplate){
    _writePackageJsonTemplate();
  }

  var data = _components.shift();

  if(data){
    var packageJsonPath = 'components/' + data.name + '/package.json';
    var isWritable = true;
    if(_isComponent(packageJsonPath)){
      var packageJson = fs.readFileSync(packageJsonPath, {encoding:'utf8'});
      if(packageJson){
        packageJson = JSON.parse(packageJson);
        // package.jsonのversionが'0.0.0'以外の時はコンポーネントは作らない
        if(packageJson.version != '0.0.0'){
          _createComponents();
          return;
        }
      }
    console.log('create component #' + data.name);
    _setComponentFiles(data);
    }
  }
}
    
function _writePackageJsonTemplate(){
  var tmplPath = path.join(_moduleDir, '../../../template/package.json')
  _packageJsonTemplate = fs.readFileSync(tmplPath, {encoding:'utf8'});
}

function _isComponent(packageJsonPath){
  return fs.existsSync(packageJsonPath);
}

function _setComponentFiles(data){
  var html = data.node.html();
  html = '<div class="pse ' + data.name + '">' + html + '</div>';
  var cssFile = data.name + '.css';

  stylusTemplate.componentBaseCSS(function(baseCSS){
    html = _createHTML(data.name, cssFile, html, true, baseCSS);
    html = beautify.html(html);
    var params = _replaceAssetPath(data, html);
    _copyComponentAssets(data, params, function(){
      _createComponentFiles(data, params, function(){
        _createPackageJson(data);
        _createGulpFile(data);
        _createComponents();
      });
    });
  });
}

function _createGulpFile(data){
  var gulpFilePath = 'components/' + data.name;
  gulpFilePath = path.join(_params.cwd, gulpFilePath);
  var tmplGulpPath = path.join(_moduleDir, '../../../template/gulpfile.js');
  exec('cp ' + tmplGulpPath + ' ' + gulpFilePath, function(){
    console.log('-------- create gulp');
  });
}

function _createPackageJson(data){
  var filePath = 'components/' + data.name + '/package.json';
  filePath = path.join(_params.cwd, filePath);
  var json = _packageJsonTemplate.split('${name}').join(data.name);
  fs.writeFileSync(filePath, json, {encoding:'utf8'});
}

function _replaceAssetPath(data, html){
  var pathes = [];
  var result = {
    html: html,
    base: 'components/' + data.name + '/dist/',
    assets: []
  };
  var dstBase = result.base;
  var matches = html.match(RE_ASSET_FILE);
  (matches != null).forEach(function(code){
    code = code.replace(/"/g, '');
    var src = path.dirname(code);
    if(code.match(/^https?:\/\//) || code.indexOf('html-component-debug.js') >= 0){
      // not replace
      // console.log code
      return pathes;
    }else if(pathes.indexOf(src) < 0){
      pathes.push(src);
    }
  });
  for(var src in pathes){
    result = _setAssetPathList(dstBase, src, result);
  }
  return result;
}

function _setAssetPathList(dstBase, src, result){
  var asset = path.join('component-assets', src.replace(_params.assets_src_path, ''));
  var srcDir = path.join(_params.assets_src, src.replace(_params.assets_src_path, ''));
  var dst = path.join(dstBase, asset);
  var dstDir = path.join(_params.cwd, path.dirname(dst));
  result.html = result.html.split(src).join(asset);
  result.assets.push({
      mkdir: dst,
      cpSrc: srcDir,
      cpDst: dstDir
    });
  return result;
}

function _createComponentFiles(data, params, callback){
  var filePath = _createComponentFilePath(data);
  exec('mkdir -p ' + filePath.dstDir, function(){
    fs.writeFileSync(filePath.htmlFile, params.html, {encoding:'utf8'});
    _generateCSS(filePath.cssFile, filePath.style);
    if(_params.export_jade){
      _createSrcFiles(filePath, params, callback);
    }else{
      callback();
    }
  });
}

function _createSrcFiles(filePath, params, callback){
  exec('mkdir -p ' + filePath.srcDir, function(){
    html2jade.convertHtml(params.html, {donotencode:true}, function(err, jade){
      jade = _replaceJadeFormat(jade);
      fs.writeFileSync(filePath.jadeFile, jade, {encoding:'utf8'});
      fs.writeFileSync(filePath.stylFile, filePath.style, {encoding:'utf8'});
      callback()
    });
  });
}

function _createComponentFilePath(data){
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

function _copyComponentAssets(data, params, callback){
  var procList = [];
  var copyProc = function(asset){
    return function(){
      exec('mkdir -p ' + asset.mkdir, function(){
        var cmd = ['cp -fr', asset.cpSrc, asset.cpDst].join(' ');
        exec(cmd, function(){
          nextProc();
        });
      });
    }
  }
  var nextProc = function(){
    var proc = procList.shift();
    if(proc){
      proc();
    }else{
      callback();
    }
  }
  for(var item in params.assets){
    procList.push(copyProc(item));
  }
  nextProc();
}

function _createHTML(title, cssPath, body, exportComment, baseCSS){
  var code = htmlTemplate.head(title);
  if(exportComment){
    var jsPath = cssPath.replace('.css', '.js');
    code += htmlTemplate.componentCssCode(cssPath, baseCSS);
    code += htmlTemplate.componentBodyCode(body, htmlTemplate.componentScriptTags(jsPath));
  }else{
    code += _getMetaData();
    code += htmlTemplate.cssCode(cssPath);
    code += htmlTemplate.bodyCode(body);
  }
  return code;
}

function _getMetaData(){
  return htmlTemplate.metaData(_data.meta);
}

function _generateRelativeLayout(params, $main, result){
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

function _generateNodeList(list, parentName, indentLevel, doc, layers, $root, $element, result, offsetX, offsetY, component, isRoot){
  for(var child in list){
    if(list[child].enabled){
      _generateNode(list[child], parentName, indentLevel, doc, layers, $root, $element, result, offsetX, offsetY, component, isRoot);
    }
  }
}

function _createElementTag(id, layers){
  var data = layers[id];
  var option = data.option;
  var meta = data.meta;
  var tag = '';

  if(meta.type == 'text'){
    tag = _getText(meta.text.text);
  }else if(meta.type == 'image'){
    tag = htmlTemplate.imageBlock(meta, _params.assets_src_path);
  }
  if((option != null).link_url){
    tag = '<a href="' + option.link_url + '" target="' + option.link_target + '">' + tag + '</a>';
  }
  tag = '<div class="pse ' + option.name + '">' + tag + '</div>';
  return tag;
}

function _generateNode(node, parentName, indentLevel, doc, layers, $root, $element, result, offsetX, offsetY, component, isRoot){
  var config = _setConfig(node, layers, parentName);
  var tag = _createElementTag(config.id, layers);
  var $$ = _cheerio.load(tag, {decodeEntities: false});
  var $div = $$('div');
  var childContainer = $div;
  if((config.option != null).link_url){
    childContainer = $$('a');
  }
  var argumentList = _makeArgumentList(config, result, indentLevel, node, layers);
  result = _createResultCSS(argumentList, isRoot, offsetX, offsetY);
  if(doc.referers.indexOf(config.id) >= 0){
    _ref_elements[config.id] = childContainer;
  }
  _appendNodeOption(argumentList, childContainer, doc, $root, component);
  _appendComponentElement(argumentList, _cheerio, _components, $element, $div);
}

function _makeArgumentList(config, result, indentLevel, node, layers){
  return {
    config: config,
    result: result,
    indentLevel: indentLevel,
    node: node,
    layers: layers
  };
}

function _appendNodeOption(list, childContainer, doc, $root, component){
  var option = list.config.option;
  if(option.embed){
    childContainer.append(unescape(option.embed));
  }else if(_layerNameIsLink(option.layer_name)){
    _appendReferenceNode(childContainer, _ref_elements, option.layer_name);
  }else{
    _generateNodeList(list.node.children, list.config.classPath, list.indentLevel + 1, doc, list.layers, $root, childContainer, list.result, 0, 0, component, false);
  }
}

function _appendComponentElement(list, _cheerio, _components, $element, $div){
  if(_componentExportable && list.config.data.option.component){
    _appendComponent(list.config.id, _cheerio, _components, list.config.data.option.component, $div, list.result, $element);
  }else{
    $element.append($div);
  }
}

function _createResultCSS(list, isComponentRoot, offsetX, offsetY){
  if(_componentExportable && list.config.data.option.component){
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
  list.result.css += css + '\n'
  return list.result
}

function _appendComponent(id, cheerio, componentList, componentName, $div, result, $element){
  componentList.push({
      id: id,
      name: componentName,
      node: $div,
      data: result
    });
  var $component = cheerio.load('<' + componentName + '></' + componentName + '>', {decodeEntities: false})(componentName);
  $element.append($component);
}

function _layerNameIsLink(layerName){
  return layerName.match(/^@\d+/) != null;
}

function _appendReferenceNode(container, elements, layerName){
  var ref_id = layerName.match(/^@(\d+)/)[1];
  var ref_node = elements[ref_id];
  if(ref_node){
    container.append(ref_node.html());
  }
}

function _setConfig(node, layers, parentName){
  var id = node.id;
  var data = layers[id];
  // console.log(node);
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

function _setClassPath(parentName, className){
  if(parentName){
    var classPath = parentName + ' ' + className;
    return classPath;
  }else{
    var classPath = className;
    return classPath;
  }
}

function _createComponentCSS(id, classPath, indentLevel, node, layers, offsetX, offsetY){
  var data = layers[id];
  var meta = data.meta;
  var _indent = _getIndent(indentLevel, INDENT_STR);
  var css = '';
  if(_indent){
    css += _indent + '& > .' + classPath + '\n';
  }else{
    css += _indent + '.' + classPath + '\n';
  }
  _indent += INDENT_STR;
  data.top = meta.position.relative.y + offsetY;
  data.left = meta.position.relative.x + offsetX;
  var isRelative = _isPositionRelative(data, meta, node, layers);
  var parent = layers[data.parent_id];
  css += stylusTemplate.position(data, _indent, parent, isRelative, false);
  // css += stylusTemplate.size(data, _indent)
  return css;
}

function _createElementCSS(id, classPath, indentLevel, node, layers, offsetX, offsetY, component, isComponentRoot){
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

  css += stylusTemplate.position(data, _indent, parent, isRelative, isComponentRoot);
  css += stylusTemplate.size(data, _indent);
  css += '';
  css += '';

  return css;
}

function _setDataPosition(data, meta, offsetX, offsetY){
  data.top = meta.position.relative.y + offsetY;
  data.left = meta.position.relative.x + offsetX;
}

function _setDataBackground(data, css, _indent){
  if(data.background && data.background.image){
    css += stylusTemplate.background(data, _indent, _params.assets_src_path);
    return css;
  }else{
    return css;
  }
}

function _appendCSSElementIndent(_indent, css, classPath){
  if(_indent){
    css += _indent + '& > .' + classPath + '\n';
  }else{
    css += _indent + '.' + classPath + '\n';
  }

  return css;
}

function _getIndent(level, str){
  if(!str){
    str = '\t';
  }
  var code = '';
  var tmpArray=[];
  for(var j=0; j<level; j++){
    tmpArray.push(j);
  }
  for(var i in tmpArray){
    code += str;
  }
  return code;
}

function _createTextElementCSS(meta, indent, css){
  if(meta.text){
    css += stylusTemplate.textElement(meta, indent);
    return css;
  }else{
    return css;
  }
}

function _isPositionRelative(data, meta, node, layers){
  // if data.meta.name == 'title'
  //   console.log data.meta.name
  //   prev = layers[node.prev_id]
  //   console.log data
  //   console.log prev
  //   console.log node.positionRelative

  if(node.prev_id){
    var prev = layers[node.prev_id];
    if(prev){
      return _compareNodeHeight(prev, data, node, meta);
    }
  }
  if(!node.prev_id){
    return true;
  }
  return false;
}

function _compareNodeHeight(prev, data, node, meta){
  if(prev.bounds.bottom <= data.bounds.top){
    data.top = data.bounds.top - prev.bounds.bottom;
    return true;
  }
  if(node.positionRelative){
    data.top = meta.position.absolute.y - prev.bounds.bottom;
    return true;
  }
}

function _getBasicStyle(params){
  return stylusTemplate.basicStyle(params);
}

function _getStylePSE(){
  return stylusTemplate.pse();
}

function _getText(text){
  return htmlTemplate.textBlock(text);
}

