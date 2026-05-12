#!/bin/bash
DOCKER_GID=$(stat -f '%g' /var/run/docker.sock) docker compose up --build -d
