class Env

  @className = 'Env'
  @version = '1.0.0'

  # --------------------------------------------------- event types

  # --------------------------------------------------- private fields

  # --------------------------------------------------- constructor
  constructor: ()->
    _os = $.ua.os.name.toLowerCase()
    _os_ver = _version $.ua.os.version
    _browser = $.ua.browser.name.toLowerCase()
    _browser_ver = _version $.ua.browser.version

    @osName = _os
    @osVersion = _os_ver
    @browserName = _browser
    @browserVersion = _browser_ver
    @ios = if _os.indexOf('ios') >= 0 then _os_ver else null
    @android = if _os.indexOf('android') >= 0 then _os_ver else null
    @ie = if _browser.indexOf('ie') >= 0 then _browser_ver else null
    @chrome = if _browser.indexOf('chrome') >= 0 then _browser_ver else null
    @firefox = if _browser.indexOf('firefox') >= 0 then _browser_ver else null
    @safari = if _browser.indexOf('safari') >= 0 then _browser_ver else null
    @mobile = !!@ios || !!@android

    _className_os = _os.replace(' ', '_')
    _className_browser = _browser.replace(' ', '_')
    $(document.body).parent().addClass(_className_os)
    $(document.body).parent().addClass(_className_browser)
    $(document.body).parent().addClass(_className_os + '-' + String(_os_ver.version_num).replace('.', '_'))
    $(document.body).parent().addClass(_className_browser + '-' + String(_browser_ver.version_num).replace('.', '_'))

  # --------------------------------------------------- public methods
  toString: ()=>
    return Env.className

  # --------------------------------------------------- private methods
  _version = (v)=>
    if !v then return {version: '0.0.0', version_num: 0}

    num = Number(v.replace(/^(\d+(\.\d+)?).*/, '$1'))
    return {version: v, version_num: num}

window.env = new Env()

