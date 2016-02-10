"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setLayerOption = setLayerOption;
function setLayerOption(layouts, options) {
  var layers = layouts.layers;
  for (var id in layers) {
    var layer = layers[id];
    layer.option = options[id];
  }
}