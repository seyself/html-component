(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
  var _insertScriptComment, _insertStyleComment, _queue, _registeredNodes, _waitKey, done, getComponentTags, getScriptInsertPosition, getStyleInsertPosition, insertHTML, insertScripts, insertStyles, loadComponent, loadComponents, loadCount, next, parseComponent, replaceAssetPath, replaceParams, replaceSrcPath, start, warn;
  _queue = [];
  _registeredNodes = [];
  loadCount = 0;
  _waitKey = String(Math.floor(Math.random() * 100000000));
  _insertStyleComment = null;
  _insertScriptComment = null;
  window._debug = true;
  next = function() {
    var task;
    task = _queue.shift();
    if (task) {
      return task();
    } else {
      return done();
    }
  };
  warn = function() {
    return alert('警告\nコンポーネントの読み込みが100を超えたため強制停止しました。');
  };
  done = function() {
    console.log('done!');
    if (HtmlComponent) {
      return HtmlComponent.resume(_waitKey);
    }
  };
  getComponentTags = function() {
    var attr, attrs, elements, i, j, k, l, len, m, matches, n, name, node, numAttrs, numElements, ref, ref1, ref2, tags;
    tags = [];
    matches = document.body.innerHTML.match(/<[^!>\/\s]+-[^>\s]+/g);
    if (!matches) {
      return null;
    }
    len = matches.length;
    for (i = l = 0, ref = len; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
      name = matches[i];
      name = name.substr(1);
      elements = document.getElementsByTagName(name);
      numElements = elements.length;
      for (j = m = 0, ref1 = numElements; 0 <= ref1 ? m < ref1 : m > ref1; j = 0 <= ref1 ? ++m : --m) {
        node = elements[j];
        numAttrs = node.attributes.length;
        attrs = {};
        for (k = n = 0, ref2 = numAttrs; 0 <= ref2 ? n < ref2 : n > ref2; k = 0 <= ref2 ? ++n : --n) {
          attr = node.attributes[k];
          if (attr) {
            attrs[attr.name] = attr.value;
          }
        }
        if (_registeredNodes.indexOf(node) < 0) {
          tags.push({
            name: name,
            node: node,
            attr: attrs
          });
          _registeredNodes.push(node);
        }
      }
    }
    return tags;
  };
  loadComponents = function(tags) {
    var i, l, len, ref, results;
    if (!tags) {
      return;
    }
    len = tags.length;
    results = [];
    for (i = l = 0, ref = len; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
      results.push(_queue.push(loadComponent(tags[i])));
    }
    return results;
  };
  loadComponent = function(data) {
    return function() {
      var node;
      node = data.node;
      return $.ajax({
        url: '../components/' + data.name + '/dist/' + data.name + '.html',
        method: 'get',
        success: function(html) {
          console.log('load ' + data.name);
          loadCount++;
          html = replaceParams(html, data);
          html = replaceAssetPath(html, data);
          html = replaceSrcPath(html, data);
          parseComponent(html, data);
          if (loadCount < 100) {
            return start();
          } else {
            return warn();
          }
        }
      });
    };
  };
  parseComponent = function(html, data) {
    var code, codes, i, l, len, list, ref, scripts, styles;
    html = html.replace(/<!--\s*(\/)?export\s*-->/g, '<!--$1export-->');
    list = html.split('<!--export-->');
    styles = [];
    scripts = [];
    codes = [];
    len = list.length;
    for (i = l = 1, ref = len; 1 <= ref ? l < ref : l > ref; i = 1 <= ref ? ++l : --l) {
      code = list[i];
      code = code.split('<!--/export-->').shift();
      code = code.replace(/<style(.|\s)*?<\/style>/igm, function(text) {
        if (!text.match(/<style[^>]+exclude[^>]*/)) {
          styles.push(text);
        }
        return '';
      });
      code = code.replace(/<link[^>]+rel=["']stylesheet['"][^>]+>/igm, function(text) {
        if (!text.match(/<link[^>]+exclude[^>]*/)) {
          styles.push(text);
        }
        return '';
      });
      code = code.replace(/<script(.|\s)*?<\/script>/gm, function(text) {
        if (!text.match(/<script[^>]+exclude[^>]*/)) {
          scripts.push(text);
        }
        return '';
      });
      codes.push(code);
    }
    _insertStyleComment = getStyleInsertPosition();
    _insertScriptComment = getScriptInsertPosition();
    insertStyles(styles, _insertStyleComment);
    insertHTML(codes, data);
    return insertScripts(scripts, _insertScriptComment);
  };
  getStyleInsertPosition = function() {
    var children, i, l, len, linkNode, node, ref;
    if (_insertStyleComment) {
      return _insertStyleComment;
    }
    children = document.head.childNodes;
    len = children.length;
    linkNode = null;
    for (i = l = 0, ref = len; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
      node = children[i];
      if (String(node) === '[object Comment]') {
        if (String(node.data).indexOf('include components-css') >= 0) {
          return node;
        }
      }
      if (!linkNode && String(node) === '[object HTMLLinkElement]') {
        linkNode = node;
      }
    }
    return linkNode || node || null;
  };
  getScriptInsertPosition = function() {
    var children, i, l, len, node, ref, scriptNode;
    if (_insertScriptComment) {
      return _insertScriptComment;
    }
    children = document.body.childNodes;
    len = children.length;
    scriptNode = null;
    for (i = l = 0, ref = len; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
      node = children[i];
      if (String(node) === '[object Comment]') {
        if (String(node.data).indexOf('include components-js') >= 0) {
          return node;
        }
      }
    }
    scriptNode = document.getElementsByTagName('script')[0];
    return scriptNode || node || null;
  };
  replaceParams = function(html, data) {
    var params;
    params = data.attr;
    html = html.replace(/\$\{\s*([^}]+)\s*\}/g, function(text, attr) {
      var key, val;
      key = attr.replace(/\s*\=.+/, '');
      val = attr.replace(/^[^=]+\=?\s*/, '');
      return params[key] || val || '';
    });
    return html;
  };
  replaceSrcPath = function(html, data) {
    var newPath;
    newPath = '../components/' + data.name + '/dist/';
    html = html.replace(/<script([^>]+)src=['"]([^'"]+)['"]/g, '<script$1src="' + newPath + '$2"');
    html = html.replace(/<link([^>]+)href=['"]([^'"]+)['"]/g, '<link$1href="' + newPath + '$2"');
    return html;
  };
  replaceAssetPath = function(html, data) {
    return html.split('component-assets/').join('../components/' + data.name + '/dist/component-assets/');
  };
  insertStyles = function(styles, insertCommentNode) {
    styles = styles.join('');
    if (styles && document.head.innerHTML.indexOf(styles) < 0) {
      return $(styles).insertBefore(insertCommentNode);
    }
  };
  insertScripts = function(scripts, insertCommentNode) {
    scripts = scripts.join('');
    if (scripts && document.body.innerHTML.indexOf(scripts) < 0) {
      return $(scripts).insertBefore(insertCommentNode);
    }
  };
  insertHTML = function(codes, data) {
    var node;
    node = $(data.node);
    node.after(codes);
    return node.remove();
  };
  start = function() {
    var tags;
    if (HtmlComponent) {
      HtmlComponent.wait(_waitKey);
    }
    tags = getComponentTags();
    loadComponents(tags);
    return next();
  };
  return start();
})();


},{}]},{},[1]);
