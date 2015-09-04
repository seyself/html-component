config = require('../config')
gulp = require('gulp')
uglify = require('gulp-uglify')
concat = require('gulp-concat')
gulpif = require('gulp-if')

file = 'bundle.js'
dest = 'components/libs'
_min = false

list = [
	"bower_components/jquery/dist/jquery.min.js"
	"bower_components/eventemitter2/lib/eventemitter2.js"
	"bower_components/ua-parser-js/dist/ua-parser.min.js"
#	"bower_components/PreloadJS/lib/preloadjs-0.6.1.min.js"
#	"bower_components/SoundJS/lib/soundjs-0.6.1.min.js"
#	"bower_components/velocity/velocity.min.js"
#	"bower_components/fastclick/lib/fastclick.js"
]

gulp.task 'prebuild', ()->
  gulp.src(list)
      .pipe(concat(file))
      .pipe(gulpif(_min, uglify()))
      .pipe(gulp.dest(dest))
