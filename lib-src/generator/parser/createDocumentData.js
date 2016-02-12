
export function createDocumentData(layouts, options){
  var layers = layouts.layers;
  var referers = _getReferenceLayers(layers, options);
  var docRect = _getDocumentBounds(layers);
  var root = options.root;
  
  return {
    title: root.doc_title,
    filename: root.name.split('.').shift(),
    psd: root.name,
    horizontal: root.horizontal,
    vertical: root.vertical,
    device: root.doc_type,
    width: docRect.right - docRect.left,
    height: docRect.bottom,
    offsetX: -docRect.left,
    offsetY: -docRect.top,
    bgcolor: root.bgcolor,
    margin: root.margin,
    referers: referers
  };
}

function _getReferenceLayers(layers, options)
{
  var referers = [];
  for(var id in layers){
    var item = layers[id];
    var layerName = options[id].layer_name;
    if(layerName.match(/^@\d+$/)){
      var ref_id = layerName.match(/^@(\d+)$/)[1];
      if(referers.indexOf(ref_id) < 0){
        referers.push(ref_id);
      }
    }
  }
  return referers;
}

function _getDocumentBounds(layers)
{
  var documentRect = { 
    left : 999999,
    top : 0,
    right : 0,
    bottom : 0
  }
  for(var id in layers){
    var bounds = _getLayerBounds(layers[id]);

    if(documentRect.left > bounds.left){
      documentRect.left = bounds.left;
    }
    if(documentRect.right < bounds.right){
      documentRect.right = bounds.right;
    }
    if(documentRect.bottom < bounds.bottom){
      documentRect.bottom = bounds.bottom;
    }
  }
  return documentRect;
}

function _getLayerBounds(layer)
{
  var pos = layer.meta.position.absolute;
  var size = layer.meta.size;
  return {
    left   : pos.x,
    top    : pos.y,
    right  : pos.x + size.width,
    bottom : pos.y + size.height  
  };
}


