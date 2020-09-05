const { exec } = require('child_process')

const { Observable } = require('rxjs')

const R = require('ramda')

const {
  reposListingEntry,
  cmd,
  repoProcessing
} = require('./structures')

const {
  ifPathNotExists$
} = require('./file')

const runCmd$ = R.curry((cmdStr, workdir, repoProcessingInst) => {
  return new Observable(function (observer) {
    exec(cmdStr, { cwd: workdir }, (err, stdout, stderr) => {
      if (err) {
        return observer.error(err.message)
      }
      observer.next(
        repoProcessing.addCmd(cmd.create(cmdStr, stdout, stderr), repoProcessingInst)
      )
      observer.complete()
    })
  })
})

const clone$ = (repoProcessingInst) => {
  const repository = R.compose(
    R.view(reposListingEntry.repo),
    R.view(repoProcessing.reposListingEntry)
  )(repoProcessingInst)
  const path = R.compose(
    R.view(reposListingEntry.path),
    R.view(repoProcessing.reposListingEntry)
  )(repoProcessingInst)
  const cmdStr = `git clone ${repository} ${path}`
  return ifPathNotExists$(`${path}/.git`, runCmd$(cmdStr, null), repoProcessingInst)
}

const stash$ = (repoProcessingInst) => {
  const path = R.compose(
    R.view(reposListingEntry.path),
    R.view(repoProcessing.reposListingEntry)
  )(repoProcessingInst)
  const cmdStr = 'git stash'
  return runCmd$(cmdStr, path, repoProcessingInst)
}

const checkout$ = (repoProcessingInst) => {
  const path = R.compose(
    R.view(reposListingEntry.path),
    R.view(repoProcessing.reposListingEntry)
  )(repoProcessingInst)
  const branch = R.compose(
    R.view(reposListingEntry.branch),
    R.view(repoProcessing.reposListingEntry)
  )(repoProcessingInst)
  const cmdStr = `git checkout ${branch}`
  return runCmd$(cmdStr, path, repoProcessingInst)
}

const pull$ = (repoProcessingInst) => {
  const path = R.compose(
    R.view(reposListingEntry.path),
    R.view(repoProcessing.reposListingEntry)
  )(repoProcessingInst)
  const branch = R.compose(
    R.view(reposListingEntry.branch),
    R.view(repoProcessing.reposListingEntry)
  )(repoProcessingInst)
  const cmdStr = `git pull origin ${branch}`
  return runCmd$(cmdStr, path, repoProcessingInst)
}

module.exports = {
  clone$,
  stash$,
  checkout$,
  pull$
}
