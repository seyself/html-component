class window.HtmlComponent

  @className = 'HtmlComponent'
  @version = '0.1.1'

  @INIT = 'html-component.init'
  @READY = 'html-component.ready'

  @data = {}

  @_dict = {}

  @register: (obj)=>
    name = obj?.constructor.className
    if name
      if !@_dict[name] then @_dict[name] = []
      @_dict[name].push obj

  @get: (name)=>
    return @_dict[name] || null

  @event = new EventEmitter2
    wildcard: true
    delimiter: '.'
    newListener: true
    maxListeners: 10

  @init: (listener)->
    HtmlComponent.event.on HtmlComponent.INIT, listener

  @ready: (listener)->
    HtmlComponent.event.on HtmlComponent.READY, listener


  _autoResizing = false

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

  constructor: ()->
    # do something...

  # --------------------------------------------------- public methods

  toString: ()=>
    return HtmlComponent.className

  # --------------------------------------------------- private methods

$ () =>
  HtmlComponent.event.emit HtmlComponent.INIT
  HtmlComponent.event.emit HtmlComponent.READY
