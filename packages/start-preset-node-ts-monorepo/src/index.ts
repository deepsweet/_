import sequence from '@start/plugin-sequence'
import parallel from '@start/plugin-parallel'
import xargs from '@start/plugin-xargs'
import assert from '@start/plugin-assert'
import env from '@start/plugin-env'
import find from '@start/plugin-find'
import remove from '@start/plugin-remove'
import read from '@start/plugin-read'
import babel from '@start/plugin-lib-babel'
import rename from '@start/plugin-rename'
import write from '@start/plugin-write'
import overwrite from '@start/plugin-overwrite'
import eslint from '@start/plugin-lib-eslint'
import { istanbulInstrument, istanbulReport } from '@start/plugin-lib-istanbul'
import tape from '@start/plugin-lib-tape'
import typescriptGenerate from '@start/plugin-lib-typescript-generate'
import typescriptCheck from '@start/plugin-lib-typescript-check'
import codecov from '@start/plugin-lib-codecov'
import copyEsmLoader from '@start/plugin-lib-esm-loader'
import {
  makeWorkspacesCommit,
  buildBumpedPackages,
  getWorkspacesPackagesBumps,
  publishWorkspacesPackagesBumps,
  publishWorkspacesPrompt,
  writeWorkspacesPackagesBumps,
  makeWorkspacesGithubReleases,
  pushCommitsAndTags
} from '@start/plugin-lib-auto'
import tapDiff from 'tap-diff'

const babelConfig = {
  babelrc: false,
  shouldPrintComment: (val: string) => val.startsWith('#'),
  presets: [
    [
      require.resolve('@babel/preset-env'),
      {
        targets: {
          node: '8.6.0',
        }
      }
    ],
    require.resolve('@babel/preset-typescript')
  ],
  plugins: [
    [
      require.resolve('@babel/plugin-transform-runtime'),
      {
        regenerator: false
      }
    ],
    require.resolve('@babel/plugin-syntax-dynamic-import'),
    require.resolve('babel-plugin-dynamic-import-node'),
    [
      require.resolve('babel-plugin-module-resolver'),
      {
        alias: {
          '^(@.+)/src/?': '\\1'
        }
      }
    ]
  ]
}

export const build = (packageName: string) =>
  sequence(
    find(`packages/${packageName}/src/**/*.+(js|ts)`),
    read,
    babel(babelConfig),
    rename((file) => file.replace(/\.ts$/, '.js')),
    write(`packages/${packageName}/build/`)
  )

export const dts = (packageName: string) =>
  sequence(
    find(`packages/${packageName}/src/index.ts`),
    typescriptGenerate(`packages/${packageName}/build/`)
  )

export const pack = (packageName: string) =>
  sequence(
    assert(packageName, 'package name is required'),
    env({ NODE_ENV: 'production' }),
    find(`packages/${packageName}/build/`),
    remove,
    parallel(['build', 'dts'])(packageName),
    copyEsmLoader(`packages/${packageName}/build/`)
  )

export const packs = xargs('pack')

export const lint = () =>
  sequence(
    find(['packages/*/+(src|test)/**/*.ts', 'tasks/**/*.ts']),
    read,
    eslint(),
    typescriptCheck({
      lib: ['esnext', 'dom']
    })
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
    lint(),
    test(),
    find('coverage/lcov.info'),
    read,
    codecov
  )

export const commit = () => makeWorkspacesCommit(prefixes, workspacesOptions)

export const publish = () =>
  sequence(
    getWorkspacesPackagesBumps(prefixes, gitOptions, bumpOptions, workspacesOptions),
    publishWorkspacesPrompt(prefixes),
    buildBumpedPackages(pack),
    writeWorkspacesPackagesBumps(prefixes, workspacesOptions),
    publishWorkspacesPackagesBumps(),
    pushCommitsAndTags,
    makeWorkspacesGithubReleases(prefixes, githubOptions)
)
