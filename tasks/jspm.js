"use strict";

module.exports = function (grunt) {
    var eachAsync = require("each-async");
    var config = require("jspm/lib/config");

    // Setup JSPM
    var jspm = require("jspm");
    jspm.setPackagePath(".");

    // SystemJS Builder
    const builder = new jspm.Builder();

    // Geth the JSPM baseURL from package.json
    const getBaseUrl = () => {
        var pkgJson = grunt.file.readJSON("package.json");

        if (pkgJson.jspm && pkgJson.jspm.directories && pkgJson.jspm.directories.baseURL) {
            return pkgJson.jspm.directories.baseURL;
        }

        return "";
    };

    const traceModulesFromFiles = function () {
        let files = this.files;
        grunt.log.writeln(grunt.log.wordlist(['Tracing expressions:'], {color: 'blue'}));
        const thenables = [];
        files.forEach(function (file, index) {
            const expression = file.orig.src[0].replace(/\.js/, "");
            thenables.push(builder.trace(expression).then(tree => {
                grunt.log.write(expression + '...');
                grunt.log.ok();
                return tree;

            }, grunt.fail.warn));
        });
        return Promise.all(thenables);
    };

    const bundleCommonFromTraces = function (traces) {
        grunt.log.writeln(grunt.log.wordlist(['Bundling:'], {color: 'blue'}));
        const self = this;
        const files = self.files;
        const commonBundle = self.data.commonBundle;
        const warn = traces.length < 2;
        let commonTree;
        try {
            commonTree = warn ? traces[0] : builder.intersectTrees.apply(builder, traces);
        }
        catch (error) {
            grunt.log.write(error);
        }
        const options = self.options({
            sfx: true,
            mangle: true,
            minify: true
        });

        const bundles = [];
        if (warn) {
            const msg = grunt.log.wordlist(['Notice: ' + commonBundle.dest + ' will not be written since only 1 bundle was provided'], {color: 'yellow'})
            grunt.log.writeln(msg);
            bundles[0] = bundleTree(commonTree, files[0].dest, options);
        }
        else {
            // Common bundle
            bundles[0] = bundleTree(commonTree, commonBundle.dest, commonBundle.options);
            // all others
            traces.forEach((trace, index) => {
                const subtractedTree = builder.subtractTrees(trace, commonTree);
                const file = files[index];
                const bundle = bundleTree(subtractedTree, file.dest, options);
                bundles.push(bundle);
            });
        }
        return Promise.all(bundles);
    };

    const bundleTree = (tree, dest, options) => {
        return builder.bundle(tree, dest, options).then(bundle => {
            grunt.log.write(dest + '...');
            grunt.log.ok();

            if (options.inject) {
                if (!config.loader.bundles) {
                    config.loader.bundles = {};
                }
                config.loader.bundles[dest] = bundle.modules;
            }
            return bundle;
        }, grunt.fail.warn);
    }

    grunt.registerMultiTask("jspm", "Bundle JSPM", function () {
        const self = this;
        const options = self.options({
            sfx: true,
            mangle: true,
            minify: true
        });
        const data = self.data;

        const bundle = options.sfx ? "bundleSFX" : "bundle";
        const buildCommon = !!data.commonBundle;

        if (buildCommon) {
            const done = self.async();
            if (bundle === 'bundleSFX') {
                grunt.fail.warn('bundleSFX is not supported when creating a common bundle.');
            }
            grunt.log.writeln(grunt.log.wordlist(['Building common bundle...'], {color: 'green'}));

            config.load()
                .then(traceModulesFromFiles.bind(self))
                .then(bundleCommonFromTraces.bind(self))
                .then(config.save)
                .then(done);
        }
        else {
            // JSPM will add the baseURL, which will stop things working if we don't strip it out
            const base = new RegExp("^\/?" + getBaseUrl() + "\/");
            // For each file run the bundle method
            eachAsync(self.files, (file, i, next) => {
                var moduleExpression = !file.src.length ? file.orig.src[0].replace(/\.js/, "") : file.src[0].replace(base, "");
                grunt.log.writeln("Bundling " + moduleExpression + " to " + file.dest);
                jspm[bundle](moduleExpression, file.dest, options).then(next, next);

            }, self.async());
        }
    });
};
