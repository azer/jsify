## jsify

Convert text files into requireable JavaScript modules

## Install

```bash
$ npm install jsify
```

## Usage

Single file:

 ```bash
$ jsify templates/foo.html -o lib/templates/foo.js
```

```js
require('./templates/foo')
// => "<html>this is foo.html</html>"
```

Multiple files:

```bash
$ jsify templates/**/*.html -o lib/templates.js
```

```js
templates = require('./templates')

templates.foo
// => "<html>this is foo.html</html>"

templates.bar
// => "<html>this is foo.html</html>"

templates['eggs/qux']
// => "<html>this is eggs/qux.html</html>"

templates['eggs/corge']
// => "<html>this is eggs/corge.html</html>"
```

![](https://dl.dropboxusercontent.com/s/s6npnnexhy4c1ew/npmel_13.jpg)
