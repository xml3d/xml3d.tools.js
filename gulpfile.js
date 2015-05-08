var gulp = require("gulp");
var concat = require('gulp-concat');
var replace = require('gulp-replace');
var version = require("gulp-version-number");
var header = require("gulp-header");
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");

var del = require('del');
var os = require('os');
var fileSystem = require("fs");

var pkg = require("./package.json");

var isWindows = /^win/.test(os.platform());

var srcFiles = [
		"./src/**/*.js"
	];

var destination = "./build";

gulp.task("default", function(){
	var versionString = pkg.version + "-dev-snapshot";
	gulp.src(srcFiles)
			.pipe(concat(buildOutputName(versionString)))
			.pipe(replace(buildInCodeLicenseHeader(), ""))
			.pipe(version(buildVersionConfig(versionString)))
			.pipe(header(buildLicenseHeader(), {version: versionString}))
			.pipe(gulp.dest(destination));
});

var buildOutputName = function(versionString){
	return "xml3d.tools." + versionString + ".js";
};

var buildVersionConfig = function(versionString){
	return {
		"value" : versionString,
		"replaces" : ["%VERSION%"]
	};
};

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
	gulp.src(srcFiles)
			.pipe(concat(buildOutputName(versionString)))
			.pipe(replace(buildInCodeLicenseHeader(), ""))
			.pipe(version(buildVersionConfig(versionString)))
			.pipe(header(buildLicenseHeader(), {version: versionString}))
			.pipe(gulp.dest(destination))
			.pipe(uglify())
			.pipe(header(buildLicenseHeader(), {version: versionString}))
			.pipe(rename({extname: ".min.js"}))
			.pipe(gulp.dest(destination));
});

gulp.task('clean', function(cb) {
	del(['build/*'], cb);
});

