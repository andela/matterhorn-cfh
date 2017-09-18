var gulp = require('gulp'),
concat = require('gulp-concat'),
uglify = require('gulp-uglify'),
sass = require('gulp-sass');
nodemon = require('nodemon');
mocha = require('gulp-mocha');
bower = require('gulp-bower');

require('dotenv').config();

var PORT = process.env.PORT;

gulp.task('jade', function(){
    gulp.src('app/views/**')
      .pipe(gulp.dest('build/app/views'));
  });

  gulp.task('js', ['jade'], function(){
    gulp.src('public/js/**')
    .pipe(gulp.dest('build/public/js'))
    .gulp.src('app/**/*.js')
      .pipe(gulp.dest('build/app'));
  });

  gulp.task('html', ['jade', 'js'], function(){
    gulp.src('public/views/**')
    .pipe(gulp.dest('build/public/views'));
  });

  gulp.task('sass', function(){
    gulp.src('public/css/*.scss')
    .pipe(sass())
  .pipe(gulp.dest('public/css/'));
  });

  gulp.task('test', function(){
    return gulp.src('test/**/*.js', { read: false })
      .pipe(mocha({
        reporter: 'spec'
      }));
  });

  gulp.task('bower', function(){
    return bower({
      targetDir: './public/lib',
      layout: 'byComponent',
      install: true,
      verbose: true,
      cleanBowerDir: true
    });
  });

  gulp.task('nodemon', function(){
    nodemon({
      script: './server.js',
      ext: 'js',
      ignore: ['README.md', 'node_modules/**', '.DS_Store'],
      env: {
        PORT: PORT
      }
    });
  });

  gulp.task('watch', function() {
    gulp.watch('app/views/**');
    gulp.watch(['public/js/**', 'app/**/*.js']);
    gulp.watch('public/views/**');
    gulp.watch(['public/css/common.scss', 'public/css/views/articles.scss'], ['sass']);
    gulp.watch('public/css/**', ['sass']);
  });

  gulp.task('default', ['nodemon']);
  gulp.task('install', ['bower']);
  