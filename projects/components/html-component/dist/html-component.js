(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.HtmlComponent = (function() {
    var _autoResizing;

    HtmlComponent.className = 'HtmlComponent';

    HtmlComponent.version = '0.1.1';

    HtmlComponent.INIT = 'html-component.init';

    HtmlComponent.READY = 'html-component.ready';

    HtmlComponent.data = {};

    HtmlComponent._dict = {};

    HtmlComponent.register = function(obj) {
      var name;
      name = obj != null ? obj.constructor.className : void 0;
      if (name) {
        if (!HtmlComponent._dict[name]) {
          HtmlComponent._dict[name] = [];
        }
        return HtmlComponent._dict[name].push(obj);
      }
    };

    HtmlComponent.get = function(name) {
      return HtmlComponent._dict[name] || null;
    };

    HtmlComponent.event = new EventEmitter2({
      wildcard: true,
      delimiter: '.',
      newListener: true,
      maxListeners: 10
    });

    HtmlComponent.init = function(listener) {
      return HtmlComponent.event.on(HtmlComponent.INIT, listener);
    };

    HtmlComponent.ready = function(listener) {
      return HtmlComponent.event.on(HtmlComponent.READY, listener);
    };

    _autoResizing = false;

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

    function HtmlComponent() {
      this.toString = bind(this.toString, this);
    }

    HtmlComponent.prototype.toString = function() {
      return HtmlComponent.className;
    };

    return HtmlComponent;

  })();

  $((function(_this) {
    return function() {
      HtmlComponent.event.emit(HtmlComponent.INIT);
      return HtmlComponent.event.emit(HtmlComponent.READY);
    };
  })(this));

}).call(this);
