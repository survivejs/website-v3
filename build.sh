#!/usr/bin/env bash

curl -fsSL https://deno.land/x/install/install.sh | sh -s v1.42.1
/opt/buildhome/.deno/bin/deno task bootstrap
/opt/buildhome/.deno/bin/deno task build
