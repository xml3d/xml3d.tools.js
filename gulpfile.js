var gulp = require("gulp");
var concat = require('gulp-concat');
var del = require('del');
var uglify = require('gulp-uglify');
var pkg = require("./package.json");

var srcFiles = [
		"./src/**/*.js"
	];

var destination = "./build";

gulp.task("default", function(){
	var outputName = "xml3d.tools." + pkg.version + ".js";

	gulp.src(srcFiles)
			.pipe(concat(outputName))
			.pipe(gulp.dest(destination));
});

gulp.task("release", function(){
	var outputName = "xml3d.tools." + pkg.version + ".min.js";

	gulp.src(srcFiles)
			.pipe(concat(outputName))
			.pipe(uglify())
			.pipe(gulp.dest(destination));
});

gulp.task('clean', function(cb) {
  // You can use multiple globbing patterns as you would with `gulp.src`
  del(['build/*'], cb);
});
