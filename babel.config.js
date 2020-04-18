// 仅在生产模式下使用的插件
const productionPlugins = []
if (process.env.NODE_ENV === 'production') {
  productionPlugins.push('transform-remove-console')
}
module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ],
    ...productionPlugins,
    '@babel/plugin-syntax-dynamic-import'
  ]
}
