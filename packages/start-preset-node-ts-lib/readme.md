# start-preset-node-ts-lib

[![npm](https://img.shields.io/npm/v/@deepsweet/start-preset-node-ts-lib.svg?style=flat-square)](https://www.npmjs.com/package/@deepsweet/start-preset-node-ts-lib)

My personal [Start](https://github.com/deepsweet/start) preset for maintaining Node.js TypeScript lib.

## Install

```sh
$ yarn add --dev @deepsweet/start-preset-node-ts-lib typescript
```

## Usage

```sh
$ yarn start
# or
$ npx start
```

## Tasks

### build

Transpile `src/` to `build/` using Babel.

### dts

Generate TypeScript `d.ts` definition files into `build/`.

### pack

`build` + `dts` tasks in parallel.

### dev

Watch `src/` and transpile changed files into `build/`

### lint

Run ESLint.

### fix

Run ESLint with `--fix`.

### test

Run tests placed in `test/` with Tape and collect coverage.

### ci

`ci` + `test` + send coverage to [codecov.io](https://codecov.io).

### publish

Publish to NPM using `version` and `otp` args.
