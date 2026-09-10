<div align="center">

# Public Pool UI

**The web interface for [Public Pool](https://github.com/benjamin-wilson/public-pool) — an open source, self-hostable Bitcoin mining pool.**

Look up any address to see its workers, hash rate, best difficulty and earnings, and get the connection details for every stratum mode the pool offers.

[![Stars](https://img.shields.io/github/stars/benjamin-wilson/public-pool-ui?style=flat&color=f7931a)](https://github.com/benjamin-wilson/public-pool-ui/stargazers)
[![Forks](https://img.shields.io/github/forks/benjamin-wilson/public-pool-ui?style=flat&color=f7931a)](https://github.com/benjamin-wilson/public-pool-ui/network/members)
[![Angular](https://img.shields.io/badge/Angular-18-DD0031?logo=angular&logoColor=white)](https://angular.io)
[![PrimeNG](https://img.shields.io/badge/PrimeNG-17-007ad9)](https://primeng.org)
[![Node](https://img.shields.io/badge/node-22.16.0-339933?logo=node.js&logoColor=white)](https://nodejs.org)

### [View the live instance →](https://web.public-pool.io)

[Backend](https://github.com/benjamin-wilson/public-pool) · [Report an issue](https://github.com/benjamin-wilson/public-pool-ui/issues)

</div>

---

## Dependencies

Requires [Public-Pool](https://github.com/benjamin-wilson/public-pool) to be running

The UI is a static single-page application. It holds no state of its own and reads everything from the pool's REST API, so a running backend is required for anything beyond the landing page.

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Requirements](#requirements)
- [Development server](#development-server)
- [Build](#build)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Docker](#docker)
- [Running unit tests](#running-unit-tests)
- [Project structure](#project-structure)
- [Further help](#further-help)

## Features

- **Landing page** with connection details for each mode the pool exposes — Stratum V1, Stratum V1 over TLS, Stratum V2, PPLNS variants and DATUM.
- **Address dashboard** — look up any Bitcoin address to see its connected workers, hash rate and best difficulty.
- **Per-worker views** — drill from an address into a worker group, then into an individual session.
- **Charts** — hash rate over time, rendered with Chart.js.
- **Settings** per address.
- **Runtime configuration** — a deployed build can be pointed at a different pool without rebuilding. See [Configuration](#configuration).
- **Four themes**, animated particle background, and responsive layouts for mobile and desktop.

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Angular 18 |
| UI components | PrimeNG 17, PrimeFlex, PrimeIcons |
| Charts | Chart.js 4 with the Moment adapter |
| Effects | tsparticles / ng-particles |
| Utilities | `bitcoin-address-validation`, `ngx-device-detector` |
| Tests | Karma and Jasmine |
| Serving | Caddy (in the Docker image) |
| Hosting | GitHub Pages |

## Requirements

- **Node.js `22.16.0`** — pinned in [`.node-version`](.node-version)
- A running [Public-Pool](https://github.com/benjamin-wilson/public-pool) backend

## Development server

```bash
npm install
npm start
```

Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

`npm start` runs `ng serve` with [`proxy.config.local.json`](proxy.config.local.json), which forwards `/api` to `https://localhost:3334` — the default API port of a local Public-Pool. Running `ng serve` on its own skips the proxy, so API calls will not reach the backend.

To develop against the hosted pool instead of a local one, use `npm run start:prod`.

## Build

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory, specifically `dist/public-pool-ui`. The build runs a production compile and then pre-compresses the output with gzip and brotli.

| Script | Description |
| --- | --- |
| `npm start` | Dev server with the local API proxy. |
| `npm run start:prod` | Dev server against the production configuration. |
| `npm run build` | Production build, gzip and brotli compressed. |
| `npm run build:github` | Production build plus the `CNAME` file used for GitHub Pages. |
| `npm run build:electron` | Build for embedding in an Electron shell, using relative paths. |
| `npm run watch` | Development build in watch mode. |
| `npm test` | Unit tests. |
| `npm run bundle-report` | Production build with `webpack-bundle-analyzer`. |

## Configuration

Endpoints come from [`src/environments/`](src/environments/) at build time. `environment.ts` is used for development, `environment.prod.ts` for production builds, and `environment.electron.ts` for the Electron build.

| Key | Description |
| --- | --- |
| `API_URL` | Base URL of the Public-Pool REST API. Empty in development so the dev proxy handles it. |
| `STRATUM_URL` | Stratum V1 endpoint shown on the landing page. |
| `SECURE_STRATUM_URL` | Stratum V1 over TLS. |
| `STRATUM_V2_URL` | Stratum V2 endpoint. |
| `PPLNS_STRATUM_URL` | PPLNS Stratum V1 endpoint. |
| `PPLNS_SECURE_STRATUM_URL` | PPLNS Stratum V1 over TLS. |
| `PPLNS_STRATUM_V2_URL` | PPLNS Stratum V2 endpoint. |
| `PPLNS_DATUM_URL` | DATUM endpoint. |

Leave a key empty and the corresponding option is not offered in the UI.

### Runtime overrides

An already-built deployment can be repointed without recompiling. [`src/assets/runtime-config.js`](src/assets/runtime-config.js) defines `window.__PUBLIC_POOL_CONFIG__`, and any key set there takes precedence over the compiled environment:

```js
window.__PUBLIC_POOL_CONFIG__ = {
  API_URL: 'https://pool.example.com:3334',
  STRATUM_URL: 'pool.example.com:3333'
};
```

This is what makes the published Docker image reusable for self-hosted pools — see the environment variables below.

## Deployment

Install pm2 (https://pm2.keymetrics.io/)

```bash
$ pm2 serve --spa dist/public-pool-ui/ 3335 --name ui
```

The `--spa` flag matters: the app uses client-side routing, so every path has to fall back to `index.html`.

Pushes to `master` are also built and published to GitHub Pages by [`.github/workflows/main.yml`](.github/workflows/main.yml), which runs `npm run build:github` and serves the result at [web.public-pool.io](https://web.public-pool.io).

## Docker

```bash
$ docker build -t public-pool-ui .
$ docker run --name public-pool-ui --rm -p 8080:80 public-pool-ui
```

From Docker commands, website will be accessible on [http://localhost:8080](http://localhost:8080). By default Caddy server listen on port 80, but we bind it to port 8080 which allows you to launch image without root permissions.

Available variables:
* `PUBLIC_POOL_API_URL`: base URL of your Public-Pool API. Written into `runtime-config.js` at container start, so one image can serve any pool.
* `PUBLIC_POOL_STRATUM_URL`: stratum endpoint shown on the landing page.
* `LOGLEVEL`: loglevel in stdout (default: `INFO`)
* `LOGFORMAT`: log format in stdout (default: `json`)

Pointing the image at your own pool:

```bash
$ docker run --name public-pool-ui --rm -p 8080:80 \
    -e PUBLIC_POOL_API_URL=https://pool.example.com:3334 \
    -e PUBLIC_POOL_STRATUM_URL=pool.example.com:3333 \
    public-pool-ui
```

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Project structure

```
src/app/
  components/
    splash/              Landing page and connection details
    dashboard/           Per-address overview
    worker-group/        Workers grouped by name
    worker/              Individual worker session
    settings/            Per-address settings
    background-particles/
  layout/                Shell, menu, theme handling
  services/              API clients and runtime config
  pipes/  validators/
src/environments/        Build-time endpoint configuration
src/assets/              Themes and runtime-config.js
docker/                  Caddy config and container entrypoint
```

### API endpoints used

`/api/info`, `/api/info/accounting`, `/api/info/chart`, `/api/info/chart/payout-modes`, `/api/network` and `/api/client/:address`.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) and currently targets Angular 18.1.0.
