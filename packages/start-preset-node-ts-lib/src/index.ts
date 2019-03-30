import sequence from '@start/plugin-sequence'
import parallel from '@start/plugin-parallel'
import find from '@start/plugin-find'
import remove from '@start/plugin-remove'
import read from '@start/plugin-read'
import rename from '@start/plugin-rename'
import write from '@start/plugin-write'
import overwrite from '@start/plugin-overwrite'
import babel from '@start/plugin-lib-babel'
import typescriptGenerate from '@start/plugin-lib-typescript-generate'
import typescriptCheck from '@start/plugin-lib-typescript-check'
import watch from '@start/plugin-watch'
import eslint from '@start/plugin-lib-eslint'
import { istanbulInstrument, istanbulReport } from '@start/plugin-lib-istanbul'
import tape from '@start/plugin-lib-tape'
import tapDiff from 'tap-diff'
import codecov from '@start/plugin-lib-codecov'

const babelConfig = {
  babelrc: false,
  comments: false,
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
    require.resolve('babel-plugin-dynamic-import-node')
  ]
}

export const build = () =>
  sequence(
    find('src/**/*.{ts,js}'),
    read,
    babel(babelConfig),
    rename((file) => file.replace(/\.ts$/, '.js')),
    write('build/')
  )

export const dts = () =>
  sequence(
    find('src/index.ts'),
    typescriptGenerate('build/')
  )

export const pack = () =>
  sequence(
    find('build/'),
    remove,
    parallel(['build', 'dts'])(),
  )

export const dev = () => watch('src/**/*.ts')(
  sequence(
    read,
    babel(babelConfig),
    rename((file) => file.replace(/\.ts$/, '.js')),
    write('build/'),
    typescriptGenerate('build/')
  )
)

export const lint = () =>
  sequence(
    find('{src,test,tasks}/**/*.{ts,js}'),
    read,
    eslint(),
    typescriptCheck()
  )

export const fix = () =>
  sequence(
    find('{src,test,tasks}/**/*.{ts,js}'),
    read,
    eslint({ fix: true }),
    overwrite
  )

export const test = () =>
  sequence(
    find(`coverage/`),
    remove,
    find('src/**/*.{ts,js}'),
    istanbulInstrument({ esModules: true, extensions: ['.ts', '.js'] }),
    find('test/**/*.{ts,js}'),
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
