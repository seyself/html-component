jsx = jsx || {}

class jsx.HtmlTemplate

  constructor: ->

  head: (title)->
    code = '<!DOCTYPE html><html><head>'
    code += '<meta charset="utf-8">'
    code += '<title>' + title + '</title>'
    code += '<meta name="viewport" content="width=device-width, initial-scale=1">'
    return code

  scriptTags: (jsPath)->
    code = ''
    code += '<script src="../components/libs/bundle.js"></script>'
    code += '<!--- if (debug) {-->'
    code += '<script src="../components/html-component/dist/env.js"></script>'
    code += '<script src="../components/html-component/dist/html-component.js"></script>'
    code += '<script src="../components/html-component/dist/html-component-debug.js"></script>'
    code += '<!--- }-->'
    code += '<!--include components-js-->'
    code += '<!--script(src="' + jsPath + '")-->'
    return code

  componentScriptTags: (jsPath)->
    code = ''
    code += '<script src="../../libs/bundle.js" exclude></script>'
    code += '<script src="../../html-component/dist/env.js" exclude></script>'
    code += '<script src="../../html-component/dist/html-component.js" exclude></script>'
    code += '<script src="../../html-component/dist/html-component-debug.js" exclude></script>'
    code += '<!--script(src="' + jsPath + '")-->'
    return code

  bodyCode: (body)->
    code = ''
    code += '<body>' + body
    code += '</body></html>'
    return code

  componentBodyCode: (body, script)->
    code = ''
    code += '<body><!--export-->' + body
    code += script
    code += '<!--/export-->'
    code += '</body></html>'
    return code

  cssCode: (cssPath)->
    code = ''
    code += '<!--- if (debug) {-->'
    code += '<link rel="stylesheet" href="../components/html-component/dist/html-component.css">'
    code += '<!--- }-->'
    code += '<!--include components-css-->'
    code += '<link rel="stylesheet" href="' + cssPath + '">'
    code += '</head>'
    return code


  componentCssCode: (cssPath, excludeCSS)->
    code = ''
    code += '<link rel="stylesheet" href="../../html-component/dist/html-component.css" exclude>'
    code += '<style exclude>'
    code += excludeCSS || ''
    code += '</style>'
    code += '<!--export-->'
    code += '<link rel="stylesheet" href="' + cssPath + '">'
    code += '<!--/export-->'
    code += '</head>'
    return code

  imageBlock: (meta, assetsPath)->
    alt = meta.image.text.join('')

    tag = '<img'
    tag += ' src="' + path.join(assetsPath, meta.image.url) + '"'
#    tag += ' width="' + meta.size.width + '"'
#    tag += ' height="' + meta.size.height + '"'
#    tag += ' height="auto"'
    if alt
      alt = alt.replace /[\r\n]/gm, ''
      tag += ' alt="' + alt + '"'
    tag += '>'
    return tag


  textBlock: (text)->
    texts = text.split('\n\n')
    text = '<p>' + texts.join('</p><p>') + '</p>'
    text = text.replace(/\n/g, '<br>')
    return text

  metaData: (meta)->
    code = ''
    if meta
      code += '<meta name="description" content="' + meta.meta_description + '">'
      code += '<meta name="keywords" content="' + meta.meta_keywords + '">'
      code += '<meta name="viewport" content="width=device-width,initial-scale=1">'
      code += '<meta property="og:title" content="' + meta.meta_name + '">'
      code += '<meta property="og:site_name" content="' + meta.meta_name + '">'
      code += '<meta property="og:type" content="website">'
      code += '<meta property="og:url" content="' + meta.meta_url + '">'
      code += '<meta property="og:description" content="' + meta.meta_description + '">'
      code += '<meta property="og:image" content="' + meta.meta_image + '">'
      code += '<meta property="og:locale" content="' + meta.meta_locale + '">'
      code += '<meta http-equiv="X-UA-Compatible" content="IE=edge">'
      code += '<meta http-equiv="Content-Style-Type" content="text/css">'
      code += '<meta http-equiv="Content-Script-Type" content="text/javascript">'
      code += '<!--link rel="apple-touch-icon" href="images/touch-icon-iphone.png"-->'
      code += '<!--link rel="shortcut icon" href="images/favicon.ico"-->'
    return code

module.exports = jsx
