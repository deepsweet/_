module.exports = {
  parser: 'typescript-eslint-parser',
  plugins: [
    'standard',
    'node',
    'promise',
    'import'
  ],
  extends: [
    'standard',
    'plugin:node/recommended',
    'plugin:promise/recommended',
    'plugin:import/recommended'
  ],
  env: {
    node: true
  },
  rules: {
    'no-undef': 'off',
    'no-unused-vars': 'off',
    'import/no-unresolved': 'off',
    'node/no-unsupported-features': [
      'error',
      {
        ignores: [
          'asyncAwait',
          'modules',
          'restProperties',
          'spreadProperties'
        ]
      }
    ],
    'node/no-missing-import': [
      'error',
      {
        tryExtensions: [
          '.ts',
          '.js'
        ]
      }
    ],
    'node/no-missing-require': [
      'error',
      {
        tryExtensions: [
          '.ts',
          '.js'
        ]
      }
    ]
  }
}
