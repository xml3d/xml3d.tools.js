var gulp = require("gulp");
var concat = require('gulp-concat');
var del = require('del');

var srcFiles = [
		"./src/animation/*.js",
		"./src/base/*.js",
		"./src/camera/*.js",
		"./src/constraint/*.js",
		"./src/contrib/*.js",
		"./src/input/*.js",
		"./src/interaction/behaviors/*.js",
		"./src/interaction/geometry/*.js",
		"./src/interaction/widgets/*.js",
		"./src/interaction/*.js",
		"./src/util/*.js",
		"./src/xml3doverlay/*.js",
		"./src/*.js"
	];

gulp.task("default", function(){
	var outputName = "xml3d.tools.js";
	var destination = "./build";

	gulp.src(srcFiles)
			.pipe(concat(outputName))
			.pipe(gulp.dest(destination));
});

gulp.task('clean', function(cb) {
  // You can use multiple globbing patterns as you would with `gulp.src`
  del(['build/*'], cb);
});
