var gulp = require("gulp"),
jade = require("gulp-jade"),
plumber = require("gulp-plumber"),
stylus = require("gulp-stylus"),
watch = require('gulp-watch');


gulp.task("jade", function(){
  gulp.src('./src/**.jade')
      .pipe(plumber())
      .pipe(jade({pretty: true}))
      .pipe(gulp.dest('./dist'));
});

gulp.task('stylus', function() {
    gulp.src('./src/**.styl')
      .pipe(stylus())
      .pipe(gulp.dest('./dist'));
});

gulp.task('watch', function () {
	watch('./src/**.jade', function() {
        gulp.start(['jade']);
    });
    watch('./src/**.styl', function () {
        gulp.start(['stylus']);
    });
});

gulp.task('build', ['jade', 'stylus']);