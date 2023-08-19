# PublicPoolUi

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.0.3.

## Dependencies

Requires [Public-Pool](https://github.com/benjamin-wilson/public-pool) to be running

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Deployment

Install pm2 (https://pm2.keymetrics.io/)

```bash
$ pm2 serve --spa dist/public-pool-ui/ 3335 --name ui
```

## Docker

```bash
$ docker build -t public-pool-ui .
$ docker run --name public-pool-ui --rm -p 8080:80 public-pool-ui
```

From Docker commands, website will be accessible on [http://localhost:8080](http://localhost:8080). By default Caddy server listen on port 80, but we bind it to port 8080 which allows you to launch image without root permissions.

Available variables:
* `DOMAIN`: website domain (default: `localhost`)
* `LOGLEVEL`: loglevel in stdout (default: `INFO`)
* `LOGFORMAT`: log format in stdout (default: `json`)
