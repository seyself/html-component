(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Env,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Env = (function() {
  var _version;

  Env.className = 'Env';

  Env.version = '1.0.0';

  function Env() {
    this.toString = bind(this.toString, this);
    var _browser, _browser_ver, _className_browser, _className_os, _os, _os_ver;
    _os = $.ua.os.name.toLowerCase();
    _os_ver = _version($.ua.os.version);
    _browser = $.ua.browser.name.toLowerCase();
    _browser_ver = _version($.ua.browser.version);
    this.osName = _os;
    this.osVersion = _os_ver;
    this.browserName = _browser;
    this.browserVersion = _browser_ver;
    this.ios = _os.indexOf('ios') >= 0 ? _os_ver : null;
    this.android = _os.indexOf('android') >= 0 ? _os_ver : null;
    this.ie = _browser.indexOf('ie') >= 0 ? _browser_ver : null;
    this.chrome = _browser.indexOf('chrome') >= 0 ? _browser_ver : null;
    this.firefox = _browser.indexOf('firefox') >= 0 ? _browser_ver : null;
    this.safari = _browser.indexOf('safari') >= 0 ? _browser_ver : null;
    this.mobile = !!this.ios || !!this.android;
    _className_os = _os.replace(' ', '_');
    _className_browser = _browser.replace(' ', '_');
    $(document.body).parent().addClass(_className_os);
    $(document.body).parent().addClass(_className_browser);
    $(document.body).parent().addClass(_className_os + '-' + String(_os_ver.version_num).replace('.', '_'));
    $(document.body).parent().addClass(_className_browser + '-' + String(_browser_ver.version_num).replace('.', '_'));
  }

  Env.prototype.toString = function() {
    return Env.className;
  };

  _version = function(v) {
    var num;
    if (!v) {
      return {
        version: '0.0.0',
        version_num: 0
      };
    }
    num = Number(v.replace(/^(\d+(\.\d+)?).*/, '$1'));
    return {
      version: v,
      version_num: num
    };
  };

  return Env;

})();

window.env = new Env();


},{}]},{},[1]);
