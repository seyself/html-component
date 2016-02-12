
import fs from 'fs';
import exec from 'exec';
import html2jade from 'html2jade';
import path from 'path';
import stylus from 'stylus';
import beautify from 'js-beautify';
import _stylusTemplate from '../StylusTemplate';
import _htmlTemplate from '../HtmlTemplate';
import nib from 'nib';

var stylusTemplate = new _stylusTemplate();
var htmlTemplate = new _htmlTemplate();
var _componentExportable = true;
var _packageJsonTemplate = '';
var RE_ASSET_FILE = /"[^"]+\.(png|jpg|gif|json|svg|swf|mp3|mp4|mov|wav|ogg|webm)"/gm;
var _params = null;
var _moduleDir = module.filename.replace(/\/[^\/]+$/, '/');
var _components = null;

export function exportHTML(params, filePath, data, components){
  _components = components;
  _params = params;
  _createDestDir(params.dest, function(){
    fs.writeFile(filePath.htmlFile, data.html, {encoding:'utf8'}, null);
    _copyHTMLAssets(data.html, function(){
      _exportJadeFile(params, data.html, filePath.jadeFile, filePath.stylusFile, data.style, filePath.cssFile);
    });
  });
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

function _copyHTMLAssets(html, callback){
  var pathes = [];
  var matches = html.match(RE_ASSET_FILE);
  if(matches){
    _getAssetFilePathList(pathes, matches);
  }
  var copyList = _createCopyList(pathes);
  _copyComponentAssets(null, {assets:copyList}, callback);
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

function _replaceJadeFormat(jade){
  jade = jade.replace(/([\r\n]+)\s+\|\s*[\r\n]+/g, '$1');
  jade = jade.replace(/\/\/\s/g, '//');
  jade = jade.split('//- if (debug) {').join('- if (debug) {');
  jade = jade.split('//- }').join('- }');
  return jade;
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
    else 
    {
      _setComponentFiles(data);
    }
  }
}

function _deleteQuartFromURLText(text){
  return text.replace(/"/g, '');
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

function _writePackageJsonTemplate(){
  var tmplPath = path.join(_moduleDir, '../../../../template/package.json')
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

function _isFullURL(url){
  return url.match(/^https?:\/\//) != null;
}

function _isComponentDebugJS(path){
  return path.indexOf('html-component-debug.js') >= 0;
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

function _replaceAssetPath(data, html){
  var pathes = [];
  var result = {
    html: html,
    base: 'components/' + data.name + '/dist/',
    assets: []
  };
  var dstBase = result.base;
  var matches = html.match(RE_ASSET_FILE);
  if(matches != null){
    matches.forEach(function(code){
      code = code.replace(/"/g, '');
      var src = path.dirname(code);
      if(code.match(/^https?:\/\//) || code.indexOf('html-component-debug.js') >= 0){
        return pathes;
      }else if(pathes.indexOf(src) < 0){
        pathes.push(src);
      }
    });
  }
  for(var src in pathes){
    result = _setAssetPathList(dstBase, src, result);
  }
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

function _createPackageJson(data){
  var filePath = 'components/' + data.name + '/package.json';
  filePath = path.join(_params.cwd, filePath);
  var json = _packageJsonTemplate.split('${name}').join(data.name);
  fs.writeFileSync(filePath, json, {encoding:'utf8'});
}

function _createGulpFile(data){
  var gulpFilePath = 'components/' + data.name;
  gulpFilePath = path.join(_params.cwd, gulpFilePath);
  var tmplGulpPath = path.join(_moduleDir, '../../../template/gulpfile.js');
  exec('cp ' + tmplGulpPath + ' ' + gulpFilePath, function(){
    console.log('-------- create gulp');
  });
}

function _getMetaData(){
  return htmlTemplate.metaData(_data.meta);
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

