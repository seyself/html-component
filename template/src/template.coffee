class window.${className}

  @className = '${className}'
  @version = '1.0.0'

  # --------------------------------------------------- event types
  @SHOW = '${name}.show'
  @HIDE = '${name}.hide'

  # --------------------------------------------------- private fields
  _$element = null

  # --------------------------------------------------- constructor
  constructor: ()->
    HtmlComponents.register(this)
    _$element = $('.${name}')


  # --------------------------------------------------- public methods
  show: ()=>
    # do something...

  hide: ()=>
    # do something...

  toString: ()=>
    return ${className}.className

  # --------------------------------------------------- private methods
  _init = ()=>
    # do something...

$ ()=>
  new ${className}()

