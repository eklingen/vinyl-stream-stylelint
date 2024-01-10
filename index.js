// Small vinyl-stream wrapper -aka Gulp plugin- for stylelint.
// Supports autofixing of files.
//
// Fast option:
//   Pass a `files` glob string.
//   Files in the stream are ignored. You can set your stream src to `{ read: false }`.
//   If you set `options.stylelint.fix: true` then fixes are applied to source files directly on disk.
//   Cache is not used.
// Slow option:
//   Pass files through the stream (not a `files` string).
//   Files are removed from the stream.
//   Files with fixes (if any) are pushed back into the stream.
//   Use this if you need more control, or need to do extra pre- or post- processing of files.
//   Cache is used.

const { join } = require('path')
const { Transform } = require('stream')

const DEFAULT_OPTIONS = {
  failAfterError: false,
  stylelint: {
    config: {},
    configBaseDir: process.cwd(),
    cache: true,
    cacheLocation: join(process.cwd(), 'node_modules/.cache/stylelint/'),
    fix: false,
    formatter: 'string',
    files: null,
  },
}

function outputFormatter(output = '') {
  output = output.toString().trim()
  return output ? `\n${output.replace('\n\n\n', '\n\n')}\n` : ''
}

function stylelintWrapper(options = {}) {
  options = { ...DEFAULT_OPTIONS, ...options }
  options.stylelint = { ...DEFAULT_OPTIONS.stylelint, ...options.stylelint }

  if (options.stylelint.files) {
    return stylelintGlobWrapper(options)
  }

  return stylelintVinylWrapper(options)
}

function stylelintGlobWrapper(options = {}) {
  const stylelint = require('stylelint')

  function transform(file, encoding, callback) {
    return callback(null, file) // Any files in the stream are ignored
  }

  async function flush(callback) {
    let result

    try {
      result = await stylelint.lint({ ...options.stylelint })
    } catch (error) {
      return callback(error)
    }

    const report = outputFormatter(result.report)

    if (result.errored && options.failAfterError) {
      return callback(new Error(report))
    }

    if (report) {
      console.log(report)
    }

    return callback()
  }

  return new Transform({
    transform,
    flush,
    readableObjectMode: true,
    writableObjectMode: true,
  })
}

function stylelintVinylWrapper(options = {}) {
  const stylelint = require('stylelint')

  const reports = []

  async function transform(file, encoding, callback) {
    if (!file.isBuffer() || !file.contents || !file.contents.length) {
      return
    }

    let result
    const contents = file.contents.toString('utf8')

    try {
      result = await stylelint.lint({
        ...options.stylelint,
        files: null,
        code: contents,
        codeFilename: file.path,
      })
    } catch (error) {
      return callback(error)
    }

    if (result.errored) {
      reports.push(result.report)
    } else {
      if (options.stylelint.fix && result.code && result.code !== contents) {
        file.contents = Buffer.from(result.code)
        return callback(null, file)
      }
    }

    return callback()
  }

  async function flush(callback) {
    const report = reports.join('\n')

    if (report && options.failAfterError) {
      return callback(new Error(report))
    }

    if (report) {
      console.log(report)
    }

    return callback()
  }

  return new Transform({
    transform,
    flush,
    readableObjectMode: true,
    writableObjectMode: true,
  })
}

module.exports = stylelintWrapper
