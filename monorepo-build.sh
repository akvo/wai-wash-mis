#!/usr/bin/env bash

set -eux

COMMIT_RANGE="${SEMAPHORE_GIT_COMMIT_RANGE:=}"
COMMIT_CONTENT=$(git diff --name-only "${COMMIT_RANGE}")

# Directories one level deep
DIRS=$(echo "${COMMIT_CONTENT}" | grep ".*/.*" | cut -f 1 -d/ | sort -u)

echo "Dirs to be build: ${DIRS}"

while read -r line; do
    if [[ -f "${line}/ci/build.sh" ]]; then
        echo "Building ${line}"
        pushd "${line}"
        ./ci/build.sh
        if [[ -f "ci/deploy.sh" ]]; then
            echo "Deploying ${line}"
            ./ci/deploy.sh
        fi
        popd
    fi
done <<< "${DIRS}"
