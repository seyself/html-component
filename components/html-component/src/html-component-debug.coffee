do ()->
  _queue = []
  _registeredNodes = []
  loadCount = 0
  _waitKey = String(Math.floor(Math.random() * 100000000))

  _insertStyleComment = null
  _insertScriptComment = null

  window._debug = true


  next = ()->
    task = _queue.shift()
    if task
      task()
    else
      done()

  warn = ()->
    alert('警告\nコンポーネントの読み込みが100を超えたため強制停止しました。')

  done = ()->
    console.log('done!')
    if HtmlComponent
      HtmlComponent.resume(_waitKey)

  getComponentTags = ()->
    tags = []
    matches = document.body.innerHTML.match(/<[^!>/\s]+-[^>\s]+/g)
    if !matches
      return null

    len = matches.length
    for i in [0...len]
      name = matches[i]
      name = name.substr(1)
      elements = document.getElementsByTagName(name)
      numElements = elements.length
      for j in [0...numElements]
        node = elements[j]
        numAttrs = node.attributes.length
        attrs = {}
        for k in [0...numAttrs]
          attr = node.attributes[k]
          if attr
            attrs[attr.name] = attr.value
        if _registeredNodes.indexOf(node) < 0
          tags.push( {name:name, node:node, attr:attrs} )
          _registeredNodes.push(node)
    return tags

  loadComponents = (tags)->
    if !tags
      return
    len = tags.length
    for i in [0...len]
      _queue.push(loadComponent(tags[i]))

  loadComponent = (data)->
    return ()->
      node = data.node
      $.ajax({
        url: '../components/' + data.name + '/dist/' + data.name + '.html'
        method: 'get'
        success: (html)->
          console.log('load ' + data.name)
          loadCount++

          #パラメータをセットする
          html = replaceParams(html, data)
          #アセットのパスを差し替える
          html = replaceAssetPath(html, data)
          #外部読み込みのファイルのパスを変更する
          html = replaceSrcPath(html, data)
          #コンポーネントのHTMLをパースする
          parseComponent(html, data)

          if loadCount < 100
            start()
          else
            warn()
      })

  parseComponent = (html, data)->
    html = html.replace(/<!--\s*(\/)?export\s*-->/g, '<!--$1export-->')
    list = html.split('<!--export-->')
    styles = []
    scripts = []
    codes = []
    len = list.length
    for i in [1...len]
      code = list[i]
      code = code.split('<!--/export-->').shift()
      code = code.replace /<style(.|\s)*?<\/style>/igm, (text) ->
        if !text.match(/<style[^>]+exclude[^>]*/)
          styles.push(text)
        return ''

      code = code.replace /<link[^>]+rel=["']stylesheet['"][^>]+>/igm, (text)->
        if !text.match(/<link[^>]+exclude[^>]*/)
          styles.push(text)
        return ''

      code = code.replace /<script(.|\s)*?<\/script>/gm, (text) ->
        if !text.match(/<script[^>]+exclude[^>]*/)
          scripts.push(text)
        return ''

      codes.push(code)

    _insertStyleComment = getStyleInsertPosition()
    _insertScriptComment = getScriptInsertPosition()
    insertStyles(styles, _insertStyleComment)
    insertHTML(codes, data)
    insertScripts(scripts, _insertScriptComment)


  getStyleInsertPosition = ()->
    if _insertStyleComment
      return _insertStyleComment

    children = document.head.childNodes
    len = children.length
    linkNode = null
    for i in [0...len]
      node = children[i]
      if String(node) == '[object Comment]'
        if String(node.data).indexOf('include components-css') >= 0
          return node
      if !linkNode && String(node) == '[object HTMLLinkElement]'
        linkNode = node
    return linkNode || node || null

  getScriptInsertPosition = ()->
    if _insertScriptComment
      return _insertScriptComment

    children = document.body.childNodes
    len = children.length
    scriptNode = null
    for i in [0...len]
      node = children[i]
      if String(node) == '[object Comment]'
        if String(node.data).indexOf('include components-js') >= 0
          return node
    scriptNode = document.getElementsByTagName('script')[0]
    return scriptNode || node || null

  replaceParams = (html, data)->
    params = data.attr
    html = html.replace /\$\{\s*([^}]+)\s*\}/g, (text, attr)->
      key = attr.replace /\s*\=.+/, ''
      val = attr.replace /^[^=]+\=?\s*/, ''
      return params[key] || val || ''
    return html

  replaceSrcPath = (html, data)->
    newPath = '../components/' + data.name + '/dist/'
    html = html.replace(/<script([^>]+)src=['"]([^'"]+)['"]/g, '<script$1src="' + newPath + '$2"')
    html = html.replace(/<link([^>]+)href=['"]([^'"]+)['"]/g, '<link$1href="' + newPath + '$2"')
    return html

  replaceAssetPath = (html, data)->
    return html.split('component-assets/')
      .join('../components/' + data.name + '/dist/component-assets/')

  insertStyles = (styles, insertCommentNode)->
    styles = styles.join('')
    if styles && document.head.innerHTML.indexOf(styles) < 0
      $(styles).insertBefore(insertCommentNode)

  insertScripts = (scripts, insertCommentNode)->
    scripts = scripts.join('')
    if scripts && document.body.innerHTML.indexOf(scripts) < 0
      $(scripts).insertBefore(insertCommentNode)

  insertHTML = (codes, data)->
    node = $(data.node)
    node.after(codes)
    node.remove()

  start = ()->
    if HtmlComponent
      HtmlComponent.wait(_waitKey)

    #コンポーネントタグの一覧を作る
    tags = getComponentTags()
    #コンポーネントを読み込む
    loadComponents(tags)
    #キューを開始する
    next()

  start()



