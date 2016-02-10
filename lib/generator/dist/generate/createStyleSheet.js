'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createStyleSheet = createStyleSheet;

var _cheerio2 = require('cheerio');

var _cheerio3 = _interopRequireDefault(_cheerio2);

var _StylusTemplate = require('../StylusTemplate');

var _StylusTemplate2 = _interopRequireDefault(_StylusTemplate);

var _HtmlTemplate = require('../HtmlTemplate');

var _HtmlTemplate2 = _interopRequireDefault(_HtmlTemplate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var stylusTemplate = new _StylusTemplate2.default();
var htmlTemplate = new _HtmlTemplate2.default();
var $ = null;
var _params = null;
var _componentExportable = true;
var INDENT_STR = '  ';
var _components = null;

function createStyleSheet(jsonData, params, components) {
  _components = components;
  _params = params;
  $ = _cheerio3.default.load('<div><div id="main" class="_' + jsonData.document.filename + '"></div></div>', { decodeEntities: false });
  var $main = $('div#main');
  var params = {};
  var styleCode = _getBasicStyle(jsonData.document);
  _generateRelativeLayout(jsonData, $main, params);
  styleCode += params.css;
  return styleCode;
}

function _generateRelativeLayout(params, $main, result) {
  var doc = params.document;
  var layers = params.layers;
  var indexes = params.index;
  var offsetX = doc.offsetX;
  var offsetY = doc.offsetY;
  var className = '_' + doc.filename;
  result.css = '.' + className + '\n';
  var indentLevel = 1;
  _generateNodeList(indexes.children, className, indentLevel, doc, layers, $main, $main, result, doc.offsetX, doc.offsetY, className, false);
}

function _generateNodeList(list, parentName, indentLevel, doc, layers, $root, $element, result, offsetX, offsetY, component, isRoot) {
  for (var child in list) {
    if (list[child].enabled) {
      _generateNode(list[child], parentName, indentLevel, doc, layers, $root, $element, result, offsetX, offsetY, component, isRoot);
    }
  }
}

function _generateNode(node, parentName, indentLevel, doc, layers, $root, $element, result, offsetX, offsetY, component, isRoot) {
  var config = _setConfig(node, layers, parentName);
  var tag = _createElementTag(config.id, layers);
  var $$ = _cheerio3.default.load(tag, { decodeEntities: false });
  var $div = $$('div');
  var childContainer = $div;
  if ((config.option != null).link_url) {
    childContainer = $$('a');
  }
  var argumentList = _makeArgumentList(config, result, indentLevel, node, layers);
  result = _createResultCSS(argumentList, isRoot, offsetX, offsetY);
  if (doc.referers.indexOf(config.id) >= 0) {
    _ref_elements[config.id] = childContainer;
  }
  _appendNodeOption(argumentList, childContainer, doc, $root, component);
  _appendComponentElement(argumentList, _cheerio3.default, _components, $element, $div);
}

function _setConfig(node, layers, parentName) {
  var id = node.id;
  var data = layers[id];
  // console.log(node);
  var option = data.option;
  var className = option.name;
  var classPath = _setClassPath(parentName, className);
  return {
    id: id,
    data: data,
    option: option,
    className: className,
    classPath: classPath
  };
}

function _setClassPath(parentName, className) {
  if (parentName) {
    var classPath = parentName + ' ' + className;
    return classPath;
  } else {
    var classPath = className;
    return classPath;
  }
}

function _createElementTag(id, layers) {
  var data = layers[id];
  var option = data.option;
  var meta = data.meta;
  var tag = '';

  if (meta.type == 'text') {
    tag = _getText(meta.text.text);
  } else if (meta.type == 'image') {
    tag = htmlTemplate.imageBlock(meta, _params.assets_src_path);
  }
  if ((option != null).link_url) {
    tag = '<a href="' + option.link_url + '" target="' + option.link_target + '">' + tag + '</a>';
  }
  tag = '<div class="pse ' + option.name + '">' + tag + '</div>';
  return tag;
}

function _makeArgumentList(config, result, indentLevel, node, layers) {
  return {
    config: config,
    result: result,
    indentLevel: indentLevel,
    node: node,
    layers: layers
  };
}

function _createResultCSS(list, isComponentRoot, offsetX, offsetY) {
  if (_componentExportable && list.config.data.option.component) {
    isComponentRoot = true;
    var component = list.config.data.option.component;
    list.config.className = component;

    list.result.css += _createComponentCSS(list.config.id, list.config.className, list.indentLevel, list.node, list.layers, offsetX, offsetY);
    list.result = {
      css: ''
    };
    list.indentLevel = 0;
  }
  var css = _createElementCSS(list.config.id, list.config.className, list.indentLevel, list.node, list.layers, offsetX, offsetY, component, isComponentRoot);
  list.result.css += css + '\n';
  return list.result;
}

function _appendNodeOption(list, childContainer, doc, $root, component) {
  var option = list.config.option;
  if (option.embed) {
    childContainer.append(unescape(option.embed));
  } else if (_layerNameIsLink(option.layer_name)) {
    _appendReferenceNode(childContainer, _ref_elements, option.layer_name);
  } else {
    _generateNodeList(list.node.children, list.config.classPath, list.indentLevel + 1, doc, list.layers, $root, childContainer, list.result, 0, 0, component, false);
  }
}

function _appendComponentElement(list, _cheerio, _components, $element, $div) {
  if (_componentExportable && list.config.data.option.component) {
    _appendComponent(list.config.id, _cheerio, _components, list.config.data.option.component, $div, list.result, $element);
  } else {
    $element.append($div);
  }
}

function _createComponentCSS(id, classPath, indentLevel, node, layers, offsetX, offsetY) {
  var data = layers[id];
  var meta = data.meta;
  var _indent = _getIndent(indentLevel, INDENT_STR);
  var css = '';
  if (_indent) {
    css += _indent + '& > .' + classPath + '\n';
  } else {
    css += _indent + '.' + classPath + '\n';
  }
  _indent += INDENT_STR;
  data.top = meta.position.relative.y + offsetY;
  data.left = meta.position.relative.x + offsetX;
  var isRelative = _isPositionRelative(data, meta, node, layers);
  var parent = layers[data.parent_id];
  css += stylusTemplate.position(data, _indent, parent, isRelative, false);
  // css += stylusTemplate.size(data, _indent)
  return css;
}

function _createElementCSS(id, classPath, indentLevel, node, layers, offsetX, offsetY, component, isComponentRoot) {
  var data = layers[id];
  var meta = data.meta;
  var _indent = _getIndent(indentLevel, INDENT_STR);
  var css = '';

  css = _appendCSSElementIndent(_indent, css, classPath);
  _indent += INDENT_STR;
  css = _createTextElementCSS(meta, _indent, css);
  _setDataPosition(data, meta, offsetX, offsetY);
  css = _setDataBackground(data, css, _indent);

  var isRelative = _isPositionRelative(data, meta, node, layers);
  var parent = layers[data.parent_id];

  css += stylusTemplate.position(data, _indent, parent, isRelative, isComponentRoot);
  css += stylusTemplate.size(data, _indent);
  css += '';
  css += '';

  return css;
}

function _appendReferenceNode(container, elements, layerName) {
  var ref_id = layerName.match(/^@(\d+)/)[1];
  var ref_node = elements[ref_id];
  if (ref_node) {
    container.append(ref_node.html());
  }
}

function _appendComponent(id, cheerio, componentList, componentName, $div, result, $element) {
  componentList.push({
    id: id,
    name: componentName,
    node: $div,
    data: result
  });
  var $component = cheerio.load('<' + componentName + '></' + componentName + '>', { decodeEntities: false })(componentName);
  $element.append($component);
}

function _getIndent(level, str) {
  if (!str) {
    str = '\t';
  }
  var code = '';
  var tmpArray = [];
  for (var j = 0; j < level; j++) {
    tmpArray.push(j);
  }
  for (var i in tmpArray) {
    code += str;
  }
  return code;
}

function _isPositionRelative(data, meta, node, layers) {
  // if data.meta.name == 'title'
  //   console.log data.meta.name
  //   prev = layers[node.prev_id]
  //   console.log data
  //   console.log prev
  //   console.log node.positionRelative

  if (node.prev_id) {
    var prev = layers[node.prev_id];
    if (prev) {
      return _compareNodeHeight(prev, data, node, meta);
    }
  }
  if (!node.prev_id) {
    return true;
  }
  return false;
}

function _appendCSSElementIndent(_indent, css, classPath) {
  if (_indent) {
    css += _indent + '& > .' + classPath + '\n';
  } else {
    css += _indent + '.' + classPath + '\n';
  }

  return css;
}

function _createTextElementCSS(meta, indent, css) {
  if (meta.text) {
    css += stylusTemplate.textElement(meta, indent);
    return css;
  } else {
    return css;
  }
}

function _setDataPosition(data, meta, offsetX, offsetY) {
  data.top = meta.position.relative.y + offsetY;
  data.left = meta.position.relative.x + offsetX;
}

function _setDataBackground(data, css, _indent) {
  if (data.background && data.background.image) {
    css += stylusTemplate.background(data, _indent, _params.assets_src_path);
    return css;
  } else {
    return css;
  }
}

function _compareNodeHeight(prev, data, node, meta) {
  if (prev.bounds.bottom <= data.bounds.top) {
    data.top = data.bounds.top - prev.bounds.bottom;
    return true;
  }
  if (node.positionRelative) {
    data.top = meta.position.absolute.y - prev.bounds.bottom;
    return true;
  }
}

function _layerNameIsLink(layerName) {
  return layerName.match(/^@\d+/) != null;
}

function _getBasicStyle(params) {
  return stylusTemplate.basicStyle(params);
}

function _getText(text) {
  return htmlTemplate.textBlock(text);
}