'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _nodeRestClient = require('node-rest-client');

var _nodeRestClient2 = _interopRequireDefault(_nodeRestClient);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MetaDataLoader = (function () {
  function MetaDataLoader() {
    _classCallCheck(this, MetaDataLoader);
  }

  _createClass(MetaDataLoader, [{
    key: 'getSpreadSheetURL',
    value: function getSpreadSheetURL(options) {
      if (!options) return null;
      if (!options.root) return null;
      return options.root.docs_url || null;
    }
  }, {
    key: 'loadSpreadSheet',
    value: function loadSpreadSheet(url, callback) {
      var metaData = {};
      try {
        var client = new _nodeRestClient2.default.Client();
        client.get(url, function (data, response) {
          try {
            if (data) {
              var tsv = String(data).split('\r\n');
              var len = tsv.length;

              var tmpArray = [];
              for (var j = 0; j < len; j++) {
                tmpArray.push(j);
              }
              for (var i in tmpArray) {
                var cols = tsv[i].split('\t');
                var key = cols[1];
                var value = cols[2];
                metaData[key] = value;
              }
            }
          } catch (e) {
            console.log('Parse Error : Google Spreadsheets');
          }
          if (callback) {
            callback(metaData);
          }
        });
      } catch (e) {
        console.log('Load Error : Google Spreadsheets');
        if (callback) {
          callback(null);
        }
      }
    }
  }]);

  return MetaDataLoader;
})();

exports.default = MetaDataLoader;