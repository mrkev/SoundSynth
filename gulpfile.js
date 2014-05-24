var gulp = require('gulp');
var tsc  = require('gulp-typescript-compiler');
var concat = require('gulp-concat');

gulp.task('tsc', function () {
	return gulp
	.src('scripts/typescript/**/*.ts')
	.pipe(tsc({
		resolve: true,
		logErrors : true,
		sourcemap : false
	}))
	.pipe(concat('index.js'))
	.pipe(gulp.dest('scripts/js'));
});

gulp.task('default', ['tsc']);