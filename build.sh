#!/usr/bin/env bash

set -e # Exit with nonzero exit code if anything fails

npm install
npm run bootstrap
npm run build
