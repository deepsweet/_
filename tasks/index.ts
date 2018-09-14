import sequence from '@start/plugin-sequence'
import parallel from '@start/plugin-parallel'
import env from '@start/plugin-env'
import find from '@start/plugin-find'
import remove from '@start/plugin-remove'
import read from '@start/plugin-read'
import babel from '@start/plugin-lib-babel'
import rename from '@start/plugin-rename'
import write from '@start/plugin-write'
import overwrite from '@start/plugin-overwrite'
import eslint from '@start/plugin-lib-eslint'
import typescriptGenerate from '@start/plugin-lib-typescript-generate'
import typescriptCheck from '@start/plugin-lib-typescript-check'

export const build = async (packageName: string) => {
  const { default: babelConfig } = await import('./config/babel')

  return  sequence(
    find(`packages/${packageName}/src/**/*.+(js|ts)`),
    read,
    babel(babelConfig),
    rename((file) => file.replace(/\.ts$/, '.js')),
    write(`packages/${packageName}/build/`)
  )
}

export const dts = (packageName: string) =>
  sequence(
    find(`packages/${packageName}/src/index.ts`),
    typescriptGenerate(`packages/${packageName}/build/`)
  )

export const pack = (packageName: string) =>
  sequence(
    env({ NODE_ENV: 'production' }),
    find(`packages/${packageName}/build/`),
    remove,
    parallel(['build', 'dts'])(packageName),
  )

export const lint = () =>
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
