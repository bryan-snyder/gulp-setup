// Gulp Template 
// Author: Bryan Snyder
// 2016-04-08


// REQUIREMENTS

// require gulp install with npm
var gulp = require('gulp');

// require browser-sync install with npm
var browserSync = require('browser-sync').create();

// require gulp plugins here install with npm
var sass = require('gulp-sass'); // compile sass
var autoprefixer = require('gulp-autoprefixer'); //adds autoprefixers
var useref = require('gulp-useref'); // explain at task
var uglify = require('gulp-uglify'); // minify js with UglifyJS
var gulpIf = require('gulp-if'); // conditionally control vinyl obj flow
var cssnano = require('gulp-cssnano'); // minify css with cssNano
var imagemin = require('gulp-imagemin'); // optimize png, jpg, gif, svg files
var cache = require('gulp-cache'); // cache stuff
var del = require('del'); // clean stuff
var runSequence = require('run-sequence'); // runSequence



// GULP TASK LIST
// start up browserSync server
gulp.task('browserSync', function(){
	browserSync.init({
		server: {
			baseDir: 'app'
		    },
		})
});

// scss conversion
gulp.task('sass', function(){
  return gulp.src('app/scss/**/*.scss') // Get all .scss in app/scss/
    .pipe(sass()) // Compile sass to css with gulp-sass
    .pipe(autoprefixer('last 2 version')) //add autoprefixers to css
    .pipe(gulp.dest('app/css')) // creates file.css
    .pipe(browserSync.reload({
    	stream: true
    	}))
});



// GULP WATCHERS
// watchin the files and folders defined
gulp.task('watch', ['sass', 'browserSync'], function(){
	gulp.watch('app/scss/**/*.scss', ['sass']); // scss reloads in that task
	gulp.watch('app/**/*.html').on('change', browserSync.reload); //watch html
	gulp.watch('app/js/**/*.js').on('change', browserSync.reload); //watch js
  gulp.watch('app/images/**/*').on('change', browserSync.reload); //watch img
	//add more watchers here
});



// OPTIMIZE CODE AND FILES
// useref explanation:
// Pull code across directories into single build with useref
// in html like so
// <!-- build:<type> <path> -->
//      ... HTML Markup, list of script / link tags.
// <!-- endbuild -->
gulp.task('useref', function(){
	return gulp.src('app/*.html')
	.pipe(useref())
	// minify js
	.pipe(gulpIF('*.js', uglify()))
	// minify css
	.pipe(gulpIf('*.css', cssnano()))
	.pipe(gulp.dest('dist'))
});

// optimize images
gulp.task('images', function(){
  return gulp.src('app/images/**/*.+(png|jpg|gif|svg)')
  .pipe(cache(imagemin({
  	interlaced: true
  	})))
  .pipe(gulp.dest('dist/images'))
});

// copy the fonts over to dist folder
gulp.task('fonts', function() {
  return gulp.src('app/fonts/**/*')
  .pipe(gulp.dest('dist/fonts'))
});



// CLEANING UP DIST FOLDER FOR NEW BUILD SEQUENCE
// clean files
gulp.task('clean', function() {
  return del.sync('dist').then(function(cb) {
    return cache.clearAll(cb);
  });
});

//clean images
gulp.task('clean:dist', function() {
  return del.sync(['dist/**/*', '!dist/images', '!dist/images/**/*']);
});



// START GULP WATCHERS, i.e. start working
// Build Public Dist with "$ gulp" build
// runSequence Tasks
// default just uses "$ gulp" to run
gulp.task('default', function (callback) {
  runSequence(['sass','browserSync', 'watch'],
    callback
  )
});

// uses "gulp build" command & creates production website in dist/ folder
gulp.task('build', function (callback) {
  runSequence('clean:dist', 
    ['sass', 'useref', 'images', 'fonts'],
    callback
  )
});


