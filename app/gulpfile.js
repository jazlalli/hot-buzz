// Run 'gulp' to do the important stuff
var gulp = require('gulp'),
  prefixer = require('gulp-autoprefixer'),
  sass = require('gulp-sass'),
  livereload = require('gulp-livereload'),
  nodemon = require('gulp-nodemon'),
  livereloadServer = require('tiny-lr')();

var path = require('path');
global.log = console.log.bind(console);

gulp.task('sass', function () {
  log('Updating SASS')
  gulp
    .src('./static/scss/ow.scss')
    .pipe(sass())
    .pipe(prefixer('last 2 versions', 'ie 9'))
    .pipe(gulp.dest('./static/css'))
    .pipe(livereload(livereloadServer));
});

// The default task (called when you run `gulp`)
gulp.task('default', ['sass'], function() {
  nodemon({ script: 'index.js', options: '--watch controllers --watch views --watch index.js --ext js,html' })
  livereloadServer.listen(35730, function (err) {
    if (err) return console.log(err);
    // Watch files and run tasks if they change
    gulp.watch('./static/scss/*.scss', ['sass']);
  });
});

