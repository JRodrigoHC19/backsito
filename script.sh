#!/bin/bash

git clone

docker build --tag srv-auth .
docker run --rm -p 3000:3000 srv-auth