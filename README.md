<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <h1 align="center">Content-Based broker</h1>

## Description

An open-source content-based broker for delivering messages through subscriptions.

## Installation

Install docker configuration (for the local MongoDB backend only):

```bash
$ docker compose up -d
```

Install packages:

```bash
$ yarn install
```

Upgrade packages:

```bash
$ yarn upgrade
```

## Running the broker

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Running all the tests

```bash
$ yarn test:e2e
```

## Check the endpoints (swagger)

1. Run the correlator
2. Go to http://localhost:3001/api

## Check documentation (compodoc)

```bash
# run compodoc
$ npx @compodoc/compodoc -p tsconfig.json -s
```

Then go to the served webpage indicated in terminal.
