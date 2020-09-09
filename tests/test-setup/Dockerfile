FROM ubuntu:20.04

RUN apt-get update && apt-get install -y git-core
RUN useradd git
RUN mkdir -p /home/git && chown -R git:git /home/git

COPY entrypoint.sh /opt/entrypoint.sh
USER git
ENTRYPOINT ["/opt/entrypoint.sh"]