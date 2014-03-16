var gulp = require('gulp'),
	gutil = require('gulp-util'),
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
	minifycss = require('gulp-minify-css'),
	notify = require('gulp-notify'),
	autoprefixer = require('gulp-autoprefixer'),
	sass = require('gulp-ruby-sass'),
	_if = require('gulp-if'),
	isWindows = /^win/.test(require('os').platform()),
	lr,
	EXPRESS_PORT = 1234,
	EXPRESS_ROOT = __dirname,
	LIVERELOAD_PORT = 35729;

gutil.log('Is it Windows? ' + isWindows);


function startExpress(){
	var express = require('express');
	var app = express();
	app.use(require('connect-livereload')());
	app.use(express.static(EXPRESS_ROOT));
	app.listen(EXPRESS_PORT);
	gutil.log(gutil.colors.cyan('Express is listening on port ' + EXPRESS_PORT));
}


function startLiveReload(){
	lr = require('tiny-lr')();
	lr.listen(LIVERELOAD_PORT);
}

function notifyLiveReload(event){
	var fileName = require('path').relative(EXPRESS_ROOT, event.path);
	lr.changed({
		body: {
			files: [fileName]
		}
	});
}

function jsUglify(uglify, concat, gutil){
	gutil.log(gutil.colors.bgBlue('Uglifying your JavaScript!'));
	return gulp.src('js/main.js')
			.pipe(uglify({ mangle: true, compress: true}))
			.pipe(concat('main.min.js'))
			.pipe(gulp.dest(EXPRESS_ROOT+'/js/min/'));
}


function reload(sass, autoprefixer, notify){
	return gulp.src('sass/styles.scss')
				.pipe(sass({style: 'expanded'}))
				.pipe(autoprefixer('last 15 versions'))
				.pipe(gulp.dest('css'))
				.pipe(_if(!isWindows, notify({ message: 'Reload Complete'})));
}

gulp.task('default', function(){
	startExpress();
	startLiveReload();
	jsUglify(uglify, concat,gutil);
	reload(sass,autoprefixer, notify);

	gulp.watch('*.html', notifyLiveReload);
	gulp.watch('**/*.html', notifyLiveReload);
	gulp.watch('css/*.css', notifyLiveReload);
	gulp.watch('js/*.js', notifyLiveReload);
	
	gulp.watch('js/*.js', function(){
		return jsUglify(uglify, concat, gutil);
	});
	gulp.watch('sass/**/*.scss', function(){
		return reload(sass,autoprefixer, notify);
	});
});
