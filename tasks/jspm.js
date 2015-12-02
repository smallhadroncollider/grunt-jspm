"use strict";

var jspm = require("jspm");
var eachAsync = require("each-async");

module.exports = function (grunt) {
	grunt.registerMultiTask("jspm", "Bundle JSPM", function () {
        var pkgJson = grunt.file.readJSON("package.json");
        var baseUrl;

        if (pkgJson.jspm && pkgJson.jspm.directories && pkgJson.jspm.directories.baseURL) {
            baseUrl = pkgJson.jspm.directories.baseURL;
        } else {
            baseUrl = "";
        }

        jspm.setPackagePath(".");

        var options = this.options({
            sfx: true,
            mangle: true,
            minify: true
        }),

        base = new RegExp("^\/?" + baseUrl + "\/");

        eachAsync(this.files, function (el, i, next) {
			var src = el.src[0].replace(base, "");

            var mySystem = new jspm.Loader();

            mySystem.normalize(src).then(function (src) {
                if (!src) {
                    next();
                    return;
                }

                console.log("- Bundling " + src + " to " + el.dest);

                if (options.sfx) {
                    jspm.bundleSFX(src, el.dest, options).then(next, next);
                } else {
                    jspm.bundle(src, el.dest, options).then(next, next);
                }
            })

        }, this.async());
	});
};
