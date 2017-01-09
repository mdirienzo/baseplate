//** NPM Dependencies **//
var gulp        = require('gulp'),
    del         = require('del'),
    eslint      = require('gulp-eslint'),
    include     = require('gulp-file-include'),
    sass        = require('gulp-sass'),
    autoprefix  = require('gulp-autoprefixer'),
    minifyCSS   = require('gulp-clean-css'),
    uglify      = require('gulp-uglify'),
    concat      = require('gulp-concat'),
    sourcemaps  = require('gulp-sourcemaps'),
    usemin      = require('gulp-usemin'),
    imagemin    = require('gulp-imagemin'),
    merge       = require('merge-stream'),
    htmlmin     = require('gulp-htmlmin'),
    runSequence = require('run-sequence'),
    plumber     = require('gulp-plumber'),
    postcss     = require('gulp-postcss'),
    purifycss   = require('gulp-purifycss'),
    exec        = require('child_process').exec, // Run command line options.
    rename      = require('gulp-rename'),
    babel       = require('gulp-babel');

var supportedBrowsers = '';

//** Path Variables **//
var rootPath      = 'src/',
    buildPath     = 'build/'
    tmpPath       = '.tmp/',
    distPath      = rootPath + 'public/',
    resourcesPath = rootPath + 'resources/',

    htmlSource    = resourcesPath + 'views/**/*.html',
    scriptsSource = resourcesPath + 'scripts/**/*.js'
    stylesSource  = resourcesPath + 'styles/**/*.scss',
    imagesSource  = resourcesPath + 'images/**/*.*';
    fontsSource   = resourcesPath + 'fonts/**/*.*';

/* Table of Contents:
    - Core Tasks
    - Dev Tasks
    - Prod Tasks
    - Common Tasks
*/

/** CORE TASKS **/

//Run the dev:build task and watch for changes
gulp.task('dev', ['dev:build'], function () {
    gulp.watch(stylesSource,  ['dev:styles']);
    gulp.watch(stylesSource,  ['dev:styles']);
    gulp.watch(scriptsSource, ['dev:scripts']);
    gulp.watch(imagesSource,  ['images']);
    gulp.watch(fontsSource,   ['fonts']);
});

//Runs the dev tasks.
gulp.task('dev:build', function(cb) {
    runSequence('common:build', ['dev:styles', 'dev:scripts'], cb);
});

//create a prod task that runs devbuild then runs the other prod tasks above
gulp.task('prod', function(cb) {
    runSequence('common:build', ['prod:styles', 'prod:scripts'], cb);
});

//create a prod task that runs devbuild then runs the other prod tasks above
gulp.task('common:build', function(cb) {
    runSequence('clean', ['images', 'fonts'], cb);
});


/** DEV SPECIFIC TASKS **/

// Build the styles for the dev environment. Will sourcemap, prefix, and concat
// the files into both the light/dark themes.
gulp.task('dev:styles', function() {
    return gulp.src(scriptsSource)
      .pipe(sass({ outputStyle: 'compact', errLogToConsole: true }))
      .pipe(sourcemaps.init())
          .pipe(autoprefix())
          .pipe(concat('styles.min.css'))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(distPath + '/css/'));
});

// Lint scripts and basic concat.
gulp.task('dev:scripts', function() {
    return gulp.src(scriptsSource)
      .pipe(sourcemaps.init())
        .pipe(eslint('.eslintrc'))
        .pipe(eslint.format())
        .pipe(babel({presets:['latest']}))
        .pipe(concat('scripts.min.js'))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(distPath + 'js/'));
});


/** PRODUCTION SPECIFIC TASKS **/

// Combine the the javascript listed at the end of the file appropriately and
// then minify them.
gulp.task('prod:scripts', function() {
    return gulp.src(scriptsSource)
      .pipe(concat('scripts.min.js'))
      .pipe(uglify())
      .pipe(gulp.dest(distPath + 'js/'));
});

// Full minification and excess CSS removal in the compiled css.
gulp.task('prod:styles', function() {
    return gulp.src(stylesSource)
      .pipe(sass({ outputStyle: 'compressed', errLogToConsole: true }))
        .pipe(autoprefix())
        .pipe(concat('styles.min.css'))
        .pipe(purifycss([scriptsSource, htmlSource])) // Can also add PHP here.
        .pipe(minifyCSS())
      .pipe(gulp.dest(distPath + '/css/'));
});

/** COMMON TASKS **/

//Copy images to tmp folder then, optimize
gulp.task('images', function(cb) {
    runSequence('copyImages', 'optimizeImages', cb);
});

//Copy images. We copy to tmp path in case we want to pull in resources
//from somewhere else.
gulp.task('copyImages', function() {
    return gulp.src(imagesSource)
        .pipe(gulp.dest(tmpPath + '/images'));
});

//Optimize Images
//this is a separate task because we don't want to optimize
//our svg files automatically
gulp.task('optimizeImages', function() {
    return gulp.src(tmpPath + '/images/*.{gif,jpg,png}')
        .pipe(imagemin())
        .pipe(gulp.dest(distPath + '/images'));
});

// Process fonts
gulp.task('fonts', function() {
    return gulp.src(fontsSource)
        .pipe(gulp.dest(distPath + 'fonts'));
});


//Clear out the dist folder before doing a build
// TODO: Make the (public/) folder agnostic.
gulp.task('clean', function () {
    return del.sync(
        // For Windows systems.
        [distPath + 'css/**/*.*',
        distPath + 'js/**/*.*',
        distPath + 'images/**/*.*',
        distPath + 'fonts/**/*.*',
        tmpPath + '**/*.*']
        // For Unix systems.
        // ['public/**', '!public']
    );
});
