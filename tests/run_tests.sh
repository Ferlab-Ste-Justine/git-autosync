#!/bin/bash

mkdir ssh-key;
(
    cd ssh-key;
    ssh-keygen -q -P "" -t rsa -f $(pwd)/id_rsa -C "root@root.com";
    cp id_rsa.pub authorized_keys;
)

docker-compose build;
docker-compose up -d git_server;
sleep 2;
docker-compose run test_setup;
docker-compose up -d sync;
sleep 2;
docker-compose run test;
docker-compose down -v;
