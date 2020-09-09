![](https://github.com/Ferlab-Ste-Justine/git-autosync/workflows/Build/badge.svg)
![](https://github.com/Ferlab-Ste-Justine/git-autosync/workflows/Publish%20Image%20Using%20Commit%20Hash/badge.svg)
![](https://github.com/Ferlab-Ste-Justine/git-autosync/workflows/Lint%20Check/badge.svg)

# About 

This image is used to regularly pull one or several git repos in the container's filesystem.

It is our workaround for Kubernetes **gitrepo** getting deprecated: https://kubernetes.io/docs/concepts/storage/volumes/#gitrepo

Arguably, the functionality is a bit richer here in that the content of the volume will continuously get updated with repo changes.

# Usage

## Scenarios

This image could be used in any of the following scenarios:
- Run as a sidecar container using a shared **emptyDir** volume
- Run as a centralised container, populating a shared volume
- Run as a daemonset, populating a **hostPath** volume on each worker node

There are tradeofs to each approach. 

The first is the simplest and most scalable, but incurs a runtime cost when booting pods and reduces availability as initializing some pods will be contingent on the git repo(s) being available.

The second approach doesn't consume a lot of resources and offers the best consistency across pods, but introduce scalability problems (because most volume types don't support concurrent reads across nodes and even when they do, all pods reading from it are reading from a single source).

The third approach offers decent availability and scalability, but with some caviats (number of volumes is capped to your number of nodes and newly provisioned nodes may still encounter an availability problem if the git repo is unavailable when the node is provisioned). Also, some disk space wastage will ensue if the number of worker nodes is far greater than the number of pods that need to access the volumes (although if the git repos are not too large, it should be minimal).

## Environment Variables

Pass the following environment variables:
- SCRAPE_INTERVAL: How often the repositories in the listing and polled for updates
- LISTING_PATH: Path in the container where the listing file can be found

## Repos Listing File

A repos listing file is expected to be found in the container at **LISTING_PATH**. Any change to this file will automatically be detected and will affect change in what is scrapped (subject to the limitations described below).

The listing file follows the json format and is an array of repos, each specifying the path the repo should be cloned to, the repo that should be cloned and what branch should be checked out in the repo.

See the **example** directory for the exact format.

# Limitations

The current has the following known limitations (some of which may be addressed in the future as our use-cases evolve).

## Declarativeness

The current changes are not supported for repository listing configurations:
- Removing an entry from the listing (the service will stop pulling from the repo, but the existing content of the directory will not be cleaned up)
- Changing the repository an entry in the listing points to (this one will most likely cause an error, changing the branch is fine though)

## Credentials

An explicit of passing git credentials wasn't implemented as we are currently only dealing with public repositories.

However, passing your ssh key as a secret in the **/home/node/.ssh** should work.

## Git History

If the git history of the repository branch changes in such a way that it cannot be pulled without conflicts (ex: if you rebase and then force push to the branch), the service will not resolve the conflict and will produce an error.

If you work in a team or follow the Gitops methodology, its probably not a good idea to edit the history of longer lived branches.

# Missing Bits

Parts that were skipped over in order to deliver a working solution within competitive timelines, but will have to be completed for this to be considered production ready.

## Logging

A higher quality logging tool like Winston should be used and ideally, logs should be outputted in JSON format.

## Health Checks

A health endpoint will have to be implemented.

## Pipeline

Vulnerability checks should be implemented in the pipeline.

## Metrics

A metrics endpoint to scrape metrics.