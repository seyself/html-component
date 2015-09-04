config = require('../config')
gulp = require('gulp')

srcPath = [
	config.assets + '/**/*.{png,jpg,gif,mp3,mp4,wav,ogg,html,js,css,otf,svg,ttf,woff,ico}'
]

gulp.task 'copy', ()->
	gulp.src(srcPath)
		.pipe(gulp.dest(config.dest))

