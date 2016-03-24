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
            minify: true,
            inject: false
        });

        var bundle = options.sfx ? "bundleSFX" : "bundle";

        // JSPM will add the baseURL, which will stop things working if we don't strip it out
        var base = new RegExp("^\/?" + getBaseUrl() + "\/");
        // For each file run the bundle method
        eachAsync(this.files, function (file, i, next) {
            var moduleExpression = !file.src.length ? file.orig.src[0].replace(/\.js/, "") : file.src[0].replace(base, "");
            console.log("Bundling " + moduleExpression + " to " + file.dest);
            jspm[bundle](moduleExpression, file.dest, options).then(next, next);

        }, this.async());
    });
};
