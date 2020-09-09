#!/bin/bash

ssh-keyscan git_server > /home/git/.ssh/known_hosts;
git config --global user.email "nobody@nobody.com";
git config --global user.name "Nobody";

mkdir -p /home/git/project1;
(
    cd /home/git/project1;
    touch name;
    echo "project1" > name;
    git init;
    git add name;
    git commit -m "Project1 name";
    git remote add origin ssh://git@git_server:/home/git/project1.git;
    git push origin master;
)

mkdir -p /home/git/project2;
(
    cd /home/git/project2;
    touch name;
    echo "project2" > name;
    git init;
    git add name;
    git commit -m "Project2 name";
    git remote add origin ssh://git@git_server:/home/git/project2.git;
    git push origin master;
)