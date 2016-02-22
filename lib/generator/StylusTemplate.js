'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _stylus = require('stylus');

var _stylus2 = _interopRequireDefault(_stylus);

var _nib = require('nib');

var _nib2 = _interopRequireDefault(_nib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var INDENT_STR = '  ';
var _PSE_CSS = '';

var StylusTemplate = function () {
  function StylusTemplate() {
    _classCallCheck(this, StylusTemplate);
  }

  _createClass(StylusTemplate, [{
    key: 'basicStyle',
    value: function basicStyle(params) {
      var indent = INDENT_STR;
      var style = 'body' + '\n';
      style += indent + 'position: relative' + '\n';
      style += indent + 'margin: 0' + '\n';
      style += indent + 'padding: 0' + '\n';
      style += indent + 'min-height: 100%' + '\n';
      style += indent + 'background: ' + (params.bgcolor || '#FFF') + '\n';
      style += '\n';
      style += '#container' + '\n';
      style += indent + 'position: relative' + '\n';
      style += indent + 'margin: ' + (params.margin || 0) + '\n';
      style += indent + 'padding: 0' + '\n';
      style += indent + 'width: 100%' + '\n';
      style += '\n';
      style += '#main' + '\n';
      style += indent + 'position: relative' + '\n';
      style += indent + 'margin: 0 auto' + '\n';
      style += indent + 'padding: 0' + '\n';
      style += indent + 'width: ' + 100 + '%' + '\n';
      style += indent + 'max-width: ' + params.width + 'px' + '\n';
      style += '\n';
      style += 'p' + '\n';
      style += indent + 'position: relative' + '\n';
      style += indent + 'margin: 0 0 32px' + '\n';
      style += indent + 'padding: 0' + '\n';
      style += '\n';
      style += 'span, a' + '\n';
      style += indent + 'display: inline-block' + '\n';
      style += indent + 'margin: 0' + '\n';
      style += indent + 'padding: 0' + '\n';
      style += '\n';
      style += 'img' + '\n';
      style += indent + 'display: block' + '\n';
      style += indent + 'margin: 0' + '\n';
      style += indent + 'padding: 0' + '\n';
      style += '\n';
      style += this.pse();
      return style;
    }
  }, {
    key: 'pse',
    value: function pse() {
      var indent = INDENT_STR;
      var style = '';
      style += '.pse' + '\n';
      style += indent + 'position: absolute' + '\n';
      style += indent + 'display: block' + '\n';
      style += indent + 'box-sizing: border-box' + '\n';
      style += indent + 'top: 0' + '\n';
      style += indent + 'left: 0' + '\n';
      style += indent + 'margin: 0' + '\n';
      style += indent + 'padding: 0' + '\n';
      // style += indent + 'overflow: hidden' + '\n';
      // style += 'border: solid 1px #999' + '\n';
      // style += 'transparent: true' + '\n';
      // style += 'opacity: 0.5' + '\n';
      // style += 'background: #FF0000' + '\n';
      style += '\n';
      return style;
    }
  }, {
    key: 'componentBase',
    value: function componentBase() {
      var indent = INDENT_STR;
      var style = '';
      style += this.pse();
      return style;
    }
  }, {
    key: 'componentBaseCSS',
    value: function componentBaseCSS(callback) {
      if (_PSE_CSS) {
        callback(_PSE_CSS);
      } else {
        (0, _stylus2.default)(this.componentBase()).set('compress', false).use((0, _nib2.default)()).render(function (err, css) {
          if (err) {
            console.log('stylus #render() >>', err);
          } else {
            _PSE_CSS = css;
            callback(_PSE_CSS);
          }
        });
      }
    }
  }, {
    key: 'textElement',
    value: function textElement(meta, indent) {
      var size = Number(meta.text.size.replace(/\spx/, ''));
      var css = '';
      css += indent + 'font-family: "' + meta.text.font + '"' + '\n';
      css += indent + 'font-size:' + meta.text.size.replace(/\s+/g, '') + '' + '\n';
      css += indent + 'color: #' + meta.text.color + '' + '\n';
      css += indent + 'text-align: ' + meta.text.align + '' + '\n';
      if (typeof meta.text.line_height == 'number') {
        css += indent + 'line-height: ' + meta.text.line_height + '' + '\n';
      } else if (typeof meta.text.line_height == 'string') {
        css += indent + 'line-height: ' + (meta.text.line_height != null).replace(/\s+/g, '') + '' + '\n';
      }
      css += indent + 'letter-spacing: ' + (meta.text != null).letter_spacing / 6000 * size + 'px' + '\n';
      return css;
    }
  }, {
    key: 'position',
    value: function position(data, indent, parent) {
      var isRelative = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
      var isRoot = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];

      var css = '';
      var translateX = 0;
      var translateY = 0;
      var isFirstNode = data.prev_id == null;
      var isLastNode = data.next_id == null;
      var isInlineBlock = false;
      // if isFirstNode && data.top != 0 && data.option.horizontal != 'right'
      //   css += indent + 'display: inline-block' + '\n'
      //   isInlineBlock = true
      if (isRelative) {
        css += indent + 'position: relative' + '\n';
      }
      if (isRoot) {
        return css;
      }
      if (data.option.horizontal == 'center') {
        if (parent) {
          var posLeft = data.left - (parent.bounds.right - parent.bounds.left) / 2;
          css += indent + 'left: 50%' + '\n';
          css += indent + 'margin-left: ' + posLeft + 'px' + '\n';
        } else if (isRelative && !isInlineBlock) {
          css += indent + 'margin-left: auto' + '\n';
          css += indent + 'margin-right: auto' + '\n';
        } else {
          css += indent + 'left: 50%' + '\n';
          translateX = '-50%';
        }
      } else if (data.option.horizontal == 'right' && parent) {
        if (isRelative && !isInlineBlock) {
          css += indent + 'margin-left: auto' + '\n';
          css += indent + 'margin-right: ' + (parent.meta.size.width - data.meta.size.width - data.left) + 'px' + '\n';
        } else {
          css += indent + 'right: ' + (parent.meta.size.width - data.meta.size.width - data.left) + 'px' + '\n';
        }
      } else if (data.left != 0) {
        //if data.option.horizontal == 'left'
        css += indent + 'left: ' + data.left + 'px' + '\n';
      }
      if (data.option.vertical == 'middle') {
        css += indent + 'margin-top: 50%' + '\n';
        translateY = '-50%';
      } else if (data.option.vertical == 'bottom' && parent) {
        css += indent + 'bottom: ' + (parent.meta.size.height - data.meta.size.height - data.top) + 'px' + '\n';
      } else if (data.top != 0) {
        //if data.option.vertical == 'top'
        css += indent + 'margin-top: ' + data.top + 'px' + '\n';
        if (isFirstNode && data.meta.type == 'image') {
          css += indent + 'display: inline-block' + '\n';
        }
      }
      if (translateX || translateY) {
        css += indent + 'transform: translate(' + translateX + ', ' + translateY + ')' + '\n';
      }

      return css;
    }
  }, {
    key: 'size',
    value: function size(data, indent) {
      var size = data.meta.size;
      var css = '';
      if (data.option.flex == 'w100') {
        css += indent + 'width: ' + '100%' + '\n';
        css += indent + 'max-width: ' + size.width + 'px' + '\n';
      } else {
        css += indent + 'width: ' + size.width + 'px' + '\n';
      }
      css += indent + 'height: ' + size.height + 'px' + '\n';
      return css;
    }
  }, {
    key: 'background',
    value: function background(data, indent, assetsPath) {
      var bg_url = _path2.default.join(assetsPath, data.background.image);
      var bg_x = data.background.pos_x;
      var bg_y = data.background.pos_y;
      if (bg_y == 'middle') {
        bg_y = 'center';
      }
      var css = '';
      css += indent + 'background: url("../' + bg_url + '") no-repeat' + '\n';
      css += indent + 'background-position: ' + bg_x + ' ' + bg_y + '' + '\n';
      css += indent + 'background-size: cover' + '\n';
      css += indent + 'overflow: hidden' + '\n';
      return css;
    }
  }]);

  return StylusTemplate;
}();

exports.default = StylusTemplate;