#!/usr/bin/env bash

set -e # Exit with nonzero exit code if anything fails

curl -fsSL https://deno.land/x/install/install.sh | sh -s v1.42.1

# Trick Cloudflare into caching Deno dependencies by leveraging a convention
# https://developers.cloudflare.com/pages/configuration/build-caching/#frameworks
export DENO_DIR="/opt/buildhome/.cache"

export DENO_INSTALL="/opt/buildhome/.deno"
export PATH="$DENO_INSTALL/bin:$PATH"

deno task bootstrap
deno task build
