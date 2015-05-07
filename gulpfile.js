var gulp = require("gulp");
var pkg = require("./package.json");
var concat = require('gulp-concat');
var replace = require('gulp-replace');
var fileSystem = require("fs");
var version = require("gulp-version-number");
var header = require("gulp-header");
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var del = require('del');

var srcFiles = [
		"./src/**/*.js"
	];

var destination = "./build";

gulp.task("default", function(){
	var versionString = pkg.version + "-dev-snapshot";
	var outputName = "xml3d.tools." + versionString + ".js";
	var versionConfig = {
		"value" : versionString,
		"replaces" : ["%VERSION%"]
	};

	gulp.src(srcFiles)
			.pipe(concat(outputName))
			.pipe(version(versionConfig))
			.pipe(header(buildLicenseHeader(), {version: versionString}))
			.pipe(header(fileSystem.readFileSync("gulp-license-header"), {version: versionString}))
			.pipe(gulp.dest(destination));
});


var buildLicenseHeader = function(){
	var header = "/*" + "\n"
			+ fileSystem.readFileSync("LICENSE") + "\n"
			+ "Version: <%= version %>" + "\n"
			+ "Full source at https://github.com/xml3d/xml3d.tools.js" + "\n"
			+ "*/" + "\n" + "\n";
	return header;
};

gulp.task("release", function(){
	var versionString = pkg.version;
	var outputName = "xml3d.tools." + versionString + ".min.js";
	var versionConfig = {
		"value" : versionString,
		"replaces" : ["%VERSION%"]
	};

	gulp.src(srcFiles)
			.pipe(concat(outputName))
			.pipe(version(versionConfig))
			.pipe(header(buildLicenseHeader(), {version: versionString}))
			.pipe(uglify())
			.pipe(header(fileSystem.readFileSync("gulp-license-header"), {version: versionString}))
			.pipe(gulp.dest(destination));
});

gulp.task('clean', function(cb) {
  // You can use multiple globbing patterns as you would with `gulp.src`
  del(['build/*'], cb);
});

