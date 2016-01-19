jsx = jsx || {}
init = () -> 

  RE_ASSET_FILE = /"[^"]+\.(png|jpg|gif|json|svg|swf|mp3|mp4|mov|wav|ogg|webm)"/gm
  INDENT_STR = '  '


  exec = require 'exec'
  beautify = require 'js-beautify'
  path = require 'path'
  fs = require 'fs'
  _cheerio = require 'cheerio'
  html2jade = require 'html2jade'
  stylus = require 'stylus'
  nib = require 'nib'

  htmlTemplate = new jsx.HtmlTemplate()
  stylusTemplate = new jsx.StylusTemplate()

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
      doc = _data.document

      $ = _cheerio.load('<div><div id="main" class="_' + doc.filename + '"></div></div>', {decodeEntities: false})
      $body = $('div')
      $main = $('div#main')

      if !dest
        dest = '../app/build'

      _components = []
      _ref_elements = {}

      htmlFile = path.join(_params.dest_dir, _params.filename)
      jadeFile = './src/pages/' + _params.filename.replace('.html', '.jade')
      cssFile = path.join(_params.dest_dir, 'css')
      cssFile = path.join(cssFile, path.basename(htmlFile).replace('.html', '.css'))
      stylusFile = './src/pages/css/' + _params.filename.replace('.html', '.styl')
      cssPath = path.relative path.dirname(htmlFile), cssFile
      jsPath = cssPath.replace /[^\/]+\/([^.]+)\.css/, 'js/$1.js'

      params = {}
      style = _getBasicStyle(_data.document)
      _generateRelativeLayout(_data, $main, params)
      style += params.css

      body = $body.html()
      body = '<div id="container">' + body + '</div>'
      if _componentExportable
        body += htmlTemplate.scriptTags(jsPath)

      html = _createHTML(doc.title, cssPath, body)
      html = beautify.html(html)

      _createDestDir dest, ()->
        fs.writeFile(htmlFile, html, {encoding:'utf8'}, null)
        _copyHTMLAssets html, ()->
          # export jade
          if _params.export_jade
            exec 'mkdir -p ' + './src/pages', ()->
              html2jade.convertHtml html, {donotencode:true}, (err, jade) ->
                jade = _replaceJadeFormat(jade)
                fs.writeFile(jadeFile, jade, {encoding:'utf8'}, null)

                exec 'mkdir -p ' + './src/pages/css', ()->
                  fs.writeFile(stylusFile, style, {encoding:'utf8'}, null)
                  _generateCSS cssFile, style

                if _componentExportable
                  _createComponents()
          else
            if _componentExportable
              _createComponents()

    _createDestDir = (dest, callback)->
      dir = [
        path.join(dest, 'js')
        path.join(dest, 'css')
        'src/pages/js'
        'src/pages/css'
        'src/assets'
        'src/libs'
      ].join(' ')
      exec 'mkdir -p ' + dir, ()->
        if callback
          callback()

    _replaceJadeFormat = (jade)->
      jade = jade.replace(/([\r\n]+)\s+\|\s*[\r\n]+/g, '$1')
      jade = jade.replace(/\/\/\s/g, '//')
      jade = jade.split('//- if (debug) {').join('- if (debug) {')
      jade = jade.split('//- }').join('- }')
      return jade

    _generateCSS = (cssFile, style)->
      stylus(style)
      .set('compress', false)
      .use(nib())
      .render (err, css)->
        if err
          console.log 'stylus #render() >>', err
        else
          fs.writeFile(cssFile, css, {encoding:'utf8'}, null)

    _getAssetFilePathList = (dest, filePathList) ->
      filePathList.forEach (filePath)->
        filePath = _deleteQuartFromURLText(filePath)
        src = path.dirname(filePath)
        if _isIgnoreAssetFilePath(filePath)
          # not replace
          # console.log filePath
        else if dest.indexOf(src) < 0
          dest.push(src)

    _isIgnoreAssetFilePath = (path) ->
      if _isFullURL(path) 
        return true
      if _isComponentDebugJS(path)
        return true
      return false

    _isFullURL = (url) ->
      return url.match(/^https?:\/\//) != null

    _isComponentDebugJS = (path) ->
      return path.indexOf('html-component-debug.js') >= 0

    _deleteQuartFromURLText = (text) ->
      return text.replace(/"/g, '')

    _copyHTMLAssets = (html, callback)->
      pathes = []
      matches = html.match(RE_ASSET_FILE)
      if matches
        _getAssetFilePathList(pathes, matches)

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
        _writePackageJsonTemplate(_packageJsonTemplate)

      data = _components.shift()

      if data
        packageJsonPath = 'components/' + data.name + '/package.json'
        isWritable = true
        if fs.existsSync(packageJsonPath)
          packageJson = fs.readFileSync(packageJsonPath, {encoding:'utf8'})
          packageJson = JSON.parse(packageJson)

          # package.jsonのversionが'0.0.0'以外の時はコンポーネントは作らない
          if packageJson.version != '0.0.0'
            _createComponents()
            return

        console.log 'create component #' + data.name

        html = data.node.html()
        html = '<div class="pse ' + data.name + '">' + html + '</div>'
        cssFile = data.name + '.css'

        stylusTemplate.componentBaseCSS (baseCSS)->
          html = _createHTML(data.name, cssFile, html, true, baseCSS)
          html = beautify.html(html)
          params = _replaceAssetPath(data, html)
          _copyComponentAssets data, params, ()->
            _createComponentFiles data, params, ()->
              _createPackageJson(data)
              _createComponents()

    _writePackageJsonTemplate = (_packageJsonTemplate) ->
      tmplPath = path.join(_moduleDir, '../../../template/package.json')
      _packageJsonTemplate = fs.readFileSync(tmplPath, {encoding:'utf8'})



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
      matches = html.match(RE_ASSET_FILE)
      matches?.forEach (code)->
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
      dstDir = 'components/' + data.name + '/dist/'
      srcDir = 'components/' + data.name + '/src/'
      style = data.data.css
      htmlFile = './' + dstDir + data.name + '.html'
      cssFile = './' + dstDir + data.name + '.css'
      jadeFile = './' + srcDir + data.name + '.jade'
      stylFile = './' + srcDir + data.name + '.styl'
      exec 'mkdir -p ' + dstDir, ()->
        fs.writeFileSync(htmlFile, params.html, {encoding:'utf8'})
        _generateCSS cssFile, style

        if _params.export_jade
          exec 'mkdir -p ' + srcDir, ()->
            html2jade.convertHtml params.html, {donotencode:true}, (err, jade) ->
              jade = _replaceJadeFormat(jade)
              fs.writeFileSync(jadeFile, jade, {encoding:'utf8'})
              fs.writeFileSync(stylFile, style, {encoding:'utf8'})
              callback()
        else
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

    _createHTML = (title, cssPath, body, exportComment, baseCSS)->
      code = htmlTemplate.head title
      if exportComment
        jsPath = cssPath.replace('.css', '.js')
        code += htmlTemplate.componentCssCode cssPath, baseCSS
        code += htmlTemplate.componentBodyCode body, htmlTemplate.componentScriptTags(jsPath)
      else
        code += _getMetaData()
        code += htmlTemplate.cssCode cssPath
        code += htmlTemplate.bodyCode body
      return code

    _getMetaData = ()->
      return htmlTemplate.metaData _data.meta


    _generateRelativeLayout = (params, $main, result)->
      doc = params.document
      layers = params.layers
      indexes = params.index
      offsetX = doc.offsetX
      offsetY = doc.offsetY
      className = '_' + doc.filename
      result.css = '.' + className + '\n'
      indentLevel = 1
      _generateNodeList(indexes.children, className, indentLevel, doc, layers, $main, $main, result, doc.offsetX, doc.offsetY, className, false)

    _generateNodeList = (list, parentName, indentLevel, doc, layers, $root, $element, result, offsetX, offsetY, component, isRoot)->
      for child in list
        if child.enabled
          _generateNode(child, parentName, indentLevel, doc, layers, $root, $element, result, offsetX, offsetY, component, isRoot)


    _createElementTag = (id, layers)->
      data = layers[id]
      option = data.option
      meta = data.meta
      tag = ''

      if meta.type == 'text'
        tag = _getText(meta.text.text)
      else if meta.type == 'image'
        tag = htmlTemplate.imageBlock(meta, _params.assets_src_path)

      if option?.link_url
        tag = '<a href="' + option.link_url + '" target="' + option.link_target + '">' + tag + '</a>'

      tag = '<div class="pse ' + option.name + '">' + tag + '</div>'
      return tag

    _generateNode = (node, parentName, indentLevel, doc, layers, $root, $element, result, offsetX, offsetY, component, isRoot)->
      id = node.id
      data = layers[id]
      option = data.option

      meta = data.meta
      
      tag = _createElementTag(id, layers)
      className = option.name
      if parentName
        classPath = parentName + ' ' + className
      else
        classPath = className

      $$ = _cheerio.load(tag, {decodeEntities: false})
      $div = $$('div')

      childContainer = $div
      if option?.link_url
        childContainer = $$('a')

      isComponentRoot = isRoot
      if _componentExportable && data.option.component
        isComponentRoot = true
        component = data.option.component
        className = component

        result.css += _createComponentCSS(id, className, indentLevel, node, layers, offsetX, offsetY)
        result = {
          css: ''
        }
        indentLevel = 0

      css = _createElementCSS(id, className, indentLevel, node, layers, offsetX, offsetY, component, isComponentRoot)

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
        _generateNodeList(node.children, classPath, indentLevel + 1, doc, layers, $root, childContainer, result, 0, 0, component, false)

      if _componentExportable && data.option.component
        cname = data.option.component
        _components.push {
          id: id
          name: cname
          node: $div
          data: result
        }
        $copm = _cheerio.load('<' + cname + '></' + cname + '>', {decodeEntities: false})(cname)
        $element.append $copm
      else
        $element.append $div

    _createComponentCSS = (id, classPath, indentLevel, node, layers, offsetX, offsetY)->
      data = layers[id]
      meta = data.meta
      _indent = _getIndent(indentLevel, INDENT_STR)
      css = ''
      if _indent
        css += _indent + '& > .' + classPath + '\n'
      else
        css += _indent + '.' + classPath + '\n'

      _indent += INDENT_STR

      data.top = meta.position.relative.y + offsetY
      data.left = meta.position.relative.x + offsetX

      isRelative = _isPositionRelative(data, meta, node, layers)
      parent = layers[data.parent_id]
      css += stylusTemplate.position(data, _indent, parent, isRelative, false)
  #    css += stylusTemplate.size(data, _indent)

      return css


    _createElementCSS = (id, classPath, indentLevel, node, layers, offsetX, offsetY, component, isComponentRoot)->
      data = layers[id]
      meta = data.meta
      _indent = _getIndent(indentLevel, INDENT_STR)
      css = ''
      if _indent
        css += _indent + '& > .' + classPath + '\n'
      else
        css += _indent + '.' + classPath + '\n'

      _indent += INDENT_STR

      if meta.text
        css += _createTextElementCSS(meta, _indent)

      data.top = meta.position.relative.y + offsetY
      data.left = meta.position.relative.x + offsetX

      if data.background && data.background.image
        css += stylusTemplate.background(data, _indent, _params.assets_src_path)

      isRelative = _isPositionRelative(data, meta, node, layers)
      parent = layers[data.parent_id]

      css += stylusTemplate.position(data, _indent, parent, isRelative, isComponentRoot)
      css += stylusTemplate.size(data, _indent)
      css += ''
      css += ''

      return css


    _getIndent = (level, str)->
      unless str
        str = '\t'

      code = ''
      for i in [0...level]
        code += str
      return code

    _createTextElementCSS = (meta, indent)->
      return stylusTemplate.textElement meta, indent

    _isPositionRelative = (data, meta, node, layers)->
  #    if data.meta.name == 'title'
  #      console.log data.meta.name
  #      prev = layers[node.prev_id]
  #      console.log data
  #      console.log prev
  #      console.log node.positionRelative

      if node.prev_id
        prev = layers[node.prev_id]
        if prev
          if prev.bounds.bottom <= data.bounds.top
            data.top = data.bounds.top - prev.bounds.bottom
            return true

          if node.positionRelative
            data.top = meta.position.absolute.y - prev.bounds.bottom
            return true

      if !node.prev_id
        return true
      return false


    _getBasicStyle = (params)->
      return stylusTemplate.basicStyle params

    _getStylePSE = ()->
      return stylusTemplate.pse()

    _getText = (text)->
      return htmlTemplate.textBlock text

jsx.init = init

module.exports = jsx
