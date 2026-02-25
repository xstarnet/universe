#!/bin/bash
RUN_NAME=xstarnet.universe

mkdir -p output/bin
cp script/* output/
chmod +x output/bootstrap.sh
chmod +x output/docker.sh

if [ "$IS_SYSTEM_TEST_ENV" != "1" ]; then
  go env -w CGO_ENABLED=0
  go build -o output/bin/${RUN_NAME} -buildvcs=false
  echo "build ${RUN_NAME} success"
  if [ -x "$(command -v docker)" ]; then
    echo "build docker image"
    cp ~/.aliyun/config.json output/aliyun-config.json
    docker build -t xstarnet.universe .
    echo "build docker image success"
  fi
else
  go test -c -covermode=set -o output/bin/${RUN_NAME} -coverpkg=./...
fi