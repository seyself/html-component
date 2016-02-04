'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nodeRestClient = require('node-rest-client');

var _nodeRestClient2 = _interopRequireDefault(_nodeRestClient);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _layouts = null;
var _options = null;
var _meta = null;
var _data = null;

var LayoutJSONParser = function () {
  function LayoutJSONParser() {
    _classCallCheck(this, LayoutJSONParser);
  }

  _createClass(LayoutJSONParser, [{
    key: 'load',
    value: function load(layoutJson, callback) {
      _layouts = require(layoutJson);
      _options = _layouts.options;

      if (_options.root.docs_url) {
        try {
          var client = new _nodeRestClient2.default.Client();
          client.get(_options.root.docs_url, function (data, response) {
            try {
              if (data) {
                _meta = {};
                var tsv = String(data).split('\r\n');
                var len = tsv.length;

                var tmpArray = [];
                for (var j = 0; j < len; j++) {
                  tmpArray.push(j);
                }
                for (var i in tmpArray) {
                  var cols = tsv[i].split('\t');
                  var key = cols[1];
                  var value = cols[2];
                  _meta[key] = value;
                }
              }
            } catch (e) {
              console.log('Parse Error : Google Spreadsheets');
            }
            if (callback) {
              callback();
            }
          });
        } catch (e) {
          console.log('Load Error : Google Spreadsheets');
        }
        if (callback) {
          callback();
        }
      } else {
        if (callback) {
          callback();
        }
      }
    }
  }, {
    key: 'parse',
    value: function parse() {
      _data = {
        meta: _meta
      };
      _setupDocumentData(_data, _layouts, _options);
      _setupIndexData(_layouts.index, _layouts.layers);
      // console.log JSON.stringify(_layouts.index, null, '  ')
      _setupLayoutNodesData(_data, _layouts, _options);
      return _data;
    }
  }]);

  return LayoutJSONParser;
}();

exports.default = LayoutJSONParser;

function _setupIndexData(index, layers) {
  var list = index.children;
  var len = list.length;
  var prev_id = null;
  var next_id = null;
  var parent_id = index.id;
  var minY = 9999999999;
  var maxY = 0;

  var tmpArray = [];
  for (var j = 0; j < len; j++) {
    tmpArray.push(j);
  }
  for (var i in tmpArray) {
    var item = list[i];
    var layer = layers[item.id];

    if (layer) {
      layer.parent_id = parent_id;
      layer.childIndex = i;
    }
    var option = _options[item.id];
    if (option.use_background) {
      var parent = layers[parent_id];
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
      continue;
    }
    if (layer) {
      item.top = layer.meta.position.absolute.y;
      item.left = layer.meta.position.absolute.x;
      item.bottom = layer.meta.size.height + item.top;
      item.right = layer.meta.size.width + item.left;
      layer.bounds = {
        top: item.top,
        left: item.left,
        bottom: item.bottom,
        right: item.right
      };
    } else {
      item.top = 0;
      item.left = 0;
      item.bottom = 0;
      item.right = 0;
    }
  }
  list.sort(_indexPositionSort);
  var isPositionRelative = true;
  var bottomBorder = 0;
  tmpArray = [];
  for (var j = 0; j < len; j++) {
    tmpArray.push(j);
  }
  for (var i in tmpArray) {
    item = list[i];
    if (item.enabled) {
      if (bottomBorder <= item.bottom) {
        bottomBorder = item.bottom;
      } else {
        isPositionRelative = false;
        break;
      }
    }
  }
  tmpArray = [];
  for (var j = 0; j < len; j++) {
    tmpArray.push(j);
  }
  for (var i in tmpArray) {
    item = list[i];
    item.positionRelative = isPositionRelative;
    var next = list[i + 1];
    var tmp_next_id;
    if (next) {
      tmp_next_id = next.id;
    } else {
      tmp_next_id = null;
    }
    next_id = tmp_next_id;
    item.next_id = next_id;
    item.prev_id = prev_id;

    var layer = layers[item.id];
    if (layer) {
      layer.next_id = next_id;
      layer.prev_id = prev_id;
    }
    if (item.enabled) {
      prev_id = item.id;
    }
    _setupIndexData(item, layers);
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

function _setupDocumentData(data, layouts, options) {
  var minX = 999999;
  var minY = 0;
  var maxX = 0;
  var maxY = 0;
  var layers = layouts.layers;
  var referers = [];
  for (var id in layers) {
    var item = layers[id];
    var layerName = options[id].layer_name;
    if (layerName.match(/^@\d+$/)) {
      var ref_id = layerName.match(/^@(\d+)$/)[1];
      if (referers.indexOf(ref_id) < 0) {
        referers.push(ref_id);
      }
    }
    var pos = item.meta.position.absolute;
    var size = item.meta.size;

    var left = pos.x;
    var top = pos.y;
    var right = left + size.width;
    var bottom = top + size.height;

    if (minX > left) {
      minX = left;
    }
    if (maxX < right) {
      maxX = right;
    }
    if (maxY < bottom) {
      maxY = bottom;
    }
  }
  var root = options.root;
  var width = maxX - minX;
  var height = maxY;
  var offsetX = minX;
  var offsetY = minY;

  data.document = {
    title: root.doc_title,
    filename: root.name.split('.').shift(),
    psd: root.name,
    horizontal: root.horizontal,
    vertical: root.vertical,
    device: root.doc_type,
    width: width,
    height: height,
    offsetX: -offsetX,
    offsetY: -offsetY,
    bgcolor: root.bgcolor,
    margin: root.margin,
    referers: referers
  };
  return;
}

function _setupLayoutNodesData(data, layouts, options) {
  var nodes = {};
  var layers = layouts.layers;
  var index = layouts.index;
  for (var id in layers) {
    var item = layers[id];
    item.option = options[id];
  }
  data.index = index;
  data.layers = layers;
}