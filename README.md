<div align="center">

  <h1 align="center">LaTeCH</h1>

  <p align="center">
    Collaborative LaTeX editor
  </p>

[![Continuous Integration Build](https://github.com/RomanL1/latech/actions/workflows/continuous_integration.yml/badge.svg)](https://github.com/RomanL1/latech/actions/workflows/continuous_integration.yml)

</div>

## Table of Contents

- [About the project](#about-the-project)
- [Installation](#installation)
- [Contributing](#contributing)
- [License](#license)

## About the project

LaTeCH is a web-based LaTeX editor which allows multiple users to collaborate on documents in real time.

Learn more about

- [Architecture](./docs/architecture/architecture.md)
- [Requirement](./docs/requirements.md)

## Installation

See installation and setup instructions for the following components:

- [Frontend](./src/frontend/README.md)

## Building and running docker image (DigitalOcean)

DOCKER_DEFAULT_PLATFORM=linux/amd64 docker compose build
docker save -o latech_complete.tar latech-frontend:latest latech-socket-server:latest latech-api:latest latech-renderer:latest
scp -i ~/.ssh/id_digitalocean latech_complete.tar compose.prod.yml root@46.101.106.129:/root
docker load -i latech_complete.tar
docker compose -f compose.prod.yml up -d
docker compose -f compose.prod.yml down

## Contributing

See our [Git Guidelines](./docs/guidelines/git_guidelines.md) for how to contribute to this project.

## License

This project is [MIT](https://github.com/RomanL1/latech/blob/main/LICENSE) licensed.<br>
You are free to use, modify, and distribute this software, provided that the original copyright and license notice are included.
