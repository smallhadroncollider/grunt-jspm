# grunt-jspm

## Install

```
$ npm install --save-dev grunt-jspm
```

## Usage

```js
grunt.initConfig({
    // ...
	jspm: {
        // Build a single monolithic bundle 
        // including all 3rd party libraries
		singleModuleExample: {
            options: {
                sfx: true,
                minify: true,
                mangle: true
            },
            dist: {
                files: {
                    "build/js/app.js": "src/app.js"
                }
            }
		},
		
		// Extract all 3rd party libraries 
		// from your project and place them 
		// in a seperate bundle.
        thirdPartyDependencies: {
            options: {
                sfx: false,
                minify: true,
                sourceMaps: false,
                inject: true, // important!
                mangle: true
            },

            files: {
                "build/js/libs/core-libs.js": "js/app - [src/**/*]"
            }
        },
                
		// Build your project excluding the
		// specified bundles or source trees
		arithmeticExample: {
            options: {
                sfx: false,
                minify: true,
                mangle: true,
                sourceMaps: false
            },
            files: {
                "build/js/app.js": "js/app - libs/core-libs - [js/mockData/**/*]"
            }
        },
        
        // Build the dependencies in common 
        // between 2 modules including all 
        // 3rd party libraries
        commonOption1: {
            options: {
                sfx: false,
                minify: true,
                mangle: true,
                sourceMaps: false
                inject: true, // important!
            },
            files: {
                "build/js/common.js": "js/modules/module1 & js/modules/module2"
            }
        },
        
        // Compare 2 or more bundles using arithmeic, 
        // extract their common dependencies and place
        // them in a seperate bundle and then build 
        // all the bundles.
        commonOption2: {
            // Options for bundles
            options: {
                sfx: false,
                minify: false,
                mangle: false,
                sourceMaps: true
            },
            files: {
                // Exclude core-libs from the comparison
                // since it is it's own bundle.
                "build/modules/module1": "js/modules/module1 - core-libs",
                "build/modules/module2": "js/modules/module1 - core-libs"
            },
            commonBundle: {
                // options for building the common bundle
                options: {
                    sfx: false,
                    minify: false,
                    sourceMaps: false,
                    inject: true, // important!
                    mangle: true
                },
                dest: 'build/js/common.js'
            }
        }
	}
    // ...
});
```

## Options

All available options are found on the SystemJS Builder github: https://github.com/systemjs/builder

### `sfx`

Default: `true`

Creates a single self-executing bundle for a module.


### `minify`

Default: `true`

Use minification, defaults to true.


### `mangle`

Default: `true`

Use mangling with minification, defaults to true

### `sourceMaps`

Default: `false`

include or exclude source maps in the build, defaults to false

### `More Info`

For more 

## License

MIT © [Small Hadron Collider](http://smallhadroncollider.com)
