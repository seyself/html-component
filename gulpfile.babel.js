const path = require('path');
const dest = './lib/generator/dist';
const src = './lib/generator/src';
const relativeSrcPath = path.relative('.', src);

require( 'babel-register' );
const gulp = require('gulp');
const gulpif = require('gulp-if');
const uglify = require('gulp-uglify');
const webpack = require('gulp-webpack');
const watch = require('gulp-watch');
const config = {
  src: src,
  dest: dest,

  js: {
    src: src + '/**/*',
    dest: dest + '',
    uglify: false
  },

  webpack: {
    entry: src + '/main.js',
    output: {
      filename: 'generator.js'
    },
    resolve: {
      extensions: ['', '.js']
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          query: {
            presets: ['es2015'],
            optional: ['runtime'],
            stage: 0
          }
        }
      ]
    }
  }
}


gulp.task('webpack', ()=> {
    gulp.src(config.webpack.entry)
        .pipe(webpack(config.webpack))
        .pipe(gulpif(config.js.uglify, uglify()))
        .pipe(gulp.dest(config.js.dest));
});

gulp.task('watch', ()=> {
  watch('./src/**/*.js', ()=> {
    gulp.start(['webpack']);
  });
});

