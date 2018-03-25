var gulp = require ('gulp');
var babel = require ('gulp-babel');

// var src_paths = [
//         'src/app.js',
//         'src/routes/routes.js',
//     ];


gulp.task('babel',function(){
	console.log('launch of babel task');
	return gulp.src('src/app.js')
	.pipe(babel({
		presets:['es2015']
	}))
	.pipe(gulp.dest('dist'))
});