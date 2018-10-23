
var gulp = require('gulp');
var pug = require('gulp-pug');
var sass = require('gulp-sass');
var minifyCSS = require('gulp-csso');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();
gulp.task('html', function(){
  return gulp.src('src/html/*.html')
    //.pipe(pug())
    .pipe(gulp.dest('dist/html'))
});

gulp.task('css', function(){
  return gulp.src(['src/scss/*.scss','src/css/*.css'])
    .pipe(sourcemaps.init())
    .pipe(sass())
    //.pipe(minifyCSS())
    .pipe(gulp.dest('dist/css'))
});

gulp.task('sass', function() {
    return gulp.src(['src/bootstrap/scss/bootstrap.scss'])
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(gulp.dest("dist/src/bootstrap"))
        .pipe(browserSync.stream());
});


gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  });
});

gulp.task('js', function(){
  return gulp.src('src/js/*.js')
    .pipe(sourcemaps.init())
    //.pipe(concat('app.min.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/js'))
});

gulp.task('default', [ 'html', 'css','sass', 'js' ]);
// Dev task
gulp.task('dev', ['css', 'js', 'browserSync'], function() {
  gulp.watch('./scss/*.scss', ['css']);
  gulp.watch('./js/*.js', ['js']);
  gulp.watch('./*.html', browserSync.reload);
});