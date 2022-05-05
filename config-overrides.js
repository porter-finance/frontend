/* config-overrides.js */
const webpack = require('webpack')

module.exports = function override(config) {
  const fallback = config.resolve.fallback || {}
  Object.assign(fallback, {
    util: require.resolve('util/'),
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer'),
    assert: require.resolve('assert'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    os: require.resolve('os-browserify'),
    url: require.resolve('url'),
  })
  config.plugins.push(
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  )
  config.module.rules = [
    ...config.module.rules,
    {
      test: /\.m?js/,
      resolve: {
        fullySpecified: false,
      },
    },
  ]
  config.resolve.fallback = fallback
  config.ignoreWarnings = [/Failed to parse source map/]
  return config
}
