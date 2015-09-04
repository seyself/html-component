_ = require('lodash')
path = require('path')
args = require('yargs').argv


current = process.cwd()
src    = './src'
cdn    = 'http://localhost:8000/'

_data = require('./data');

relativeSrcPath = path.relative('.', src);

debug = args.debug == true || args.debug == 'true';
target = args.target || '';
_minify = !debug;

_common = {
  debug: debug,
  cdn: cdn
};
_common = _.merge(_common, _data);

module.exports =
  src: './src'
  assets: './assets'
  dest: './dist'
  libs: './libs'
  cdn: cdn
  components: 'components'
  args: args
  data: _common
  target: args.target || ''
  minify: !debug
  debug: debug

