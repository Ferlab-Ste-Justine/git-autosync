const R = require('ramda');

const reposListingEntry = {
    path: R.lensProp('path'),
    repo: R.lensProp('repo'),
    branch: R.lensProp('branch'),
}

const cmd = {
    cmd: R.lensProp('cmd'),
    stdout: R.lensProp('stdout'),
    stderr: R.lensProp('stderr'),
    create: R.curry((cmdStr, stdout, stderr) => {
        return R.compose(
            R.set(cmd.cmd, cmdStr),
            R.set(cmd.stderr, stderr),
            R.set(cmd.stdout, stdout)  
        )({});
    })
}

const repoProcessing = {
    cmds: R.lensProp('cmds'),
    reposListingEntry: R.lensProp('entry'),
    addCmd: R.curry((cmdInst, self) => {
        return R.over(repoProcessing.cmds, R.append(cmdInst), self)
    }),
    create: (reposListingEntryInst) => {
        return R.compose(
            R.set(repoProcessing.cmds, []),
            R.set(repoProcessing.reposListingEntry, reposListingEntryInst)
        )({});
    }
}

module.exports = {
    reposListingEntry,
    cmd,
    repoProcessing
}