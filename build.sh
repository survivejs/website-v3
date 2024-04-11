#!/usr/bin/env bash

printenv

set -e # Exit with nonzero exit code if anything fails

curl -fsSL https://deno.land/x/install/install.sh | sh -s v1.42.1

export DENO_INSTALL="/opt/buildhome/.deno"
export PATH="$DENO_INSTALL/bin:$PATH"

printenv
echo $CF_PAGES_COMMIT_SHA

deno task bootstrap
deno task build
