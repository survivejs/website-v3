#!/usr/bin/env bash

set -e # Exit with nonzero exit code if anything fails

curl -fsSL https://deno.land/x/install/install.sh | sh -s v1.42.1

export DENO_INSTALL="/opt/buildhome/.deno"
export PATH="$DENO_INSTALL/bin:$PATH"

echo $CF_PAGES_COMMIT_SHA

deno task bootstrap
deno task build
