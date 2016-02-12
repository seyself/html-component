
import { createDocumentData } from './parser/createDocumentData.js';
import { setupIndexData } from './parser/setupIndexData.js';
import { setLayerOption } from './parser/setLayerOption.js';
import MetaDataLoader from './parser/MetaDataLoader.js'

var _layouts = null;
var _options = null;
var _meta = null;

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
    setupIndexData(_layouts, _options);
    setLayerOption(_layouts, _options);
    return {
      meta     : _meta,
      document : createDocumentData(_layouts, _options),
      index    : _layouts.index,
      layers   : _layouts.layers
    };
  }

}

