
config = require('../config')
gulp = require('gulp')
watch = require('gulp-watch')
sequence = require('run-sequence')

target = config.args.target || null

data =
  js         : 'src/pages/**/*.{js,coffee}'
  css        : 'src/pages/**/*.{css,scss,sass,less,styl}'
  html       : 'src/pages/**/*.{html,jade}'
  components : 'components/**/**.{html,jade,js,coffee,css,scss,sass,less,styl}'
  assets     : 'assets/**'



gulp.task 'watch', ()->
  # js
  watch data.js, (file)->
    gulp.start(['js'])

  # css
  watch data.css, (file)->
    gulp.start(['css'])

  # html
  watch data.html, (file)->
    gulp.start(['html'])

  # copy
  watch data.assets, (file)->
    gulp.start(['copy'])

  # components
  watch data.components, (file)->
    filepath = file.path;
    if (filepath.match(/\/(bin|build|deploy|dist)\//g))
      return

    match = filepath.match(/\/components\/(\w+(-\w+)+)\//)
    if match && match.length > 2
      name = match[1]
      ext = filepath.split('.').pop();
      if (['html','jade'].indexOf(ext) >= 0)
        config.args.type = 'html'
      else
      if (['js','coffee'].indexOf(ext) >= 0)
        config.args.type = 'js'
      else
      if (['css','sass','scss','less','styl'].indexOf(ext) >= 0)
        config.args.type = 'css'
      else
      if (filepath.indexOf('component-assets') >= 0)
        config.args.type = 'copy'

      config.args.target = name
      gulp.start(['components'])


