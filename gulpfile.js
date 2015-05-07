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
var os = require('os');

var isWindows = /^win/.test(os.platform());

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
			.pipe(replace(buildInCodeLicenseHeader(), ""))
			.pipe(version(versionConfig))
			.pipe(header(buildLicenseHeader(), {version: versionString}))
			.pipe(gulp.dest(destination));
});

var buildInCodeLicenseHeader = function(){
	var header = "/*" + getSystemLineBreak()
			+ fileSystem.readFileSync("LICENSE")
			+ "*/" + getSystemLineBreak();
	return header;
};

var getSystemLineBreak = function(){
	if (isWindows) {
		return "\r\n";
	} else {
		return "\n";
	}
};

var buildLicenseHeader = function(){
	var header = "/*" + getSystemLineBreak()
			+ fileSystem.readFileSync("LICENSE") + getSystemLineBreak()
			+ "Version: <%= version %>" + getSystemLineBreak()
			+ "Full source at https://github.com/xml3d/xml3d.tools.js" + getSystemLineBreak()
			+ "*/" + getSystemLineBreak() + getSystemLineBreak();
	return header;
};

gulp.task("release", function(){
	var versionString = pkg.version;
	var outputName = "xml3d.tools." + versionString + ".js";
	var versionConfig = {
		"value" : versionString,
		"replaces" : ["%VERSION%"]
	};

	gulp.src(srcFiles)
			.pipe(concat(outputName))
			.pipe(replace(buildInCodeLicenseHeader(), ""))
			.pipe(version(versionConfig))
			.pipe(header(buildLicenseHeader(), {version: versionString}))
			.pipe(gulp.dest(destination))
			.pipe(uglify())
			.pipe(rename({extname: ".min.js"}))
			.pipe(gulp.dest(destination));
});

gulp.task('clean', function(cb) {
  // You can use multiple globbing patterns as you would with `gulp.src`
  del(['build/*'], cb);
});

