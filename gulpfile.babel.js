import gulp from 'gulp';
import sass from 'gulp-sass';
import babel from 'gulp-babel';
import gulpSequence from 'gulp-sequence';
import nodemon from 'nodemon';
import mocha from 'gulp-mocha';
import bower from 'gulp-bower';
import eslint from 'gulp-eslint';
import gulpRimraf from 'gulp-rimraf';

import dotEnv from 'dotenv';

dotEnv.config();

const { PORT } = process.env;

const paths = {
  publicJs: 'src/public/js/**',
  publicTxt: 'src/public/**.txt',
  jade: ['src/app/views/**'],
  js: ['src/public/js/**', 'src/app/**/*.js'],
  images: 'src/public/img/**/*',
  html: 'src/public/views/**',
  serverTests: ['build/test/server/**/**.js'],
  css: 'src/public/css/**.css',
  sass: 'src/public/css/**.scss',
  entry: 'src/server.js',
  allJs: [
    'src/**',
    '!src/public/lib/**',
    '!src/**/**.txt',
    '!src/**/**.json',
    '!src/**/**/**.jade',
    '!src/public/**',
    'src/public/js'
  ],
  watch: '',
  clientTests: 'build/test/client/**/*.js',
  configJson: './src/config/**/**.json',
  lib: './src/public/lib/**',
  svg: './src/public/svg/**.svg'
};


gulp.task('move_jade', () => {
  gulp.src(paths.jade)
    .pipe(gulp.dest('build/app/views'));
});

gulp.task('move_lib', () => {
  gulp.src(paths.lib)
    .pipe(gulp.dest('build/public/lib/'));
});

gulp.task('move_html', () => {
  gulp.src(paths.html)
    .pipe(gulp.dest('build/public/views/'));
});

gulp.task('move_css', ['sass'], () => {
  gulp.src(paths.css)
    .pipe(gulp.dest('build/public/css/'));
});

gulp.task('move_images', () => {
  gulp.src(paths.images)
    .pipe(gulp.dest('build/public/img/'));
});

gulp.task('move_public_js', () => {
  gulp.src(paths.publicJs)
    .pipe(gulp.dest('build/public/js/'));
});

gulp.task('move_public_txt', () => {
  gulp.src(paths.publicTxt)
    .pipe(gulp.dest('build/public/'));
});

gulp.task('move_json', () =>
  gulp
    .src(paths.configJson)
    .pipe(gulp.dest('./build/config')));

<<<<<<< HEAD
=======
gulp.task('move_svg', () =>
  gulp
    .src(paths.svg)
    .pipe(gulp.dest('./build/public/svg')));


>>>>>>> cd9118260507ad37ce43f17d85119cc95a3297f3
gulp.task('babel', () => {
  gulp
    .src(paths.allJs)
    .pipe(babel())
    .pipe(gulp.dest('build'));
});

gulp.task('sass', () => {
  gulp.src(paths.sass)
    .pipe(sass())
    .pipe(gulp.dest('src/public/css/'));
});

gulp.task('test', () =>
  gulp.src(paths.serverTests, { read: false })
    .pipe(mocha({
      reporter: 'spec'
    })));

gulp.task('bower', () => bower()
  .pipe(gulp.dest('./src/public/lib')));

gulp.task('lint', () => {
  gulp.src(paths.allJs)
    .pipe(eslint({ config: '.eslintrc.json' }))
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});


gulp.task('remove_bower_components', () => {
  gulp.src('./bower_components')
    .pipe(gulpRimraf({ force: true }));
});

gulp.task('nodemon', ['transpile'], () => {
  nodemon({
    script: './build/server.js',
    ext: 'js',
    ignore: ['README.md', 'node_modules/**', '.DS_Store'],
    env: {
      PORT
    }
  });
});

gulp
  .task(
    'build',
    gulpSequence(
      'babel', 'move_jade',
      'move_html', 'move_css',
      'move_lib', 'move_json',
      'move_images', 'move_public_js',
      'move_public_txt', 'move_svg'
    )
  );

gulp.task('build:dev', ['build', 'lint'], () => {
  gulp.watch(['src/**', '!src/public/lib/**'], ['babel']);
  gulp.watch([paths.configJson], ['move_json']);
  gulp.watch([paths.jade], ['move_jade']);
  gulp.watch([paths.css], ['sass']);
  gulp.watch([paths.html], ['move_html']);
  gulp.watch([paths.css], ['move_css']);
  gulp.watch([paths.lib], ['move_lib']);
  gulp.watch([paths.images], ['move_images']);
  gulp.watch([paths.publicJs], ['move_public_js']);
  gulp.watch([paths.publicTxt], ['move_public_txt']);
  gulp.watch([paths.svg], ['move_svg']);
});


gulp.task('install', gulpSequence('bower', 'remove_bower_components'));

