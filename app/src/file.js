const fs = require('fs')
const { Observable } = require('rxjs')
const R = require('ramda')

const ensureFileExists$ = (path) => {
  return new Observable(function (observer) {
    fs.stat(path, (err, stats) => {
      if (err) {
        observer.error(err)
      }
      if (!stats.isFile()) {
        observer.error(`${path} is not a file`)
      }
      observer.next(path)
      observer.complete()
    })
  })
}

const readFile$ = R.curry((parser, path) => {
  return new Observable(function (observer) {
    fs.readFile(path, 'utf8', (err, content) => {
      if (err) {
        observer.error(err)
      }
      try {
        observer.next(parser(content))
        observer.complete()
      } catch (err) {
        observer.error(`${path} is not parsable`)
      }
    })
  })
})

const ifPathNotExists$ = R.curry((path, runIfNotExist$, input) => {
  return new Observable(function (observer) {
    fs.access(path, fs.constants.R_OK, (err) => {
      if (err) {
        runIfNotExist$(input).subscribe(
          observer.next.bind(observer),
          observer.error.bind(observer),
          observer.complete.bind(observer)
        )
      } else {
        observer.next(input)
        observer.complete()
      }
    })
  })
})

module.exports = { ensureFileExists$, readFile$, ifPathNotExists$ }
