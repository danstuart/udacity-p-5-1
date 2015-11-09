'use strict';

// Include Gulp & Tools We'll Use
var $ = require('gulp-load-plugins')();
var concat = require('gulp-concat');
var browserSync = require('browser-sync');
var del = require('del');
var gulp = require('gulp');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var notify = require('gulp-notify');
var pagespeed = require('psi');
var reload = browserSync.reload;
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var size = require('gulp-size');
var uglify = require('gulp-uglify');
var minifyHTML = require('gulp-minify-html');
var minifyCSS = require('gulp-minify-css');
var pkg = require('./package.json');


var AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
];

// Lint JavaScript
gulp.task('jshint', function() {
    return gulp.src('app/js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
});

// JSCS the javascript
gulp.task('jscs', function() {
    gulp.src('app/js/*.js')
        .pipe(jscs())
        .pipe(notify({
            title: 'JSCS',
            message: 'JSCS Passed. Let it fly!'
        }))
});

// Watch Files For Changes & Reload
gulp.task('serve', function() {
    browserSync({
        notify: true,
        server: ['.tmp', 'app']
    });

    gulp.watch(['app/*.html'], reload);
    gulp.watch(['app/css/*.css'], [reload]);
    gulp.watch(['app/js/*.js'], ['jshint', reload]);
});

/**
 * build a production ready distribution of the js
 * html, css
 */
gulp.task('minify-js', function() {
    return gulp.src('./app/js/*.js')
        .pipe(uglify())
        .pipe(size())
        .pipe(gulp.dest('./dist/js'));
});

gulp.task('minify-html', function() {
    var opts = {
        conditionals: true,
        spare: true,
    };
    return gulp.src('./app/*.html')
        .pipe(minifyHTML(opts))
        .pipe(gulp.dest('./dist/'));
});

/** build */
gulp.task('minify-css', function() {
    return gulp.src('./app/css/*.css')
        .pipe(minifyCSS({
            keepBreaks: false
        }))
        .pipe(gulp.dest('./dist/css'))
});
gulp.task('build', ['minify-html', 'minify-css', 'minify-js']);