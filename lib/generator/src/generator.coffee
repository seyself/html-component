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

  _moduleDir = module.filename.replace(/\/[^\/]+$/, '/')

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
      _generateInit(params)
      filePath = _createFilePath(params)
      exportData = {
        style: _createStyleSheet(_data)
        html: _createHTMLCode(_data.document, filePath)
      }
      _exportHTML(params, filePath, exportData)

    _generateInit = (params)->
      $ = _cheerio.load('<div><div id="main" class="_' + _data.document.filename + '"></div></div>', {decodeEntities: false})
      params.dest = '../app/build'
      _components = []
      _ref_elements = {}

    _createStyleSheet = (jsonData)->
      $main = $('div#main')
      params = {}
      styleCode = _getBasicStyle(jsonData.document)
      _generateRelativeLayout(jsonData, $main, params)
      styleCode += params.css

    _createHTMLCode = (document, filePath)->
      $body = $('div')
      body = $body.html()
      body = '<div id="container">' + body + '</div>'
      if _componentExportable
        body += htmlTemplate.scriptTags(filePath.jsPath)

      htmlCode = _createHTML(document.title, filePath.cssPath, body)
      htmlCode = beautify.html(htmlCode)
      return htmlCode

    _exportHTML = (params, filePath, data)->
      _createDestDir params.dest, ()->
        fs.writeFile(filePath.htmlFile, data.html, {encoding:'utf8'}, null)
        _copyHTMLAssets data.html, ()->
          # export jade
          _exportJadeFile(params, data.html, filePath.jadeFile, filePath.stylusFile, data.style, filePath.cssFile)

      # _exportHTML()
    _createFilePath = (params)->
      htmlFile = path.join(params.dest_dir, params.filename)
      jadeFile = './src/pages/' + params.filename.replace('.html', '.jade')
      cssFile = path.join(params.dest_dir, 'css')
      cssFile = path.join(cssFile, path.basename(htmlFile).replace('.html', '.css'))
      stylusFile = './src/pages/css/' + params.filename.replace('.html', '.styl')
      cssPath = path.relative path.dirname(htmlFile), cssFile
      jsPath = cssPath.replace /[^\/]+\/([^.]+)\.css/, 'js/$1.js'
      return {
        htmlFile: htmlFile
        jadeFile: jadeFile
        cssFile: cssFile
        stylusFile: stylusFile
        cssPath: cssPath
        jsPath: jsPath
      }


    _exportJadeFile = (params, html, jadeFile, stylusFile, style, cssFile)->
      if params.export_jade
        exec 'mkdir -p ' + './src/pages', ()->
          html2jade.convertHtml html, {donotencode:true}, (err, jade) ->
            jade = _replaceJadeFormat(jade)
            fs.writeFile(jadeFile, jade, {encoding:'utf8'}, null)

            _exportCssFile( stylusFile, style, cssFile)

      else
        if _componentExportable
          _createComponents()

    _exportCssFile = (stylusFile, style, cssFile)->
      exec 'mkdir -p ' + './src/pages/css', ()->
        fs.writeFile(stylusFile, style, {encoding:'utf8'}, null)
        _generateCSS cssFile, style

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

      copyList = _createCopyList(pathes)

      _copyComponentAssets(null, {assets:copyList}, callback)

    _createCopyList = (pathes)->
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
      return copyList

    _createComponents = ()->
      if !_packageJsonTemplate
        _writePackageJsonTemplate(_packageJsonTemplate)

      data = _components.shift()

      if data
        packageJsonPath = 'components/' + data.name + '/package.json'
        isWritable = true
        if _isComponent(packageJsonPath)
          packageJson = fs.readFileSync(packageJsonPath, {encoding:'utf8'})
          if packageJson
            packageJson = JSON.parse(packageJson)

            # package.jsonのversionが'0.0.0'以外の時はコンポーネントは作らない
            if packageJson.version != '0.0.0'
              _createComponents()
              return

        console.log 'create component #' + data.name

        _setComponentFiles(data)


    _writePackageJsonTemplate = (_packageJsonTemplate) ->
      tmplPath = path.join(_moduleDir, '../../../template/package.json')
      _packageJsonTemplate = fs.readFileSync(tmplPath, {encoding:'utf8'})

    _isComponent = (packageJsonPath) ->
      return fs.existsSync(packageJsonPath)

    _setComponentFiles = (data) ->
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
        pathes = _makeAssetPathList(code, pathes)

      for src in pathes
        result = _setAssetPathList(dstBase, src, result)

      return result

    _setAssetPathList = (dstBase, src, result) ->
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

    _makeAssetPathList = (code, pathes) ->
      code = code.replace(/"/g, '')
      src = path.dirname(code)
      if code.match(/^https?:\/\//) || code.indexOf('html-component-debug.js') >= 0
        # not replace
        # console.log code
        return pathes
      else if pathes.indexOf(src) < 0
        pathes.push(src)
        return pathes

    _createComponentFiles = (data, params, callback)->
      filePath = _createComponentFilePath(data)
      exec 'mkdir -p ' + filePath.dstDir, ()->
        fs.writeFileSync(filePath.htmlFile, params.html, {encoding:'utf8'})
        _generateCSS filePath.cssFile, filePath.style

        if _params.export_jade
          _createSrcFiles(filePath, params, callback)
        else
          callback()

    _createSrcFiles = (filePath, params, callback)->
      exec 'mkdir -p ' + filePath.srcDir, ()->
        html2jade.convertHtml params.html, {donotencode:true}, (err, jade) ->
          jade = _replaceJadeFormat(jade)
          fs.writeFileSync(filePath.jadeFile, jade, {encoding:'utf8'})
          fs.writeFileSync(filePath.stylFile, filePath.style, {encoding:'utf8'})
          callback()


    _createComponentFilePath = (data)->
      dstDir = 'components/' + data.name + '/dist/'
      srcDir = 'components/' + data.name + '/src/'
      style = data.data.css
      htmlFile = './' + dstDir + data.name + '.html'
      cssFile = './' + dstDir + data.name + '.css'
      jadeFile = './' + srcDir + data.name + '.jade'
      stylFile = './' + srcDir + data.name + '.styl'
      return {
        dstDir: dstDir
        srcDir: srcDir
        style: style
        htmlFile: htmlFile
        cssFile: cssFile
        jadeFile: jadeFile
        stylFile: stylFile
      }



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
      config = _setConfig(node, layers, parentName)
      tag = _createElementTag(config.id, layers)
      $$ = _cheerio.load(tag, {decodeEntities: false})
      $div = $$('div')
      childContainer = $div

      if config.option?.link_url
        childContainer = $$('a')

      argumentList = _makeArgumentList(config, result, indentLevel, node, layers)

      result = _createResultCSS(argumentList, isRoot, offsetX, offsetY)

      if doc.referers.indexOf(config.id) >= 0
        _ref_elements[config.id] = childContainer

      _appendNodeOption(argumentList, childContainer, doc, $root, component)
      _appendComponentElement(argumentList, _cheerio, _components, $element, $div)

    _makeArgumentList = (config, result, indentLevel, node, layers)->
      return {
        config: config
        result: result
        indentLevel: indentLevel
        node: node
        layers: layers 
      }


    _appendNodeOption = (list, childContainer, doc, $root, component)->
      option = list.config.option
      if option.embed
        childContainer.append(unescape(option.embed))
      else if _layerNameIsLink(option.layer_name)
        _appendReferenceNode(childContainer, _ref_elements, option.layer_name)
      else
        _generateNodeList(list.node.children, list.config.classPath, list.indentLevel + 1, doc, list.layers, $root, childContainer, list.result, 0, 0, component, false)

    _appendComponentElement = (list, _cheerio, _components, $element, $div)->
      if _componentExportable && list.config.data.option.component
        _appendComponent(list.config.id, _cheerio, _components, list.config.data.option.component, $div, list.result, $element)
      else
        $element.append $div

    _createResultCSS = (list, isComponentRoot, offsetX, offsetY)->
      if _componentExportable && list.config.data.option.component
        isComponentRoot = true
        component = list.config.data.option.component
        list.config.className = component

        list.result.css += _createComponentCSS(list.config.id, list.config.className, list.indentLevel, list.node, list.layers, offsetX, offsetY)
        list.result = {
          css: ''
        }
        list.indentLevel = 0

      css = _createElementCSS(list.config.id, list.config.className, list.indentLevel, list.node, list.layers, offsetX, offsetY, component, isComponentRoot)
      list.result.css += css + '\n'

      return list.result


    _appendComponent = (id, cheerio, componentList, componentName, $div, result, $element)->
      componentList.push {
        id: id
        name: componentName
        node: $div
        data: result
      }
      $component = cheerio.load('<' + componentName + '></' + componentName + '>', {decodeEntities: false})(componentName)
      $element.append $component


    _layerNameIsLink = (layerName)->
      return layerName.match(/^@\d+/) != null

    _appendReferenceNode = (container, elements, layerName)->
      ref_id = layerName.match(/^@(\d+)/)[1]
      ref_node = elements[ref_id]
      if ref_node
        container.append(ref_node.html())


    _setConfig = (node, layers, parentName)->
      id = node.id
      data = layers[id]
      option = data.option
      className = option.name
      classPath = _setClassPath(parentName, className)
      return {
        id: id
        data: data
        option: option
        className: className
        classPath: classPath
      }

    _setClassPath = (parentName, className)->
      if parentName
        classPath = parentName + ' ' + className
        return classPath
      else
        classPath = className
        return classPath


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

      css = _appendCSSElementIndent(_indent, css, classPath)
      _indent += INDENT_STR
      css = _createTextElementCSS(meta, _indent, css)
      _setDataPosition(data, meta, offsetX, offsetY)
      css = _setDataBackground(data, css, _indent)

      isRelative = _isPositionRelative(data, meta, node, layers)
      parent = layers[data.parent_id]

      css += stylusTemplate.position(data, _indent, parent, isRelative, isComponentRoot)
      css += stylusTemplate.size(data, _indent)
      css += ''
      css += ''

      return css

    _setDataPosition = (data, meta, offsetX, offsetY)->
      data.top = meta.position.relative.y + offsetY
      data.left = meta.position.relative.x + offsetX

    _setDataBackground = (data, css, _indent)->
      if data.background && data.background.image
        css += stylusTemplate.background(data, _indent, _params.assets_src_path)
        return css
      else 
        return css


    _appendCSSElementIndent = (_indent, css, classPath)->
      if _indent
        css += _indent + '& > .' + classPath + '\n'
      else
        css += _indent + '.' + classPath + '\n'

      return css



    _getIndent = (level, str)->
      unless str
        str = '\t'

      code = ''
      for i in [0...level]
        code += str
      return code

    _createTextElementCSS = (meta, indent, css)->
      if meta.text
        css += stylusTemplate.textElement meta, indent
        return css
      else
        return css

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
          return _compareNodeHeight(prev, data, node, meta)

      if !node.prev_id
        return true
      return false

    _compareNodeHeight = (prev, data, node, meta)->
      if prev.bounds.bottom <= data.bounds.top
        data.top = data.bounds.top - prev.bounds.bottom
        return true

      if node.positionRelative
        data.top = meta.position.absolute.y - prev.bounds.bottom
        return true


    _getBasicStyle = (params)->
      return stylusTemplate.basicStyle params

    _getStylePSE = ()->
      return stylusTemplate.pse()

    _getText = (text)->
      return htmlTemplate.textBlock text

jsx.init = init

module.exports = jsx
