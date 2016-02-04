
import exec from 'exec';
import stylus from 'stylus';
import beauty from 'js-beautify';
import path from 'path';
import fs from 'fs';
import cheerio from 'cheerio';
import html2jade from 'html2jade';
import nib from 'nib';

import LayoutPreviewGenerator from './LayoutPreviewGenerator';
import HtmlTemplate from './HtmlTemplate';
import StylusTemplate from './StylusTemplate';
import LayoutJSONParser from './LayoutJSONParser';

var jsx = jsx || {};

function init(){

  var RE_ASSET_FILE = /"[^"]+\.(png|jpg|gif|json|svg|swf|mp3|mp4|mov|wav|ogg|webm)"/gm;
  var INDENT_STR = '  ';
  var _moduleDir = module.filename.replace(/\/[^\/]+$/, '/');

  jsx.LayoutPreviewGenerator = LayoutPreviewGenerator;
  jsx.HtmlTemplate = HtmlTemplate;
  jsx.StylusTemplate = StylusTemplate;
  jsx.LayoutJSONParser = LayoutJSONParser;
}

jsx.init = init;

module.exports = jsx;
