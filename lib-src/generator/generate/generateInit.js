
import _cheerio from 'cheerio';

export function generateInit(params, data){
  var $ = _cheerio.load('<div><div id="main" class="_' + data.document.filename + '"></div></div>', {decodeEntities: false});
  return {
    $    : $,
    dest : '../app/build'
  };
}
