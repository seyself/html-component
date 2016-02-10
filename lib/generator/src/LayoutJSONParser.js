
import { createDocumentData } from './parser/createDocumentData.js';
import { setupIndexData } from './parser/setupIndexData.js';
import MetaDataLoader from './parser/MetaDataLoader.js'

var _layouts = null;
var _options = null;
var _meta = null;
var _data = null;

export default class LayoutJSONParser
{
  constructor(){}

  load(layoutJson, callback)
  {
    _layouts = require(layoutJson);
    _options = _layouts.options;

    let metaDataLoader = new MetaDataLoader();
    let metaDataURL = metaDataLoader.getSpreadSheetURL(_options);
    if(metaDataURL)
    {
      metaDataLoader.loadSpreadSheet(metaDataURL, function(metaData)
        {
          _meta = metaData;
          if(callback)
          {
            callback();
          }
        });
    }
    else
    {
      if(callback)
      {
        callback();
      }
    }
  }

  parse()
  {
    _data = {
      meta: _meta
    };
    _data.document = createDocumentData(_layouts, _options);
    setupIndexData(_layouts, _options);
    _setupLayoutNodesData(_data, _layouts, _options);
    return _data;
  }

}

function _setupLayoutNodesData(data, layouts, options){
  var nodes = {};
  var layers = layouts.layers;
  var index = layouts.index;
  for(var id in layers){
    var item = layers[id];
    item.option = options[id];
  }
  data.index = index;
  data.layers = layers;
}



