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
    HtmlComponent.register(this)
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

HtmlComponent.ready ()=>
  new ${className}()

