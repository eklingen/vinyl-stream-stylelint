
// Vinyl-stream utility -aka Gulp plugin- for expanding globs in file contents.
// This easily enables globbing support to any file format in the stream.
//
// The only restriction is that there needs to be an identifying keyword,
// before a quoted (single, double or backtick) string.
//
// You can change the keyword list or the quote list in the options.
//
// Usage: stream.pipe(unglob())
//
// This depends on the "glob" package. But if you're working with streams,
// there's a pretty good chance you've already got it.

module.exports = require('./src/unglob')
