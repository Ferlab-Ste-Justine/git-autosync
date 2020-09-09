#!/bin/bash

for REPO in "$@"
do
    mkdir /home/git/${REPO}.git;
    (cd /home/git/${REPO}.git; git init --bare)
    chown -R git:git /home/git/${REPO}.git;
done

chown -R git:git /home/git/.ssh;

/usr/sbin/sshd -D;