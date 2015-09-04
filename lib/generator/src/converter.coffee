jsx = jsx || {}

class jsx.Converter
  constructor: ()->
    log 1

  convert: ()->
    a = 2
    log a
    
  log = (arg)->
    console.log arg

module.exports = jsx
