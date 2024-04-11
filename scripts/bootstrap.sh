#!/usr/bin/env bash

set -e # Exit with nonzero exit code if anything fails

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Fetch books repositories
echo
echo "Fetching books repositories..."
deno task fetch:book-repositories

# Fetch image references
echo
echo "Fetching image references..."
deno task fetch:image-references

# TODO: Not needed right now
# Build each project (it is needed to build the site)
# echo
# echo "Building projects..."
# cd books/react-book/project_source
# npm install
# node build_all.js
# cd -

echo
echo "Done!"
