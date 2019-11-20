
# Small vinyl-stream wrapper -aka Gulp plugin- for stylelint

Run stylelint within your streams. Supports automatic fixing of files. Also has a fast method for more speed, and a slow method for more control.

> *NOTE:* No tests have been written yet!

## Installation

`yarn install`. Or `npm install`. Or just copy the files to your own project.

## Usage

```
const stylelintWrapper = require('@eklingen/vinyl-stream-stylelint')
stream.pipe(stylelintWrapper())
```

This package assumes a configuration dotfile where stylelint can find it.

## Options

You have the following options:

### `failAfterError`

This will determine wether to fail or not. Useful in a pre-commit hook, for example.

```
stylelintWrapper({
  failAfterError: true
})
```

### `stylelint`

These options are passed verbatim to Stylelint. See the ["stylelint"](https://www.npmjs.com/packages/stylelint) documentation for more details.

```
stylelintWrapper({
  stylelint: {
    config: {},
    configBaseDir: process.cwd(),
    cache: true,
    cacheLocation: join(process.cwd(), 'node_modules/.cache/stylelint/'),
    fix: false,
    syntax: 'scss',
    formatter: 'string',
    files: null
  }
})
```

## Fast method vs Slow method

This plugin offers two different methods of running stylelint.

### Fast method

When you pass a `files` glob, any files in the stream are ignored (you can set your stream src to `read: false`). You can set `fix: true` to have stylelint apply fixes directly to the source files on disk. This is mainly useful to simply lint everything and output the results.

```
stylelintWrapper({
  files: 'src/scripts/**/*.js',
  fix: true
})
```

> *WARNING*: Autofixing is slightly flakey. It might take two or three passes to fix everything in a file.

### Slow method

When you pass files through the stream (don't pass a `files` options), it will then remove those files from the stream. If you set `fix: true` any fixes are applied, and these fixed files are pushed back into the stream. This is mainly useful to lint individual files, like in a watch callback.

```
stylelintWrapper({
  fix: true
})
```

## Dependencies

This package requires ["stylelint"](https://www.npmjs.com/package/stylelint).

---

Copyright (c) 2019 Elco Klingen. MIT License.
