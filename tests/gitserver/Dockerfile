FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y git-core openssh-server
RUN useradd git
RUN mkdir -p /home/git && chown -R git:git /home/git
RUN mkdir /run/sshd

COPY entrypoint.sh /opt/entrypoint.sh
ENTRYPOINT ["/opt/entrypoint.sh"]