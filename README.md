# grunt-jspm

For more advanced JSPM support see: [https://github.com/justinwilaby/grunt-jspm-builder](https://github.com/justinwilaby/grunt-jspm-builder )

## Install

```
$ npm install --save-dev grunt-jspm
```

## Usage

```js
grunt.initConfig({
    // ...
	jspm: {
		options: {
			sfx: true,
            minify: true,
            mangle: true
		},
		dist: {
			files: {
				"js/app.js": "build/js/app.js"
			}
		}
	}
    // ...
});
```

## Options

### `sfx`

Default: `true`

Creates a single self-executing bundle for a module.


### `minify`

Default: `true`

Use minification, defaults to true.


### `mangle`

Default: `true`

Use mangling with minification, defaults to true


## License

MIT © [Small Hadron Collider](http://smallhadroncollider.com)
