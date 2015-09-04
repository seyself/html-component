#config = require('../config')
#gulp = require('gulp')
#jade = require("gulp-jade")
#plumber = require("gulp-plumber")
#data = require("gulp-data")
#components = require('html-components').compile
#_ = require('lodash')
#
#target = config.args.target;
#
##---------
#
#options =
#  src: config.src + '/pages/**/!(_)*.jade'
#  dest: config.dest
#  dest_css: config.dest + '/css/'
#  dest_js: config.dest + '/js/'
#  params: {pretty: true}
#  data: _.merge(config.data, {
#
#  })
#  root: config.dest                # コンテンツのルートパス
#
#  components: config.components  # コンポーネントディレクトリ
#  absoluteAssetPath: false  # true を指定すると root からの絶対パスに変更する。false の場合はHTMLからの相対パス
#  suffix: ''                # コンポーネント書き出しファイルの接尾辞
#  beforeScript: null        # コンポーネント用JSの頭に追加するスクリプト
#  afterScript: null         # コンポーネント用JSの最後に追加するスクリプト
#  beforeStyle: null         # コンポーネント用CSSの頭に追加するスクリプト
#  afterStyle: null          # コンポーネント用CSSの最後に追加するスクリプト
#  developMode: false        # コンポーネント開発モード書き出し
#  html_min: false
#  js_min: true
#  css_min: false
#
##---------
#
#gulp.task "html", ()->
#  src = options.src
#  if target
#    src = src.replace('*.jade', target+'.jade')
#  gulp.src(src)
#    .pipe(plumber())
#    .pipe(data((file)->
#      return config.data
#    ))
#    .pipe(jade(options.params))
#    .pipe(components(options))
#    .pipe(gulp.dest(options.dest))
