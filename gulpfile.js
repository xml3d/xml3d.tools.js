var gulp = require("gulp");

var srcFiles = [
		"./LICENSE",
		"./src/*.js"
	];

gulp.task("default", function(){
	var outputName = "xml3d.tools.js";
	var destination = "./build";

	gulp.src(srcFiles)
			.pipe(concat(outputName))
			.pipe(gulp.dest(destination));
});

