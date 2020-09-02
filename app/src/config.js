const { of, from } = require('rxjs');
const { mergeMap } = require('rxjs/operators');

const { ensureFileExists$, readFile$ } = require('./file')

const getReposListing$ = (listingPath) => {
    return of(listingPath)
        .pipe(mergeMap(ensureFileExists$))
        .pipe(mergeMap(readFile$(JSON.parse)))
        .pipe(mergeMap(from))
}

module.exports = { getReposListing$ }