(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

(function() {
  if (window.HtmlComponent) {
    return;
  }
  return window.HtmlComponent = (function() {
    var _autoResizing, _dict, _isReady, _isStarted, _startFunc, _waiting;

    HtmlComponent.className = 'HtmlComponent';

    HtmlComponent.version = '0.1.1';

    HtmlComponent.INIT = 'html-component.init';

    HtmlComponent.READY = 'html-component.ready';

    HtmlComponent.BEFORE = 'html-component.before';

    HtmlComponent.AFTER = 'html-component.after';

    HtmlComponent.data = {};

    _dict = {};

    HtmlComponent.register = function(obj) {
      var name;
      name = obj != null ? obj.constructor.className : void 0;
      if (name) {
        if (!_dict[name]) {
          _dict[name] = [];
        }
        return _dict[name].push(obj);
      }
    };

    HtmlComponent.get = function(name) {
      return _dict[name] || null;
    };

    HtmlComponent.event = new EventEmitter2({
      wildcard: true,
      delimiter: '.',
      newListener: true,
      maxListeners: 10
    });

    HtmlComponent.before = function(listener) {
      return HtmlComponent.event.on(HtmlComponent.BEFORE, listener);
    };

    HtmlComponent.init = function(listener) {
      return HtmlComponent.event.on(HtmlComponent.INIT, listener);
    };

    HtmlComponent.after = function(listener) {
      return HtmlComponent.event.on(HtmlComponent.AFTER, listener);
    };

    HtmlComponent.ready = function(listener) {
      return HtmlComponent.event.on(HtmlComponent.READY, listener);
    };

    _autoResizing = false;

    _isReady = false;

    _isStarted = false;

    _waiting = [];

    HtmlComponent.autoFontSize = function(size, defaultWidth, minWidth, maxWidth) {
      var _$body, _$doc, _$win, _resize, _useBodyFontSize;
      if (size == null) {
        size = 16;
      }
      if (defaultWidth == null) {
        defaultWidth = 640;
      }
      if (minWidth == null) {
        minWidth = 320;
      }
      if (maxWidth == null) {
        maxWidth = 1280;
      }
      _$win = $(window);
      _$doc = $(document.documentElement);
      _$body = $(document.body);
      _autoResizing = true;
      _useBodyFontSize = false;
      if (env.osName === 'android' && env.browserName === 'chrome' && env.browserVersion.version_num < 20) {
        _useBodyFontSize = true;
      }
      _resize = function() {
        var w;
        if (!_autoResizing) {
          _$win.off('resize');
          return null;
        }
        w = Math.min(window.innerWidth, _$win.width());
        if (w < minWidth) {
          w = minWidth;
        } else if (w > maxWidth) {
          w = maxWidth;
        }
        _$doc.css({
          fontSize: (w / defaultWidth * size) + 'px'
        });
        if (_useBodyFontSize) {
          return _$body.css({
            fontSize: (w / defaultWidth * size) + 'px'
          });
        }
      };
      _resize();
      return _$win.on('resize', function() {
        return _resize();
      });
    };

    HtmlComponent.autoFontSizeOff = function() {
      return _autoResizing = false;
    };

    HtmlComponent.wait = function(key) {
      if (_waiting.indexOf(key) < 0) {
        return _waiting.push(key);
      }
    };

    HtmlComponent.resume = function(key) {
      var i;
      i = _waiting.indexOf(key);
      if (i >= 0) {
        _waiting.splice(i, 1);
        if (_waiting.length === 0) {
          return _startFunc();
        }
      }
    };

    HtmlComponent.start = function() {
      _isReady = true;
      return _startFunc();
    };

    _startFunc = function() {
      if (!_isStarted && _waiting.length === 0) {
        _isStarted = true;
        HtmlComponent.event.emit(HtmlComponent.BEFORE);
        HtmlComponent.event.emit(HtmlComponent.INIT);
        HtmlComponent.event.emit(HtmlComponent.AFTER);
        return HtmlComponent.event.emit(HtmlComponent.READY);
      }
    };

    function HtmlComponent() {
      this.toString = bind(this.toString, this);
    }

    HtmlComponent.prototype.toString = function() {
      return HtmlComponent.className;
    };

    return HtmlComponent;

  })();
})();

$(function() {
  return HtmlComponent.start();
});


},{}]},{},[1]);
