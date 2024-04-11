#!/usr/bin/env bash

curl -fsSL https://deno.land/x/install/install.sh | sh -s v1.42.1

export DENO_INSTALL="/opt/buildhome/.deno"
export PATH="$DENO_INSTALL/bin:$PATH"

deno task bootstrap
deno task build
