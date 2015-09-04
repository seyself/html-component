jsx = jsx || {}

class jsx.CSSGenerator
  
  _json = null
  
  constructor: ()->
    

  load: (jsonFile)->
    _json = require jsonFile
    
  generate: ()->
    #

module.exports = jsx
