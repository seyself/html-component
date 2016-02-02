const path = require('path');
const dest = './dist';
const src = './src';
const relativeSrcPath = path.relative('.', src);

const gulp = require('gulp');
const gulpif = require('gulp-if');
const uglify = require('gulp-uglify');
const webpack = require('gulp-webpack');
const watch = require('gulp-watch');
const config = {
  src: src,
  dest: dest,

  js: {
    src: src + '/js/**/*',
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
          exclude: "/Users/newton/project/htmlGenerator/html-generate/server/generator/node_modules/html-component/lib/generator/node_modules",
          query: {
            presets: ['es2015']
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

