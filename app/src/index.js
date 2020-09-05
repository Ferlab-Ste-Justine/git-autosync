const { interval } = require('rxjs')
const { exhaust, map, mergeMap } = require('rxjs/operators')
const R = require('ramda')

const { getReposListing$ } = require('./config')
const { repoProcessing } = require('./structures')
const {
  clone$,
  stash$,
  checkout$,
  pull$
} = require('./git')

const scrapeInterval = parseInt(process.env.SCRAPE_INTERVAL)
const listingPath = process.env.LISTING_PATH

const processRepos$ = (listingPath) => {
  return getReposListing$(listingPath)
    .pipe(map(repoProcessing.create))
    .pipe(mergeMap(clone$))
    .pipe(mergeMap(stash$))
    .pipe(mergeMap(checkout$))
    .pipe(mergeMap(pull$))
}

const processReposRecurring$ = (listingPath, scrapeInterval) => {
  return interval(scrapeInterval)
    .pipe(map(() => processRepos$(listingPath)))
    .pipe(exhaust())
}

function handleRepoProcessing (repoProcessingInst) {
  R.compose(
    R.forEach(console.log),
    R.view(repoProcessing.cmds)
  )(repoProcessingInst)
}

function handleError (err) {
  console.log(err)
  process.exit(1)
}

processReposRecurring$(listingPath, scrapeInterval)
  .subscribe(
    handleRepoProcessing,
    handleError,
    () => {}
  )
