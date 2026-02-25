#!/bin/bash

mkdir -p /var/log/universe
docker stop xstarnet.universe
docker rm -f xstarnet.universe
docker run \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -v /etc/universe/.env:/etc/universe/.env \
  -v /var/log/universe:/logs \
  -v /var/www:/var/www \
  --name xstarnet.universe \
  --network host \
  --restart always \
  -d xstarnet.universe
