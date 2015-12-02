"use strict";

module.exports = function (grunt) {
    var eachAsync = require("each-async");

    // Setup JSPM
    var jspm = require("jspm");
    jspm.setPackagePath(".");

    // Geth the JSPM baseURL from package.json
    var getBaseUrl = function () {
        var pkgJson = grunt.file.readJSON("package.json");

        if (pkgJson.jspm && pkgJson.jspm.directories && pkgJson.jspm.directories.baseURL) {
            return pkgJson.jspm.directories.baseURL;
        }

        return "";
    };

	grunt.registerMultiTask("jspm", "Bundle JSPM", function () {
        var options = this.options({
            sfx: true,
            mangle: true,
            minify: true
        });

        var bundle = options.sfx ? "bundleSFX" : "bundle";

        // JSPM will add the baseURL, which will stop things working if we don't strip it out
        var base = new RegExp("^\/?" + getBaseUrl() + "\/");

        // For each file run the bundle method
        eachAsync(this.files, function (el, i, next) {
			var src = el.src[0].replace(base, "");

            jspm.normalize(src).then(function (src) {
                if (!src) {
                    return next();
                }

                console.log("Bundling " + src + " to " + el.dest);
                jspm[bundle](src, el.dest, options).then(next, next);
            })

        }, this.async());
	});
};
