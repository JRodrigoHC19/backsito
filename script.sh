#!/bin/bash

git clone https://github.com/JRodrigoHC19/backsito.git

cd backsito

docker-compose up -d

echo "Backsito is running on port 3000"