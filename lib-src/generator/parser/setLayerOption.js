
export function setLayerOption(layouts, options)
{
  var layers = layouts.layers;
  for(var id in layers){
    var layer = layers[id];
    layer.option = options[id];
  }
}
