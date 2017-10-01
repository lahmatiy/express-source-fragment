[![NPM version](https://img.shields.io/npm/v/express-source-fragment.svg)](https://www.npmjs.com/package/express-source-fragment)
[![Build Status](https://travis-ci.org/lahmatiy/express-source-fragment.svg?branch=master)](https://travis-ci.org/lahmatiy/express-source-fragment)
[![Coverage Status](https://coveralls.io/repos/github/lahmatiy/express-source-fragment/badge.svg?branch=master)](https://coveralls.io/github/lahmatiy/express-source-fragment?branch=master)
[![Dependency Status](https://img.shields.io/david/lahmatiy/express-source-fragment.svg)](https://david-dm.org/lahmatiy/express-source-fragment)

Express middleware to get a file content fragment by request to defined route. Based on [source-fragment](https://github.com/lahmatiy/source-fragment).

## Install

```
npm install express-source-fragment
```

## Usage

```js
var express = require('express');
var sourceFragment = require('express-source-fragment');

var app = express();

// There are few ways to setup:
// - to trigger middleware on *GET* request to `/source-fragment`
app.get('/source-fragment', sourceFragment());

// - to trigger middleware on *any* request method to `/source-fragment`
app.use('/source-fragment', sourceFragment());

// - to trigger middleware on *any* request method to *any* path
//   (not recommended unless server's single purpose is a serving of source fragments)
app.use(sourceFragment());
```

After that you can use `GET` requests like `/source-fragment?file=foo/bar.js:2:5:4:12` to get a source fragment of `foo/bar.js` that starts on line 2 column 5 and ends on line 4 column 12.

### Using with webpack-dev-server

Although `webpack-dev-server` uses `express` to create a server, you have the same options to apply the middleware to it. The only difference is that you should define it in `setup` method (see [issue](https://github.com/webpack/webpack-dev-server/issues/285) for details).

```js
var server = new WebpackDevServer(webpack(config), {
  // ...
  setup: function(app) {
    app.use('/source-fragment', sourceFragment());
  }
});
```

## API

```
sourceFragment([options]);
```

Options:

- `cwd`

  Type: `String`  
  Default: `''` (uses `process.cwd()`)

  Working directory used when resolving paths.

## Related projects

- [source-fragment](https://github.com/lahmatiy/source-fragment) – package that do the main task of `express-source-fragment`, i.e. gets a source fragment.
- [express-open-in-editor](https://github.com/lahmatiy/express-open-in-editor) – Express middleware to open a file in an editor by request, [open-in-editor](https://github.com/lahmatiy/open-in-editor).
- [babel-plugin-source-wrapper](https://github.com/restrry/babel-plugin-source-wrapper) – `Babel` plugin that instruments source code to associate objects with location they defined in code base.
- [Component Inspector](https://github.com/lahmatiy/component-inspector) – developer tool to inspect components that can open component creation source location in editor. Has integrations for `React`, `Backbone` and can be adopter for other frameworks.

## License

MIT
