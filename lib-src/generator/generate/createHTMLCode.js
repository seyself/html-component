
import _cheerio from 'cheerio';
import beautify from 'js-beautify';
import _htmlTemplate from '../HtmlTemplate';

var htmlTemplate = new _htmlTemplate();
var _componentExportable = true;
var _data = null;

export function createHTMLCode(document, filePath, data, $){
  _data = data;
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


