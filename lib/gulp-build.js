'use strict';

var through = require('through2');
var gutil = require('gulp-util');
var path = require('path');
var _ = require('lodash');
var fs = require('fs');
var CleanCSS = require('clean-css');
var UglifyJS = require("uglify-js");
var jsbeautify = require('js-beautify').js;
var cssbeautify = require('js-beautify').css;
var htmlbeautify = require('js-beautify').html;
var htmlMinify = require('html-minifier').minify;
var exec = require('exec');

var cssCodes = [];
var jsCodes = [];
var styleList = [];
var scriptList = [];
var currentPath = "";
var componentPath = "";
var destPath = "";
var rootPath = "";
var srcPath = "";
var assetPath = "";
var destJsPath = "";
var destCssPath = "";
var destHTMLPath = "";
var destHTMLDir = "";
var minify = false;
var html_min = false;
var js_min = false;
var css_min = false;
var isAbsoluteAssetsPath = false;

var EXCLUDE_TAG = "exclude";

module.exports = function (options)
{
  function transform(file, encoding, callback)
  {
    currentPath = process.cwd();
    componentPath = options.components;
    destPath = options.dest;
    destJsPath = options.dest_js;
    destCssPath = options.dest_css;
    srcPath = options.src;
    assetPath = options.assets || destPath;
    rootPath = options.root;
    html_min = options.html_min || false;
    js_min   = options.js_min   || false;
    css_min  = options.css_min  || false;
    isAbsoluteAssetsPath = options.absoluteAssetPath == true;

    // options.beforeScript: null,      // コンポーネント用JSの頭に追加する
    // options.afterScript: 'src/libs/ComponentAfterScript.js', // コンポーネント用JSの最後に追加する
    // options.beforeStyle: null,       // コンポーネント用CSSの頭に追加する
    // options.afterStyle: null,        // コンポーネント用CSSの最後に追加する

    destHTMLPath = getDestPath(file.path, 'html');
    destHTMLDir = path.dirname(destHTMLPath);
    console.log("out " + destHTMLPath);

    styleList = [];
    scriptList = [];

    if (file.isNull())
    {
      this.push(file);
      return callback();
    }

    if (file.isStream())
    {
      this.emit('error', new gutil.PluginError('gulp-html-components', 'Streaming not supported'));
      return callback();
    }

    var content = file.contents.toString();

    content = parseSourceHTML(content);

    content = writeStyles(file.path, content, options);   // --------------- コンポーネントが使用しているCSSを、外部ファイルにまとめる
    content = writeScripts(file.path, content, options);  // --------------- コンポーネントが使用しているJavaScriptを、外部ファイルにまとめる

    content = htmlMinify(content, {
      collapseWhitespace: true,
      conservativeCollapse: true,
      preserveLineBreaks: true
    });
    content = content.replace(/>\s+</g, "><");

    // ---------------------------------------------------------------------------- shader のコードは圧縮しないように一時退避させる
    var tmpScriptCodes = [""];
    var tmpScriptCodesNum = 0;
    content = content.replace(/<script[^>]*type="x-shader\/x-(fragment|vertex)"[^>]*>(.|\s)*?(<\/script>)/igm,
        function(text){
          tmpScriptCodes.push(text);
          tmpScriptCodesNum++;
          return "<!--{{{ script-code-" + tmpScriptCodesNum + " }}}-->";
        }
    );

    // ---------------------------------------------------------------------------- htmlソースを整頓する
    if (!html_min)
    {
      content = htmlbeautify(content, {
        extra_liners: [],
        indent_inner_html: false,
        indent_scripts: 'keep',
        unformatted: ['span','br','a','img','b','i','em','pre', 'script']
      });
    }


    // ---------------------------------------------------------------------------- 退避させた Shader コードを元に戻す
    content = content.replace(/<\!--{{{ script-code-(\d+) }}}-->/igm,
        function(text, num){
          return tmpScriptCodes[Number(num)];
        }
    );

    writeFiles(cssCodes);
    writeFiles(jsCodes);

    file.contents = new Buffer(content);
    this.push(file);
    callback();
  }

  function flush(callback) 
  {
    callback();
  }

  return through.obj(transform, flush);
};

function parseSourceHTML(content, _compName)
{
  return content.replace(/<(\w+\-[^>\s]+)\s?(.|\s)*?(<\/\1>)/igm, //コンポーネントタグを抜き出す // <...> 〜 </...>
      function(text)
      {
        var item = text;
        var items = item.match(/<(\w+\-[^>\s]+)\s?(.|\s)*?>/i); // 開始タグとタグ名を取り出す // [ <tag-name attr='...'>, tag-name, ...]
        if (items)
        {
          item = items[0];
        }
        else
        {
          item = null;
        }

        // コンポーネントの読み込み
        if (item && items.length > 2)
        {
          var name = items[1];
          var tagContent = getTagContent(item, name, text);
          var matches = item.match(/\s([\w\-]+)(=('|").+?\3)?/ig); // タグの属性を分解して取り出す // [ aaa='1', bbb='true', ccc, ...]
          var data = parseAttributes(matches);
          data.yield = tagContent;
          var replacedHTML = loadComponent(name, data);    // --------------- 使用しているコンポーネントを参照しデータを取り出す
          if (_compName != name)
            replacedHTML = parseSourceHTML(replacedHTML, name);    // --------------- コンポーネント内で別のコンポーネントを使っていないかチェックする
          return replacedHTML;
        }
        return text;
      }
  );
}

function getTagContent(beginTag, tagName, content)
{
  content = content.replace(beginTag, '');
  content = content.replace('</' + tagName + '>', '');
  content = content.replace(/[\s\t\r\n]+$/ig, '');
  content = content.replace(/^[\s\t\r\n]+/ig, '');
  return content;
}

function writeFiles(list)
{
  var len = list.length;
  for(var i=0; i<len; i++)
  {
    var item = list[i];
    var dir = path.relative(currentPath, path.dirname(item.dest));
    writeFileFunction(dir, item);
  }
}

function writeFileFunction(dir, item)
{
  if (fs.existsSync(dir))
  {
    fs.writeFileSync(item.dest, item.code);
  }
  else
  {
    fs.mkdirSync(dir);
    fs.writeFileSync(item.dest, item.code);
  }
}

// -------------------------------------------------------------------------------- 使用しているCSSのコードをまとめる
function writeStyles(filepath, html, options)
{
  var code = "";
  var list = styleList;
  var len = list.length;
  var readFiles = [];
  var before = options.beforeStyle ? fs.readFileSync(options.beforeStyle) : "";
  var after  = options.afterStyle  ? fs.readFileSync(options.afterStyle)  : "";

  for(var i=0; i<len; i++)
  {
    var item = list[i];
    if (item.code)
    {
      //まったく同じコードは読まない
      if (readFiles.indexOf(item.code) < 0)
      {
        item.code = replaceAssetPath(item.code, item, destCssPath);
        code += item.code;
        readFiles.push(item.code);
      }
    }
    else
    if (item.src)
    {
      try
      {
        //1回読んだファイルは読まない
        if (readFiles.indexOf(item.src) < 0)
        {
          var text = fs.readFileSync(item.src, 'utf8');
          text = replaceAssetPath(text, item, destCssPath);
          code += text;
          readFiles.push(item.src);
        }
      }
      catch(err)
      {
        code += "/**" + String(err) + "*/\n";
      }
    }
  }

  if (code)
  {
    var dest = getDestPath(filepath, 'css', '_components');

    if (before) code = before + '\n' + code;
    if (after)  code = code + '\n' + after;

    var mincss = new CleanCSS().minify(code);

    if (mincss.errors.length == 0)
      code = mincss.styles;

    if (!css_min)
      code = cssbeautify(code, {
        selector_separator_newline: false
      });
    cssCodes.push({dest:dest, code:code});

    console.log('out', dest);

    var insertPath = path.relative(rootPath, dest);
    if (isAbsoluteAssetsPath)
      insertPath = '/' + insertPath;

    var includeComment = '<!--include components-css-->';

    if (html.indexOf(includeComment) >= 0)
      html = html.replace(includeComment, '<link rel="stylesheet" href="' + insertPath + '" />');
    else
      html = html.replace('</head>', '\n<link rel="stylesheet" href="' + insertPath + '" />\n</head>');
  }

  return html;
}

// -------------------------------------------------------------------------------- 使用しているJavaScriptのコードをまとめる
function writeScripts(filepath, html, options)
{
  var code = "";
  var before = options.beforeScript ? fs.readFileSync(options.beforeScript) : "";
  var after  = options.afterScript  ? fs.readFileSync(options.afterScript)  : "";
  var list = scriptList;
  var len = list.length;
  var readFiles = [];
  var srcList = [];
  for(var i=0; i<len; i++)
  {
    var item = list[i];
    if (item.code)
    {
      // ------------------------ まったく同じコードは読まない
      if (readFiles.indexOf(item.code) < 0)
      {
        item.code = replaceAssetPath(item.code, item, destPath);
        code += item.code;
        readFiles.push(item.code);
      }
    }
    else
    if (item.src)
    {
      try
      {
        // ---------------------- 1回読んだファイルは読まない
        if (readFiles.indexOf(item.src) < 0)
        {
          if (item.src.match(/^(https?:)?\/\/.+/))
          {
            srcList.push('<script src="' + item.src + '"></script>');
          }
          else
          {
            var text = fs.readFileSync(item.src, 'utf8');
            text = replaceAssetPath(text, item, destPath);
            code += text;
          }
          readFiles.push(item.src);
        }
      }
      catch(err)
      {
        code += "/**" + String(err) + "*/\n";
      }
    }
  }
  var code2 = srcList.join('\n');
  if (code)
  {
    if (before) code = before + '\n' + code;
    if (after)  code = code + '\n' + after;

    if (js_min)
      code = UglifyJS.minify(code, {fromString:true}).code;
    else
      code = jsbeautify(code);

    var dest = getDestPath(filepath, 'js', '_components');
    jsCodes.push({dest:dest, code:code});

    console.log('out', dest);
    var insertPath = path.relative(rootPath, dest);
    if (isAbsoluteAssetsPath)
      insertPath = '/' + insertPath;
    code2 += '\n<script src="' + insertPath + '"></script>';
  }

  var includeComment = '<!--include components-js-->';
  if (html.indexOf(includeComment) >= 0)
    html = html.replace(includeComment, code2);
  else
    html = html.replace('</body>', code2 + '\n</body>');

  return html;
}

// -------------------------------------------------------------------------------- タグの属性をパースしてオブジェクトで返す
function parseAttributes(attrs)
{
  var data = {};
  if (!attrs) return data;

  var len = attrs.length;
  for(var i=0; i<len; i++)
  {
    var attr = attrs[i];
    attr = attr.replace(/^\s/, '');
    attr = attr.split("=");
    var key = attr.shift();
    var value = attr.shift();
    if (value === undefined) value = null;
    if (value != null)
    {
      value = value.replace(/^['"]/, "");
      value = value.replace(/['"]$/, "");
    }
    data[key] = value;
  }
  return data;
}

// -------------------------------------------------------------------------------- コンポーネントファイルを読み込んで、データを置き換えて返す
function loadComponent(name, data)
{
  console.log(destHTMLPath + " > " + name);
  var result = "";
  try
  {
    var current = process.cwd();

    // ---------------------------------------------------------------------------- package.json から "main": に指定されたファイルパスを取得する
    var jsonPath = getRelativePath(name + '/package.json');
    var json = fs.readFileSync(jsonPath, enc);
    json = JSON.parse(json);
    var filePath = getRelativePath(name + '/' + json.main);
    var enc = 'utf8';
    var componentPath = path.dirname(filePath);
    var text = fs.readFileSync(filePath, enc);
    text = parseComponentHTML(text);
    if (data && text)
    {
      try
      {
        text = _.template(text)(data);
        // console.log(text, data);
      }
      catch(err)
      {
        // console.log(err);
        text += "<!-- " + String(err) + " -->\n";
      }
    }
    text = parseStyles(componentPath, name, text);        // ------------- コンポーネントが使用しているCSSを抽出する
    text = parseScripts(componentPath, name, text);       // ------------- コンポーネントが使用しているJavaScriptを抽出する
    text = replaceAssetPath(text, {name:name}, destPath); // ------------- コンポーネントで使用しているAssetのパスを変更する
    copyAssets(componentPath, name);                      // ------------- コンポーネントで使用しているAssetファイルをコピーする

    result = text;
  }
  catch(err)
  {
    result = "<!-- " + String(err) + " -->\n";
  }
  return result;
}

// -------------------------------------------------------------------------------- コンポーネントで使用しているAssetファイルをコピーする
function copyAssets(componentPath, componentName)
{
  var fromAssetDir = componentPath + '/component-assets/*';
  var toAssetDir = getAssetDir(componentName);
  exec('mkdir -p ' + toAssetDir, function(err, stdout, stderr){
    //if (err) console.log('Error:', stderr);
  });

  exec('cp -rf ' + fromAssetDir + ' ' + toAssetDir, function(err, stdout, stderr){
    //if (err) console.log('Error:', stderr);
  });
}

function getAssetDir(componentName)
{
  return path.join(destPath, destHTMLDir + '/assets/' + componentName + '/');
}

function replaceAssetPath(text, data, dir)
{
  try
  {
    var baseDir = "";
    var fileDir = destHTMLDir + '/assets/' + data.name;
    fileDir = path.join(rootPath, fileDir);
    if (isAbsoluteAssetsPath)
    {
      baseDir = '/' + fileDir;
    }
    else
    {
      baseDir = path.relative(dir, fileDir);
    }
    text = text.replace(/(\.\/)?component-assets/g, baseDir); // --------------- Assetのパスを絶対パスに変更
  }
  catch(e) {}
  return text;
}

// -------------------------------------------------------------------------------- コンポーネントのHTMLコードから、headタグとbodyタグを取り除く
function parseComponentHTML(html)
{
  var result = "";
  var BEGIN_EXPORT = '<!--export-->';
  var END_EXPORT = '<!--/export-->';
  if (html.indexOf(BEGIN_EXPORT) >= 0)
  {
    var blocks = html.split(BEGIN_EXPORT);
    var len = blocks.length;
    if (len > 1)
    {
      for(var i=1;i<len;i++)
      {
        result += blocks[i].split(END_EXPORT).shift();
      }
      if (result) return result;
    }
  }

  var body = html.match(/<body[^>]*>((.|\s)*)?<\/body>/im);
  var head = html.match(/<head[^>]*>((.|\s)*)?/im);
  if (head) head = head[1].split('</head>')[0];
  if (body) body = body[1];
  if (!body && !head) {
    return html;
  }
  if (head)
  {
    var links = head.match(/<link[^>]*(rel=("|')stylesheet("|'))[^>]*(\/?>|<\/link>)/ig);
    var styles = head.match(/<style[^>]*>(.|\s)*?<\/style>/igm);
    var scripts = head.match(/<script[^>]*>(.|\s)*?<\/script>/igm);
    if (links)   result += links.join('\n')   + '\n';
    if (styles)  result += styles.join('\n')  + '\n';
    if (scripts) result += scripts.join('\n') + '\n';
  }
  if (body)
  {
    result += body;
  }
  return result;
}


// -------------------------------------------------------------------------------- コンポーネントで使用しているスタイルシートを分離する
function parseStyles(componentPath, componentName, text)
{
  // ------------------------------------------------------------------------------ 外部CSS（linkタグ）を抽出し、HTMLコードから削除する
  text = text.replace(/<link[^>]*(rel=("|')stylesheet("|'))[^>]*(\/?>|<\/link>)/ig,
      function(link)
      {
        if (link.indexOf(EXCLUDE_TAG) > 0) return "";  // --------------------------- exclude 指定されているタグは無視する

        var filepath = link.match(/<link[^>]*\shref="([^"]+.s?css)"/i);
        if (filepath)
        {
          filepath = componentPath + '/' + filepath[1];
          styleList.push({src:filepath, code:null, name:componentName, path:componentPath});
        }
        return "";
      });
  // ------------------------------------------------------------------------------ styleタグを抽出し、HTMLコードから削除する
  text = text.replace(/<style[^>]*>(.|\s)*?<\/style>/igm,
      function(code)
      {
        if (code.match(/^<style[^>]*exclude/i)) return "";  // ---------------- exclude 指定されているタグは無視する

        try
        {
          code = code.replace(/^<style[^>]*>/i, "");
          code = code.replace(/<\/style>$/i, "");
          styleList.push({src:null, code:code, name:componentName, path:componentPath});
        }
        catch(err)
        {
          // console.log(err);
        }
        return "";
      });
  return text;
}

// -------------------------------------------------------------------------------- コンポーネントで使用しているスクリプトを分離する
function parseScripts(componentPath, componentName, text)
{
  text = text.replace(/<script[^>]*>(.|\s)*?<\/script>/igm,
      function(script)
      {
        if (script.match(/^<script[^>]*exclude/i)) return "";  // --------------- exclude 指定されているタグは無視する

        var filepath = script.match(/<script[^>]*\ssrc="([^"]+)"/i);
        if (filepath)
        {
          filepath = filepath[1];
          if (!filepath.match(/^(https?:)?\/\/.+/))
          {
            filepath = componentPath + '/' + filepath;
          }
          scriptList.push({src:filepath, code:null, name:componentName, path:componentPath});
        }
        else
        {
          try
          {
            var code = script.replace(/^<script[^>]*>/i, "");
            code = code.replace(/<\/script>$/i, "");
            scriptList.push({src:null, code:code, name:componentName, path:componentPath});
          }
          catch(err)
          {
            // console.log(err);
          }
        }
        return "";
      });
  return text;
}

// -------------------------------------------------------------------------------- 外部ファイルのパスを取得する
function getDestPath(filepath, exp, suffix)
{
  if (!suffix) suffix = "";
  var dir = path.dirname(filepath, '.html');
  var name = path.basename(filepath, '.html');
  var writepath = path.resolve(dir, name + suffix + '.' + exp);
  var srcPath2 = srcPath.replace(/(\*+).+/, '');
  var filePath = path.relative(srcPath2, writepath);
  var fileDir = './';
  if (exp == 'css')
    fileDir = destCssPath;
  if (exp == 'js')
    fileDir = destJsPath;
  filePath = path.resolve(fileDir, filePath);
  var dest = path.resolve(destPath, filePath);
  dest = path.relative(currentPath, dest);
  return dest;
}

// -------------------------------------------------------------------------------- コンポーネントのファイルパスを取得する
function getRelativePath(filename)
{
  return path.relative(currentPath, path.resolve(componentPath, filename));
}