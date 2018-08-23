const babelConfigCommon = {
  babelrc: false,
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '8.6.0'
        },
        modules: false
      }
    ]
  ],
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    ['babel-plugin-module-resolver', {
      alias: {
        '^(@.+)/src/': '\\1'
      }
    }]
  ]
}

export const babelConfigBuild = {
  ...babelConfigCommon,
  comments: false,
  presets: [
    ...babelConfigCommon.presets,
    '@babel/preset-typescript'
  ]
}

export const babelConfigDts = {
  ...babelConfigCommon,
  plugins: [
    ...babelConfigCommon.plugins,
    '@babel/plugin-syntax-typescript'
  ]
}
