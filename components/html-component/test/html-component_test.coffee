assert = require('power-assert')

require '../src/env'
require '../src/html-component'

describe "HtmlComponent", ->
  beforeEach ->
    @hc = {x:0, y:0}

  describe '#HtmlComponent()', ->
    it 'test', ->
      assert @hc.x == 0
