jsx = jsx || {}

class jsx.HTMLGenerator
  fs = require 'fs'
  _json = null
  _dom = {}
  _components = []
  _cheerio = require('cheerio')

  constructor: ()->
    #

  load: (jsonFile)->
    _json = require jsonFile
    
  # 読み込んだJSONから、HTMLコードを生成する
  generate: (override=true, jade=false)->

    html_template = fs.readFileSync('./template/component.html', 'utf8') || ''
    if jade == true
      jade_template = fs.readFileSync('./template/component.html', 'utf8') || ''
    
    for key, value of _json
      if value
        _parseLayerData(value)

    for key, value of _dom
      src = value.$.html()
      name = value.componentName

      htmlCode = html_template.split('${name}').join(name)
      htmlCode = htmlCode.split('${html}').join(src)

      # console.log ''
      # console.log '[[[[', name, ']]]]'
      # console.log src

      path = 'components'
      if !fs.existsSync(path)
        fs.mkdir(path)
      
      path += '/' + name
      if !fs.existsSync(path)
        fs.mkdir(path)

      binPath = path + '/bin'
      if !fs.existsSync(binPath)
        fs.mkdir(binPath)
      
      binPath += '/' + name + '.html'
      if !fs.existsSync(binPath) || override
        fs.writeFile(binPath, htmlCode, null, 
          _writeFileCallback(name, (name)->
            console.log 'file >>', name
        ))

      # generate() の引数 jade が true だった時は src ディレクトリに .jadeファイルを書き出す
      if jade == true
        srcPath = path + '/src'
        if !fs.existsSync(srcPath)
          fs.mkdir(srcPath)
        
        srcPath += '/' + name + '.jade'
        if !fs.existsSync(srcPath) || override
          fs.writeFile(srcPath, src, null, 
            _writeFileCallback(name, (name)->
              console.log 'file >>', name
          ))


  _writeFileCallback = (arg, func)->
    return ()->
      func(arg)
      return

  # データの meta.type でタグのパターンを振り分ける
  _parseLayerData = (data)->
    if data.meta
      type = data.meta.type
      if type == 'image'
        _parseImageLayerData(data)
      else if type == 'text'
        _parseTextLayerData(data)
      else # if type == 'block'
        _parseBlockLayerData(data)

  # 画像タグの生成
  _parseImageLayerData = (data)->
    path = data.path
    meta = data.meta
    name = meta.name
    opt = data.data
    parent = _dom[path]
    
    $ = _createElement data
    data.$ = $
    imgsrc = meta.image?.url || ''
    
    width = ' data-width="' + (meta.size.width || 'auto') + '"'
    height = ' data-height="' + (meta.size.height || 'auto') + '"'
    $element = $('div')

    text = meta.text?.text || ''

    if opt.background
      # バックグラウンド指定があるとき
      if text
        text = '<span class="text">' + text + '</span>'
      $element.append '<div class="image" data-src="' + imgsrc + '"' + width + height + '>' +text+ '</div>'
    else
      # <img>タグを作る
      $element.append '<img src="' + imgsrc + '"' + width + height + ' alt="' + text + '"></div>'
    
    if parent
      $cell = $('<div class="grid-cell"></div>')
      $cell.append $element
      parent.element.append $cell

  # テキストブロックタグの生成
  _parseTextLayerData = (data)->
    path = data.path
    meta = data.meta
    name = meta.name
    opt = data.data
    parent = _dom[path]
    
    $ = _createElement data
    data.$ = $
    $element = $('div')

    text = meta.text?.text
    if text
      text = text.split('\n\n').join('</p><p>')
      text = text.split('\n').join('<br>')
      $element.append '<p>' + text + '</p>'
    
    if parent
      $cell = $('<div class="grid-cell"></div>')
      $cell.append $element
      parent.element.append $cell

  # コンテナタグの生成
  _parseBlockLayerData = (data)->
    path = data.path
    meta = data.meta
    name = meta.name
    opt = data.data
    parent = _dom[path]
    $ = _createElement data
    $container = $('div')
    data.$ = $
    data.container = $container

    $element = $('<div class="grid"></div>')
    data.element = $element
    $container.append $element

    _dom[path + name + '/'] = data

    # if meta.text
    #   $element.append _createTextElement(meta.text)
    
    if parent
      $cell = $('<div class="grid-cell"></div>')
      if data.isComponent
        $cell.append '<'+data.componentName+'></'+data.componentName+'>'
      else
        $cell.append $container
      parent.element.append $cell

    if data.isComponent
      _components.push data

  # レイアウトのコンテナ用のDIVタグを作成する
  _createElement = (data)->
    name = data.meta.name || ''
    component = data.data.component
    $ = _cheerio.load '<div></div>'
    $div = $('div')
    if component && component != 'none'
      $div.addClass(component)
      data.isComponent = true
      data.componentName = component
    $div.addClass(name)
    return $

  _createTextElement = (textObj)->
    return '<div class="grid-cell"><p>' + (textObj?.text || '') + '</p></div>'

  # meta.path を分解して使いやすくしておく
  # level : 要素の階層を示す（root=1）
  _parseLayerPath = (data)->
    path = data.path
    list = path.split('/')
    level = list.length
    data.level = level
    # for i in [0...level]
    #   dir = path[i]
    #   if !_dom[dir]
    #     _dom[dir] = []
    #   obj = {}

    #   _dom[dir].push obj



module.exports = jsx
