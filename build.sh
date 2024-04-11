#!/usr/bin/env bash

curl -fsSL https://deno.land/x/install/install.sh | sh -s v1.42.1

ln -s /opt/buildhome/.deno/bin/deno deno

deno task bootstrap
deno task build
