var gulp = require('gulp');
var tsc  = require('gulp-typescript-compiler');
var concat = require('gulp-concat');

var paths = {
	tscripts : ['scripts/typescript/**/*.ts']
};

gulp.task('tsc', function () {
	return gulp
	.src(paths.tscripts)
	.pipe(tsc({
		resolve: true,
		logErrors : true,
		sourcemap : false
	}))
	.pipe(concat('index.js'))
	.pipe(gulp.dest('scripts/js'));
});

gulp.task('watch', function () {
	gulp.watch(paths.tscripts, ['tsc']);
});

gulp.task('default', ['tsc']);
