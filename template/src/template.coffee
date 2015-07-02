class window.${className}

  @className = '${className}'
  @version = '1.0.0'

  # --------------------------------------------------- event types
  #@SHOW = '${name}.show'
  #@HIDE = '${name}.hide'

  # --------------------------------------------------- members
  _$element = null

  # --------------------------------------------------- constructor
  constructor: ()->
    HtmlComponents.register(this)
    _$element = $('.${name}')


  # --------------------------------------------------- methods
  _init = ()=>
    # do something...

  #show: ()=>
  #   do something...

  #hide: ()=>
  #   do something...

  toString: ()=>
    return ${className}.className

HtmlComponents.ready ()=>
  new ${className}()

