var gulp = require('gulp'),
concat = require('gulp-concat'),
uglify = require('gulp-uglify'),
sass = require('gulp-sass');
nodemon = require('nodemon');
mocha = require('gulp-mocha');
bower = require('gulp-bower');

require('dotenv').config();

var PORT = process.env.PORT;
var NODE_ENV = process.env.NODE_ENV;

gulp.task('jade', function(){
    gulp.src('app/views/**')
      .pipe(gulp.dest('build/app/views'));
  });

  gulp.task('js-public', ['jade'], function(){
    gulp.src('public/js/**')
    .pipe(gulp.dest('build/public/js'));
  });

  gulp.task('js-app', ['jade'], function(){
    gulp.src('app/**/*.js')
      .pipe(gulp.dest('build/app'));
  });

  gulp.task('html', ['jade', 'js-public', 'js-app'], function(){
    gulp.src('public/views/**')
    .pipe(gulp.dest('build/public/views'));
  });

  gulp.task('sass', function(){
    gulp.src('public/css/**.scss')
    .pipe(sass())
    .pipe(gulp.dest('build/public/css/'));
  });

  gulp.task('css', function(){
    gulp.src('public/css/**.css')
    .pipe(gulp.dest('build/public/css/'));
  });

  gulp.task('test', function(){
    return gulp.src('test/**/*.js', { read: false })
      .pipe(mocha({
        reporter: 'spec'
      }))
      .pipe(gulp.dest('build/test/'));
  });

  gulp.task('server', function(){
    return gulp.src('./server.js')
      .pipe(gulp.dest('./build'));
  });

  gulp.task('bower', function(){
    return bower()
    .pipe(gulp.dest('./build/public/lib'));
  });

  gulp.task('config', function(){
    return gulp.src('./config/**')
    .pipe(gulp.dest('./build/config'));
  });

  gulp.task('public', function(){
    return gulp.src('./public/**')
    .pipe(gulp.dest('./build/public'));
  });

  gulp.task('app', function(){
    return gulp.src('./app/**')
    .pipe(gulp.dest('./build/app'));
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

  switch(NODE_ENV){
    case "development":
      gulp.task('default', ['nodemon']);
    break;
    case "production":
      gulp.task('default', [
        'jade', 
        'js-public', 
        'js-app', 
        'sass', 
        'server', 
        'html', 
        'css', 
        'config', 
        'app', 
        'public',
        'bower', 
        'build'
      ]);
    break;
    default:
    gulp.task('default', ['nodemon']);
    break;
  }
  
  gulp.task('install', ['bower']);
  