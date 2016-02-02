jsx = jsx || {}

RESTClient = require('node-rest-client').Client


class jsx.LayoutJSONParser
  
  _layouts = null
  _options = null
  _meta = null
  _data = null
  
  constructor: ()->
    

  load: (layoutJson, callback)->
    _layouts = require layoutJson
    _options = _layouts.options

    if _options.root.docs_url
      try
        client = new RESTClient()
        client.get _options.root.docs_url, (data, response)->
          try
            if data
              _meta = {}
              tsv = String(data).split('\r\n')
              len = tsv.length
              for i in [1...len]
                cols = tsv[i].split('\t')
                key = cols[1]
                value = cols[2]
                _meta[key] = value
          catch e
            console.log 'Parse Error : Google Spreadsheets'
          if callback
            callback()
      catch e
        console.log 'Load Error : Google Spreadsheets'
      if callback
        callback()
    else
      if callback
        callback()
    
  parse: ()->
    _data = {
      meta: _meta
    }
    _setupDocumentData(_data, _layouts, _options)
    _setupIndexData(_layouts.index, _layouts.layers)
    # console.log JSON.stringify(_layouts.index, null, '  ')
    _setupLayoutNodesData(_data, _layouts, _options)
    return _data

  _setupIndexData = (index, layers)->
    list = index.children
    len = list.length
    prev_id = null
    next_id = null
    parent_id = index.id
    minY = 9999999999
    maxY = 0

    for i in [0...len]
      item = list[i]
      layer = layers[item.id]

      if layer
        layer.parent_id = parent_id
        layer.childIndex = i
      option = _options[item.id]
      if option.use_background
        parent = layers[parent_id]
        parent.background =
          image: option.layer_name
          pos_x: option.horizontal
          pos_y: option.vertical
        item.enabled = false
        option.enabled = false
        item.top = 0
        item.left = 0
        item.bottom = 0
        item.right = 0
        continue

      if layer
        item.top    = layer.meta.position.absolute.y
        item.left   = layer.meta.position.absolute.x
        item.bottom = layer.meta.size.height + item.top
        item.right  = layer.meta.size.width  + item.left

        layer.bounds = 
          top: item.top
          left: item.left
          bottom: item.bottom
          right: item.right

      else
        item.top = 0
        item.left = 0
        item.bottom = 0
        item.right = 0
    
    list.sort(_indexPositionSort)

    isPositionRelative = true
    bottomBorder = 0
    for i in [0...len]
      item = list[i]
      if item.enabled
        if bottomBorder <= item.bottom
          bottomBorder = item.bottom
        else
          isPositionRelative = false
          break

    for i in [0...len]
      item = list[i]
      item.positionRelative = isPositionRelative
      next = list[i+1]
      next_id = if next then next.id else null
      item.next_id = next_id
      item.prev_id = prev_id

      layer = layers[item.id]
      if layer
        layer.next_id = next_id
        layer.prev_id = prev_id

      if item.enabled
        prev_id = item.id
      _setupIndexData(item, layers)

  _indexPositionSort = (a, b)->
    if a.top == b.top
      if a.left == b.left
        return 0
      else if a.left < b.left
        return -1
      return 1
    else if a.top < b.top
      return -1
    return 1

  _setupDocumentData = (data, layouts, options)->
    minX = 999999
    minY = 0
    maxX = 0
    maxY = 0
    layers = layouts.layers
    referers = []
    for id, item of layers
      layerName = options[id].layer_name
      if layerName.match(/^@\d+$/)
        ref_id = layerName.match(/^@(\d+)$/)[1]
        if referers.indexOf(ref_id) < 0
          referers.push ref_id
      pos = item.meta.position.absolute
      size = item.meta.size
      
      left   = pos.x
      top    = pos.y
      right  = left + size.width
      bottom = top + size.height

      if minX > left
        minX = left
      if maxX < right
        maxX = right
      if maxY < bottom
        maxY = bottom

    root = options.root
    width = maxX - minX
    height = maxY
    offsetX = minX
    offsetY = minY
    
    data.document = 
      title: root.doc_title
      filename: root.name.split('.').shift()
      psd: root.name
      horizontal: root.horizontal
      vertical: root.vertical
      device: root.doc_type
      width: width
      height: height
      offsetX: -offsetX
      offsetY: -offsetY
      bgcolor: root.bgcolor
      margin: root.margin
      referers: referers
    
    return

  _setupLayoutNodesData = (data, layouts, options)->
    nodes = {}
    layers = layouts.layers
    index = layouts.index
    for id, item of layers
      item.option = options[id]
    data.index = index
    data.layers = layers






module.exports = jsx
