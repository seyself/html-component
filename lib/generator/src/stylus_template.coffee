jsx = jsx || {}

path = require 'path'

class jsx.StylusTemplate

  INDENT_STR = '  '
  _PSE_CSS = ''

  constructor: ->

  basicStyle: (params)->
    indent = INDENT_STR
    style = 'body' + '\n'
    style += indent + 'position: relative' + '\n'
    style += indent + 'margin: 0' + '\n'
    style += indent + 'padding: 0' + '\n'
    style += indent + 'min-height: 100%' + '\n'
    style += indent + 'background: ' + (params.bgcolor || '#FFF') + '\n'
    style += '\n'
    style += '#container' + '\n'
    style += indent + 'position: relative' + '\n'
    style += indent + 'margin: ' + (params.margin || 0) + '\n'
    style += indent + 'padding: 0' + '\n'
    style += indent + 'width: 100%' + '\n'
    style += '\n'
    style += '#main' + '\n'
    style += indent + 'position: relative' + '\n'
    style += indent + 'margin: 0 auto' + '\n'
    style += indent + 'padding: 0' + '\n'
    style += indent + 'width: ' + 100 + '%' + '\n'
    style += indent + 'max-width: ' + params.width + 'px' + '\n'
    style += '\n'
    style += 'p' + '\n'
    style += indent + 'position: relative' + '\n'
    style += indent + 'margin: 0 0 32px' + '\n'
    style += indent + 'padding: 0' + '\n'
    style += '\n'
    style += 'span, a' + '\n'
    style += indent + 'display: inline-block' + '\n'
    style += indent + 'margin: 0' + '\n'
    style += indent + 'padding: 0' + '\n'
    style += '\n'
    style += 'img' + '\n'
    style += indent + 'display: block' + '\n'
    style += indent + 'margin: 0' + '\n'
    style += indent + 'padding: 0' + '\n'
    style += '\n'
    style += @pse()
    return style

  pse: ()->
    indent = INDENT_STR
    style = ''
    style += '.pse' + '\n'
    style += indent + 'position: absolute' + '\n'
    style += indent + 'display: block' + '\n'
    style += indent + 'box-sizing: border-box' + '\n'
    style += indent + 'top: 0' + '\n'
    style += indent + 'left: 0' + '\n'
    style += indent + 'margin: 0' + '\n'
    style += indent + 'padding: 0' + '\n'
    # style += indent + 'overflow: hidden' + '\n'
    # style += 'border: solid 1px #999' + '\n'
    # style += 'transparent: true' + '\n'
    # style += 'opacity: 0.5' + '\n'
    # style += 'background: #FF0000' + '\n'
    style += '\n'
    return style

  componentBase: ()->
    indent = INDENT_STR
    style = ''
    style += @pse()
    return style

  componentBaseCSS: (callback)->
    if _PSE_CSS
      callback _PSE_CSS
    else
      stylus(@componentBase())
      .set('compress', false)
      .use(nib())
      .render (err, css)->
        if err
          console.log 'stylus #render() >>', err
        else
          _PSE_CSS = css
          callback _PSE_CSS


  textElement: (meta, indent)->
    size = Number(meta.text.size.replace(/\spx/, ''))
    css = ''
    css += indent + 'font-family: "' + meta.text.font + '"' + '\n'
    css += indent + 'font-size:' + meta.text.size.replace(/\s+/g, '') + '' + '\n'
    css += indent + 'color: #' + meta.text.color + '' + '\n'
    css += indent + 'text-align: ' + meta.text.align + '' + '\n'
    css += indent + 'line-height: ' + meta.text.line_height?.replace(/\s+/g, '') + '' + '\n'
    css += indent + 'letter-spacing: ' + (meta.text?.letter_spacing / 6000 * size) + 'px' + '\n'
    return css

  position: (data, indent, parent, isRelative=false, isRoot=false)->
    css = ''
    translateX = 0
    translateY = 0

    isFirstNode = data.prev_id == null
    isLastNode = data.next_id == null
    isInlineBlock = false

#    if isFirstNode && data.top != 0 && data.option.horizontal != 'right'
#      css += indent + 'display: inline-block' + '\n'
#      isInlineBlock = true

    if isRelative
      css += indent + 'position: relative' + '\n'

    if isRoot
      return css

    if data.option.horizontal == 'center'
      if parent
        posLeft = data.left - (parent.bounds.right - parent.bounds.left) / 2
        css += indent + 'left: 50%' + '\n'
        css += indent + 'margin-left: ' + posLeft + 'px' + '\n'
      else if isRelative && !isInlineBlock
        css += indent + 'margin-left: auto' + '\n'
        css += indent + 'margin-right: auto' + '\n'
      else
        css += indent + 'left: 50%' + '\n'
        translateX = '-50%'
    else if data.option.horizontal == 'right' && parent
      if isRelative && !isInlineBlock
        css += indent + 'margin-left: auto' + '\n'
        css += indent + 'margin-right: ' + (parent.meta.size.width - data.meta.size.width - data.left) + 'px' + '\n'
      else
        css += indent + 'right: ' + (parent.meta.size.width - data.meta.size.width - data.left) + 'px' + '\n'
    else #if data.option.horizontal == 'left'
      if data.left != 0
        css += indent + 'left: ' + data.left + 'px' + '\n'

    if data.option.vertical == 'middle'
      css += indent + 'margin-top: 50%' + '\n'
      translateY = '-50%'
    else if data.option.vertical == 'bottom' && parent
      css += indent + 'bottom: ' + (parent.meta.size.height - data.meta.size.height - data.top) + 'px' + '\n'
    else #if data.option.vertical == 'top'
      if data.top != 0
        css += indent + 'margin-top: ' + data.top + 'px' + '\n'
        if isFirstNode && data.meta.type == 'image'
          css += indent + 'display: inline-block' + '\n'

    if translateX || translateY
      css += indent + 'transform: translate(' + translateX + ', ' + translateY + ')' + '\n'

    return css

  size: (data, indent)->
    size = data.meta.size
    css = ''
    if data.option.flex == 'w100'
      css += indent + 'width: ' + '100%' + '\n'
      css += indent + 'max-width: ' + size.width + 'px' + '\n'
    else
      css += indent + 'width: ' + size.width + 'px' + '\n'

    css += indent + 'height: ' + size.height + 'px' + '\n'
    return css

  background: (data, indent, assetsPath)->
    bg_url = path.join(assetsPath, data.background.image)
    bg_x = data.background.pos_x
    bg_y = data.background.pos_y
    if bg_y == 'middle'
      bg_y = 'center'
    css = ''
    css += indent + 'background: url("../' + bg_url + '") no-repeat' + '\n'
    css += indent + 'background-position: ' + bg_x + ' ' + bg_y + '' + '\n'
    css += indent + 'background-size: cover' + '\n'
    css += indent + 'overflow: hidden' + '\n'
    return css


module.exports = jsx
