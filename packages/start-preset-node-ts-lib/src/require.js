#!/usr/bin/env node

require = require('esm')(module, {
  mainFields: ['module', 'main'],
})

require('@babel/register')({
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current'
        }
      }
    ],
    '@babel/preset-typescript'
  ],
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    'babel-plugin-dynamic-import-node'
  ],
  extensions: [
    '.ts',
    '.js'
  ]
})

require('./cli')
