do ()->
  if window.HtmlComponent
    return

  class window.HtmlComponent

    @className = 'HtmlComponent'
    @version = '0.1.1'

    @INIT = 'html-component.init'
    @READY = 'html-component.ready'
    @BEFORE = 'html-component.before'
    @AFTER = 'html-component.after'

    @data = {}

    _dict = {}

    @register: (obj)=>
      name = obj?.constructor.className
      if name
        if !_dict[name] then _dict[name] = []
        _dict[name].push obj

    @get: (name)=>
      return _dict[name] || null

    @event = new EventEmitter2
      wildcard: true
      delimiter: '.'
      newListener: true
      maxListeners: 10

    @before: (listener)->
      HtmlComponent.event.on HtmlComponent.BEFORE, listener

    @init: (listener)->
      HtmlComponent.event.on HtmlComponent.INIT, listener

    @after: (listener)->
      HtmlComponent.event.on HtmlComponent.AFTER, listener

    @ready: (listener)->
      HtmlComponent.event.on HtmlComponent.READY, listener



    _autoResizing = false
    _isReady = false
    _isStarted = false
    _waiting = []

    @autoFontSize: (size=16, defaultWidth=640, minWidth=320, maxWidth=1280)->
      _$win = $(window)
      _$doc = $(document.documentElement)
      _$body = $(document.body)
      _autoResizing = true

      _useBodyFontSize = false
      if env.osName == 'android' && env.browserName == 'chrome' && env.browserVersion.version_num < 20
        _useBodyFontSize = true

      _resize = ()->
        if !_autoResizing
          _$win.off 'resize'
          return null

        w = Math.min(window.innerWidth, _$win.width())
        if w < minWidth
          w = minWidth
        else if w > maxWidth
          w = maxWidth

        _$doc.css
          fontSize: (w / defaultWidth * size) + 'px'

        if _useBodyFontSize
          _$body.css
            fontSize: (w / defaultWidth * size) + 'px'

      _resize()
      _$win.on 'resize', ()->
        _resize()

    @autoFontSizeOff: ()->
      _autoResizing = false


    @wait: (key)->
      if _waiting.indexOf(key) < 0
        _waiting.push(key)

    @resume: (key)->
      i = _waiting.indexOf(key)
      if i >= 0
        _waiting.splice(i, 1)
        if (_waiting.length == 0)
          _startFunc()


    @start: ()->
      _isReady = true
      _startFunc()

    _startFunc = ()->
      if !_isStarted && _waiting.length == 0
        _isStarted = true
        HtmlComponent.event.emit HtmlComponent.BEFORE
        HtmlComponent.event.emit HtmlComponent.INIT
        HtmlComponent.event.emit HtmlComponent.AFTER
        HtmlComponent.event.emit HtmlComponent.READY

    constructor: ()->
      # do something...

    # --------------------------------------------------- public methods

    toString: ()=>
      return HtmlComponent.className

    # --------------------------------------------------- private methods

$ ()->
  HtmlComponent.start()
