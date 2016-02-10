'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateInit = generateInit;

var _cheerio2 = require('cheerio');

var _cheerio3 = _interopRequireDefault(_cheerio2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function generateInit(params, data, $) {
  $ = _cheerio3.default.load('<div><div id="main" class="_' + data.document.filename + '"></div></div>', { decodeEntities: false });
  params.dest = '../app/build';
}