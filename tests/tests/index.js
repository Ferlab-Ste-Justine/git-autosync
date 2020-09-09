const assert = require('assert')
const fs = require('fs')
const { exec } = require('child_process')
const { Observable, of } = require('rxjs')
const { map, retryWhen, delay, mergeMap, scan, tap } = require('rxjs/operators')
const R = require('ramda')

const ensureFileExists$ = (path) => {
  return new Observable(function (observer) {
    fs.stat(path, (err, stats) => {
      if (err) {
        return observer.error(err)
      }
      if (!stats.isFile()) {
        return observer.error(`${path} is not a file`)
      }
      observer.next(path)
      observer.complete()
    })
    return () => {}
  })
}
  
const readFile$ = R.curry((parser, path) => {
  return new Observable(function (observer) {
    fs.readFile(path, 'utf8', (err, content) => {
      if (err) {
        return observer.error(err)
      }
      try {
        observer.next(parser(content))
        observer.complete()
      } catch (err) {
        observer.error(`${path} is not parsable`)
      }
    })
    return () => {}
  })
})

const runCmd$ = R.curry((cmdStr, workdir) => {
  return new Observable(function (observer) {
    exec(cmdStr, { cwd: workdir }, (err, stdout, stderr) => {
      if (err) {
        return observer.error(err.message)
      }
      observer.next(
        [cmdStr, stdout, stderr]
      )
      observer.complete()
    })
    return () => {}
  })
})

const ensureFileContains$ = R.curry((str, path, retries) => {
  return ensureFileExists$(path)
    .pipe(
      mergeMap(() => readFile$(R.identity, path)),
      map((val) => val.trim()),
      map(R.equals(str)),
      tap(assert),
      retryWhen(errors$ => errors$.pipe(
        delay(1000), 
        scan((errorCount, err) => {
          if(errorCount >= retries) {
            throw err;
          }
          return errorCount + 1;
        }, 0)
      ))
    )
})

const setupWriteRepos$ = of('')
  .pipe(
    mergeMap(() => runCmd$('git clone ssh://git@git_server:/home/git/project1.git project1', '/opt')),
    mergeMap(() => runCmd$('git clone ssh://git@git_server:/home/git/project2.git project2', '/opt')),
    mergeMap(() => runCmd$('git config --global user.email "nobody@nobody.com"', '/opt')),
    mergeMap(() => runCmd$('git config --global user.name "Nobody"', '/opt'))
  )

const writeAndPush$ = (str, repoPath) => {
  return of('')
    .pipe(
      mergeMap(() => runCmd$(`echo '${str}' > name`, repoPath)),
      mergeMap(() => runCmd$('git add name', repoPath)),
      mergeMap(() => runCmd$('git commit -m "I wrote something"', repoPath)),
      mergeMap(() => runCmd$('git push origin master', repoPath)),
    )
}

const test$ = of('')
  .pipe(
    mergeMap(() => ensureFileContains$('project1', '/opt/repos/project1/name', 20)),
    mergeMap(() => ensureFileContains$('project2', '/opt/repos/project2/name', 20)),
    mergeMap(() => setupWriteRepos$),
    mergeMap(() => writeAndPush$('change1', '/opt/project1')),
    mergeMap(() => ensureFileContains$('change1', '/opt/repos/project1/name', 20)),
    mergeMap(() => ensureFileContains$('project2', '/opt/repos/project2/name', 20)),
    mergeMap(() => writeAndPush$('change2', '/opt/project2')),
    mergeMap(() => ensureFileContains$('change1', '/opt/repos/project1/name', 20)),
    mergeMap(() => ensureFileContains$('change2', '/opt/repos/project2/name', 20)),
  )

test$.subscribe(
    () => {},
    (err) => {
      console.log(err)
      process.exit(1)
    },
    () => {
      console.log('Tests completed successfully!')
    }
)
