#!/usr/bin/env node

/* eslint-disable no-global-assign */
/* eslint-disable no-process-exit */
/* eslint-disable no-throw-literal */
/* eslint-disable node/shebang */
/* eslint-disable node/no-missing-require */
require = require('esm')(module, {
  mainFields: ['module', 'main']
})

require('@babel/register')({
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current'
        },
        modules: false
      }
    ],
    '@babel/preset-typescript'
  ],
  plugins: [
    '@babel/plugin-syntax-dynamic-import'
  ],
  extensions: [
    '.ts',
    '.js'
  ]
})

const { default: reporter } = require('@start/reporter-verbose')
const tasks = require('./')

;(async () => {
  const taskName = process.argv[2]
  const taskArgs = process.argv.slice(3)
  const task = tasks[taskName]

  if (typeof taskName === 'undefined' || typeof task === 'undefined') {
    throw `One of the following task names is required:\n* ${Object.keys(tasks).join('\n* ')}`
  }

  const taskRunner = await task(...taskArgs)

  try {
    await taskRunner({ reporter: reporter(taskName) })
  } catch (error) {
    if (error !== null) {
      console.log(error)
    }

    process.exit(1)
  }
})()
