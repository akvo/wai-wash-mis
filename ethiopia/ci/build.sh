#!/usr/bin/env bash

set -eu

docker run \
       --rm \
       --volume "$(pwd):/home/tcakvo/public_html/wai-mis" \
       --workdir /home/tcakvo/public_html/wai-mis \
       --entrypoint /bin/sh \
       composer:2.0.7 -c 'composer install'

docker run \
       --rm \
       --volume "$(pwd):/home/tcakvo/public_html/wai-mis" \
       --workdir /home/tcakvo/public_html/wai-mis \
       --entrypoint /bin/sh \
       composer:2.0.7 -c 'composer dump-autoload'

echo 'MIX_PUBLIC_URL="https://wai-mis.tc.akvo.org"' > .env

docker run \
       --rm \
       --volume "$(pwd):/home/tcakvo/public_html/wai-mis" \
       --workdir "/home/tcakvo/public_html/wai-mis" \
       --entrypoint /bin/sh \
       node:14-alpine -c 'npm install && npm run prod'
