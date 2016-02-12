
import { generateInit } from './generate/generateInit.js';
import { createFilePath } from './generate/createFilePath.js';
import { createStyleSheet } from './generate/createStyleSheet.js';
import { createHTMLCode } from './generate/createHTMLCode.js';
import { exportHTML } from './generate/exportHTML.js';

var _data = null;
var _components = [];
var $ = null;


export default class LayoutPreviewGenerator{
  constructor(){}

  load(data){
    _data = data;
    return;
  }

  generate(params){
    var initParams = generateInit(params, _data);
    $ = initParams.$;
    params.dest = initParams.dest;
    var filePath = createFilePath(params);
    var exportData = {
      style: createStyleSheet(_data, params, $, _components),
      html: createHTMLCode(_data.document, filePath, _data, $)
    };
    exportHTML(params, filePath, exportData, _components);
  }
}

