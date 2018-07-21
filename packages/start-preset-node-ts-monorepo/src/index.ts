import sequence from '@start/plugin-sequence'
import parallel from '@start/plugin-parallel'
import xargs from '@start/plugin-xargs'
import assert from '@start/plugin-assert'
import env from '@start/plugin-env'
import find from '@start/plugin-find'
import findGitStaged from '@start/plugin-find-git-staged'
import remove from '@start/plugin-remove'
import read from '@start/plugin-read'
import babel from '@start/plugin-lib-babel'
import rename from '@start/plugin-rename'
import write from '@start/plugin-write'
import overwrite from '@start/plugin-overwrite'
import watch from '@start/plugin-watch'
import eslint from '@start/plugin-lib-eslint'
import {
  istanbulInstrument,
  istanbulReport,
  istanbulThresholds
} from '@start/plugin-lib-istanbul'
import tape from '@start/plugin-lib-tape'
import typescriptGenerate from '@start/plugin-lib-typescript-generate'
import typescriptCheck from '@start/plugin-lib-typescript-check'
import npmVersion from '@start/plugin-lib-npm-version'
import npmPublish from '@start/plugin-lib-npm-publish'
import codecov from '@start/plugin-lib-codecov'
import tapDiff from 'tap-diff'

import { babelConfigBuild, babelConfigDts } from './config/babel'

export const build = (packageName: string) =>
  sequence(
    find(`packages/${packageName}/**/*.+(js|ts)`),
    read,
    babel(babelConfigBuild),
    rename((file) => file.replace(/\.ts$/, '.js')),
    write(`packages/${packageName}/build/`)
  )

export const dts = (packageName: string) =>
  sequence(
    find(`packages/${packageName}/**/*.ts`),
    typescriptGenerate(`packages/${packageName}/build/`),
    read,
    babel(babelConfigDts),
    write(`packages/${packageName}/build/`)
  )

export const pack = (packageName: string) =>
  sequence(
    assert(packageName, 'package name is required'),
    env({ NODE_ENV: 'production' }),
    find(`packages/${packageName}/build/`),
    remove,
    parallel(['build', 'dts'])(packageName)
  )

export const packs = xargs('pack')

export const dev = (packageName: string) =>
  watch(`packages/${packageName}/**/*.ts`)(
    sequence(
      read,
      babel(babelConfigBuild),
      rename((file) => file.replace(/\.ts$/, '.js')),
      write(`packages/${packageName}/build/`)
    )
  )

export const lint = () =>
  sequence(
    findGitStaged(['packages/*/+(src|test)/**/*.ts', 'tasks/**/*.ts']),
    read,
    eslint(),
    typescriptCheck()
  )

export const lintAll = () =>
  sequence(
    find(['packages/*/+(src|test)/**/*.+(ts|js)', 'tasks/**/*.ts']),
    read,
    eslint(),
    typescriptCheck()
  )

export const fix = () =>
  sequence(
    find(['packages/*/+(src|test)/**/*.+(js|ts)', 'tasks/**/*.ts']),
    read,
    eslint({ fix: true }),
    overwrite
  )

export const test = () =>
  sequence(
    env({ NODE_ENV: 'test' }),
    find(`coverage/`),
    remove,
    find('packages/*/src/**/*.ts'),
    istanbulInstrument({ esModules: true, extensions: ['.ts'] }),
    find('packages/*/test/**/*.ts'),
    tape(tapDiff),
    istanbulReport(['lcovonly', 'html', 'text-summary'])
  )

export const ci = () =>
  sequence(
    lintAll(),
    test()
  )

export const ciCoverage = () =>
  sequence(
    ci(),
    find('coverage/lcov.info'),
    read,
    codecov
  )

export const publish = (packageName: string, version: string) =>
  sequence(
    assert(packageName, 'package name is required'),
    assert(version, 'package version is required'),
    pack(packageName),
    npmVersion(version, {
      packagePath: `packages/${packageName}`,
      message: `📦 ${packageName}: v%s`
    }),
    npmPublish(`packages/${packageName}`)
  )
