
import _cheerio from 'cheerio';

export function generateInit(params, data, $){
  $ = _cheerio.load('<div><div id="main" class="_' + data.document.filename + '"></div></div>', {decodeEntities: false});
  params.dest = '../app/build';
}
