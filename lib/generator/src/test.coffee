jsx = jsx || {}

exec = require 'exec'
beautify = require('js-beautify')
path = require('path')
fs = require 'fs'
_cheerio = require('cheerio')
_moduleDir = module.filename.replace(/\/[^/]+$/, '/')

class jsx.LayoutPreviewGenerator
  
  _data = null
  _params = null
  _components = null
  _assets = 'test_layout-assets/'
  _componentExportable = true
  _ref_elements = {}
  _packageJsonTemplate = ''
  $ = null

  constructor: ()->
    

  load: (data)->
    _data = data
    return
    
  generate: (params)->
    _params = params
#    _assets = _params.assetsPath
    $ = _cheerio.load('<div><div id="main"></div></div>')
    $body = $('div')
    $main = $('div#main')
    doc = _data.document
    if !dest
      dest = './build'

    _components = []
    _ref_elements = {}

    params = {}
    style = _getBasicStyle(_data.document)
    _generateRelativeLayout(_data, $main, params)
    style += params.css

    body = $body.html()
    body = '<div id="container">' + body + '</div>'
    if _componentExportable
      body += '<script src="../components/libs/bundle.js" exclude></script>'
      body += '<script src="../components/html-component/dist/env.js" exclude></script>'
      body += '<script src="../components/html-component/dist/html-component.js" exclude></script>'
      body += '<script src="../components/html-component/dist/html-component-debug.js" exclude></script>'
    html = _createHTML(doc.title, style, body)
    html = beautify.html(html)
    htmlFile = dest + '/' + _data.document.filename + '.html'

    exec 'mkdir -p ' + dest, ()->
      fs.writeFile(htmlFile, html, null, null)
      _copyHTMLAssets html, ()->
        if _componentExportable
          _createComponents()

  _copyHTMLAssets = (html, callback)->
    pathes = []
    matches = html.match(/"[^"]+\.(png|jpg|gif|json|svg|swf|mp3|mp4|mov|wav|ogg|webm)"/gm)
    matches.forEach (code)->
      code = code.replace(/"/g, '')
      src = path.dirname(code)
      if code.match(/^https?:\/\//) || code.indexOf('html-component-debug.js') >= 0
        # not replace
        # console.log code
      else if pathes.indexOf(src) < 0
        pathes.push(src)

    copyList = []
    for src in pathes
      src_diff_1 = path.join(_params.cwd, src.replace(_params.assets_src_path, _params.assets_dest))
      src_diff_2 = path.join(_params.cwd, _params.assets_dest)
      srcDir = path.join(_params.assets_src, src_diff_1.replace(src_diff_2, ''))
      dstDir = path.dirname(src_diff_1)
      copyList.push {
        mkdir: dstDir
        cpSrc: srcDir
        cpDst: dstDir
      }

    _copyComponentAssets(null, {assets:copyList}, callback)



  _createComponents = ()->
    if !_packageJsonTemplate
      tmplPath = path.join(_moduleDir, '../../../template/package.json')
      _packageJsonTemplate = fs.readFileSync(tmplPath, {encoding:'utf8'})
      console.log 'load template : package.json'
      console.log _packageJsonTemplate

    data = _components.shift()
    if data
      html = data.node.html()
      html = '<div class="pse l' + data.id + ' ' + data.name + '">' + html + '</div>'
      css = data.data.css
      html = _createHTML(data.name, css, html, true)
      html = beautify.html(html)
      params = _replaceAssetPath(data, html)
      _copyComponentAssets data, params, ()->
        _createComponentFiles data, params, ()->
          _createPackageJson(data)
          _createComponents()

  _createPackageJson = (data)->
    filePath = 'components/' + data.name + '/package.json'
    filePath = path.join(_params.cwd, filePath)
    json = _packageJsonTemplate.split('${name}').join(data.name)
    fs.writeFileSync(filePath, json, {encoding:'utf8'})


  _replaceAssetPath = (data, html)->
    pathes = []
    result = 
      html: html
      base: 'components/' + data.name + '/dist/'
      assets: []
    dstBase = result.base
    matches = html.match(/"[^"]+\.(png|jpg|gif|json|svg|swf|mp3|mp4|mov|wav|ogg|webm)"/gm)
    matches.forEach (code)->
      code = code.replace(/"/g, '')
      src = path.dirname(code)
      if code.match(/^https?:\/\//) || code.indexOf('html-component-debug.js') >= 0
        # not replace
        # console.log code
      else if pathes.indexOf(src) < 0
        pathes.push(src)

    for src in pathes
      asset = path.join('component-assets', src.replace(_params.assets_src_path, ''))
      srcDir = path.join(_params.assets_src, src.replace(_params.assets_src_path, ''))
      dst = path.join(dstBase, asset)
      dstDir = path.join(_params.cwd, path.dirname(dst))
      result.html = result.html.split(src).join(asset)
      result.assets.push {
        mkdir: dst
        cpSrc: srcDir
        cpDst: dstDir
      }
    return result

  _createComponentFiles = (data, params, callback)->
    dest = 'components/' + data.name + '/dist/'
    exec 'mkdir -p ' + dest, ()->
      fs.writeFileSync('./' + dest + data.name + '.html', params.html)
      callback()

  _copyComponentAssets = (data, params, callback)->
    procList = []

    copyProc = (asset)->
      return () ->
        exec 'mkdir -p ' + asset.mkdir, ()->
          cmd = ['cp -fr', asset.cpSrc, asset.cpDst].join(' ')
          exec cmd, ()->
            nextProc()

    nextProc = ()->
      proc = procList.shift()
      if proc
        proc()
      else
        callback()

    for item in params.assets
      procList.push copyProc(item)

    nextProc()

  _createHTML = (title, css, body, exportComment)->
    code = '<!DOCTYPE html><html><head>'
    code += '<meta charset="utf-8">'
    code += '<title>' + title + '</title>'
    if exportComment
      code += '<link rel="stylesheet" href="../html-component/dist/html-component.css" exclude>'
      code += '<style exclude>' + _getStylePSE() + '</style>'
      code += '<!--export--><style>' + css + '</style>'
      code += '<link rel="stylesheet" href="./style.css">'
      code += '<!--/export--></head>'
      code += '<body><!--export-->' + body + '<!--/export-->'
      code += '<script src="../libs/bundle.js" exclude></script>'
      code += '<script src="../html-component/dist/env.js" exclude></script>'
      code += '<script src="../html-component/dist/html-component.js" exclude></script>'
      code += '<script src="../html-component/dist/html-component-debug.js" exclude></script>'
      code += '</body></html>'
    else
      code += '<link rel="stylesheet" href="../components/html-component/dist/html-component.css" exclude>'
      code += _getMetaData()
      code += '<style>' + css + '</style><!--include components-css--></head>'
      code += '<body>' + body
      code += '<!--include components-js--></body></html>'
    return code

  _getMetaData = ()->
    _meta = _data.meta
    code = ''
    if _meta
      code += '<meta name="description" content="' + _meta.meta_description + '">'
      code += '<meta name="keywords" content="' + _meta.meta_keywords + '">'
      code += '<meta name="viewport" content="width=device-width,initial-scale=1">'
      code += '<meta property="og:title" content="' + _meta.meta_name + '">'
      code += '<meta property="og:site_name" content="' + _meta.meta_name + '">'
      code += '<meta property="og:type" content="website">'
      code += '<meta property="og:url" content="' + _meta.meta_url + '">'
      code += '<meta property="og:description" content="' + _meta.meta_description + '">'
      code += '<meta property="og:image" content="' + _meta.meta_image + '">'
      code += '<meta property="og:locale" content="' + _meta.meta_locale + '">'
      code += '<meta http-equiv="X-UA-Compatible" content="IE=edge">'
      code += '<meta http-equiv="Content-Style-Type" content="text/css">'
      code += '<meta http-equiv="Content-Script-Type" content="text/javascript">'
      code += '<!--link rel="apple-touch-icon" href="images/touch-icon-iphone.png"-->'
      code += '<!--link rel="shortcut icon" href="images/favicon.ico"-->'
    return code


  _generateRelativeLayout = (params, $main, result)->
    doc = params.document
    layers = params.layers
    indexes = params.index
    offsetX = doc.offsetX
    offsetY = doc.offsetY
    result.css = ''
    _generateNodeList(indexes.children, doc, layers, $main, $main, result, doc.offsetX, doc.offsetY)

  _generateNodeList = (list, doc, layers, $root, $element, result, offsetX, offsetY)->
    for child in list
      if child.enabled
        _generateNode(child, doc, layers, $root, $element, result, offsetX, offsetY)


  _createElementTag = (id, layers)->
    data = layers[id]
    option = data.option
    meta = data.meta
    tag = ''

    if meta.type == 'text'
      tag = _getText(meta.text.text)
    else if meta.type == 'image'
      tag = '<img src="' + path.join(_params.assets_src_path, meta.image.url) + '" alt="' + meta.image.text.join(' ') + '">'
    
    if option?.link_url
      tag = '<a href="' + option.link_url + '" target="' + option.link_target + '">' + tag + '</a>'
    
    tag = '<div class="pse l'+id+' ' + option.name + '">' + tag + '</div>'
    return tag

  _generateNode = (node, doc, layers, $root, $element, result, offsetX, offsetY)->
    id = node.id
    data = layers[id]
    option = data.option

    meta = data.meta
    
    tag = _createElementTag(id, layers)

    $$ = _cheerio.load tag
    $div = $$('div')

    childContainer = $div
    if option?.link_url
      childContainer = $$('a')

    css = _createElementCSS(id, node, layers, offsetX, offsetY)
    
    if _componentExportable && data.option.component
      result = {
        css: css + '\n'
      }
    else
      result.css += css + '\n'

    if doc.referers.indexOf(id) >= 0
      _ref_elements[id] = childContainer

    if option.embed
      childContainer.append(unescape(option.embed))
    else if option.layer_name.match(/^@\d+/)
      ref_id = option.layer_name.match(/^@(\d+)/)[1]
      ref_node = _ref_elements[ref_id]
      if ref_node
        childContainer.append(ref_node.html())
    else
      _generateNodeList(node.children, doc, layers, $root, childContainer, result, 0, 0)

    if _componentExportable && data.option.component
      cname = data.option.component
      _components.push {
        id: id
        name: cname
        node: $div
        data: result
      }
      $copm = _cheerio.load('<' + cname + '></' + cname + '>')(cname)
      $element.append $copm
    else
      $element.append $div

  _createElementCSS = (id, node, layers, offsetX, offsetY)->
    data = layers[id]
    meta = data.meta

    css = '.l' + id + '{'
    if meta.text
      css += _createTextElementCSS(meta)

    data.top = meta.position.relative.y + offsetY
    data.left = meta.position.relative.x + offsetX
    
    if _isPositionRelative(data, meta, node, layers)
      css += 'position:relative;'

    # css += 'top:' + top + 'px;'
    css += 'margin-top:' + data.top + 'px;'
    css += 'left:' + data.left + 'px;'
    css += 'width:' + meta.size.width + 'px;'
    css += 'height:' + meta.size.height + 'px;'
    css += ''
    css += '}'

    return css

  _createTextElementCSS = (meta)->
    size = Number(meta.text.size.replace(/\spx/, ''))
    css = ''
    css += 'font-family:' + meta.text.font + ';'
    css += 'font-size:' + meta.text.size.replace(/\s+/g, '') + ';'
    css += 'color: #' + meta.text.color + ';'
    css += 'text-align: ' + meta.text.align + ';'
    css += 'line-height: ' + meta.text.line_height.replace(/\s+/g, '') + ';'
    css += 'letter-spacing: ' + (meta.text.letter_spacing / 6000 * size) + 'px;'
    return css

  _isPositionRelative = (data, meta, node, layers)->
    if node.positionRelative && node.prev_id
      prev = layers[node.prev_id]
      if prev
        data.top = meta.position.absolute.y - prev.bounds.bottom
      return true
    if !node.prev_id
      return true
    return false


  _getBasicStyle = (params)->
    style = 'body {'
    style += 'position:relative;'
    style += 'margin:0;'
    style += 'padding:0;'
    style += 'min-height:100%;'
    style += 'background:'+params.bgcolor+';'
    style += '}\n'
    style += '#container {'
    style += 'position:relative;'
    style += 'margin:' + params.margin + ';'
    style += 'padding:0;'
    style += 'width:100%;'
    style += '}\n'
    style += '#main {'
    style += 'position:relative;'
    style += 'margin:0 auto;'
    style += 'padding:0;'
    style += 'width:'+params.width+'px;'
    style += '}\n'
    style += 'p {'
    style += 'position:relative;'
    style += 'margin:0 0 32px;'
    style += 'padding:0;'
    style += '}\n'
    style += 'span, img, a {'
    style += 'display:inline-block;'
    style += 'margin:0;'
    style += 'padding:0;'
    style += '}\n'
    style += _getStylePSE()
    return style

  _getStylePSE = ()->
    style = ''
    style += '.pse {'
    style += 'position:absolute;'
    style += 'display:inline-block;'
    style += 'box-sizing:border-box;'
    style += 'top:0;'
    style += 'margin:0;'
    style += 'padding:0;'
    # style += 'border: solid 1px #999;'
    # style += 'transparent:true;'
    # style += 'opacity:0.5;'
    # style += 'background:#FF0000;'
    style += '}\n'
    return style


  _getText = (text)->
    texts = text.split('\n\n')
    text = '<p>' + texts.join('</p><p>') + '</p>'
    text = text.replace(/\n/g, '<br>')
    return text


module.exports = jsx




# _generateAbsoluteLayout = (params, $main, result)->
  #   doc = params.document
  #   layers = params.layers
  #   assets = 'test_layout-assets/'
  #   offsetX = doc.offsetX
  #   offsetY = doc.offsetY
  #   result.css = ''

  #   for id, data of layers
  #     meta = data.meta
  #     $$ = _cheerio.load '<div id="c'+id+'"></div>'
  #     $div = $$('div')
  #     if meta.type == 'text'
  #       $div.append _getText(meta.text.text)
  #     else if meta.type == 'image'
  #       $div.append '<img src="' + assets + meta.image.url + '" alt="' + meta.image.text.join(' ') + '">'
      
  #     $main.append $div

  #     css = '#c' + id + '{'
  #     css += 'position:absolute;'
  #     css += 'display:block;'
  #     css += 'margin:0;'
  #     css += 'padding:0;'
  #     # css += 'border: solid 1px #999;'
  #     # css += 'transparent:true;'
  #     # css += 'opacity:0.5;'
  #     # css += 'background:#FF0000;'
  #     if meta.text
  #       size = Number(meta.text.size.replace(/\spx/, ''));
  #       css += 'font-family:' + meta.text.font + ';'
  #       css += 'font-size:' + meta.text.size.replace(/\s+/g, '') + ';'
  #       css += 'color: #' + meta.text.color + ';'
  #       css += 'text-align: ' + meta.text.align + ';'
  #       css += 'line-height: ' + meta.text.line_height.replace(/\s+/g, '') + ';'
  #       css += 'letter-spacing: ' + (meta.text.letter_spacing / 6000 * size) + 'px;'

  #     css += 'top:' + (meta.position.absolute.y + offsetY) + 'px;'
  #     css += 'left:' + (meta.position.absolute.x + offsetX) + 'px;'
  #     css += 'width:' + meta.size.width + 'px;'
  #     css += 'height:' + meta.size.height + 'px;'
  #     css += ''
  #     css += '}'

  #     result.css += css + '\n'
