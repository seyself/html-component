"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setupIndexData = setupIndexData;
function setupIndexData(layouts, options) {
  _setupIndexDataFunction(layouts.index, layouts.layers, options);
}

function _setupIndexDataFunction(index, layers, options) {
  var childIndexes = index.children;
  var len = childIndexes.length;

  var parent_id = index.id;
  var minY = 9999999999;
  var maxY = 0;

  for (var i = 0; i < len; i++) {
    var childIndex = childIndexes[i];
    var layer = layers[childIndex.id];

    if (layer) {
      layer.parent_id = parent_id;
      layer.childIndex = i;
    }
    var option = options[childIndex.id];
    if (option.use_background) {
      _setBackgroundSettings(childIndex, layers[parent_id], option);
      continue;
    }
    _setLayerBounds(layer, childIndex);
  }
  childIndexes.sort(_indexPositionSort);

  _setLayerIdOfChildren(childIndexes, layers, options);
}

function _setBackgroundSettings(item, parent, option) {
  parent.background = {
    image: option.layer_name,
    pos_x: option.horizontal,
    pos_y: option.vertical
  };
  item.enabled = false;
  option.enabled = false;
  item.top = 0;
  item.left = 0;
  item.bottom = 0;
  item.right = 0;
}

function _setLayerBounds(layer, childIndex) {
  if (layer) {
    _setIndexBounds(childIndex, layer);
    layer.bounds = {
      top: childIndex.top,
      left: childIndex.left,
      bottom: childIndex.bottom,
      right: childIndex.right
    };
  } else {
    _setIndexBounds(childIndex, null);
  }
}

function _setIndexBounds(index, layer) {
  if (layer) {
    index.top = layer.meta.position.absolute.y;
    index.left = layer.meta.position.absolute.x;
    index.bottom = layer.meta.size.height + index.top;
    index.right = layer.meta.size.width + index.left;
  } else {
    index.top = 0;
    index.left = 0;
    index.bottom = 0;
    index.right = 0;
  }
}

function _isPositionRelative(childIndexes) {
  var len = childIndexes.length;
  var bottomBorder = 0;
  for (var i = 0; i < len; i++) {
    var childIndex = childIndexes[i];
    if (childIndex.enabled) {
      if (bottomBorder <= childIndex.bottom) {
        bottomBorder = childIndex.bottom;
      } else {
        return false;
      }
    }
  }
  return true;
}

function _setLayerIdOfChildren(childIndexes, layers, options) {
  var len = childIndexes.length;
  var isPositionRelative = _isPositionRelative(childIndexes);
  var prev_id = null;
  var next_id = null;
  for (var i = 0; i < len; i++) {
    var childIndex = childIndexes[i];
    childIndex.positionRelative = isPositionRelative;
    var next = childIndexes[i + 1];
    var tmp_next_id;
    if (next) {
      tmp_next_id = next.id;
    } else {
      tmp_next_id = null;
    }
    next_id = tmp_next_id;
    childIndex.next_id = next_id;
    childIndex.prev_id = prev_id;

    var layer = layers[childIndex.id];
    if (layer) {
      layer.next_id = next_id;
      layer.prev_id = prev_id;
    }
    if (childIndex.enabled) {
      prev_id = childIndex.id;
    }
    _setupIndexDataFunction(childIndex, layers, options);
  }
}

function _indexPositionSort(a, b) {
  if (a.top == b.top) {
    if (a.left == b.left) {
      return 0;
    } else if (a.left < b.left) {
      return -1;
    }
    return 1;
  } else if (a.top < b.top) {
    return -1;
  }
  return 1;
}