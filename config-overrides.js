const webpack = require('webpack')

module.exports = {
  webpack: function (config) {
    const fallback = config.resolve.fallback || {}
    Object.assign(fallback, {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      assert: require.resolve('assert'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify'),
      url: require.resolve('url'),
    })
    config.resolve.fallback = fallback
    config.ignoreWarnings = [/Failed to parse source map/]
    return config
  },
  devServer: function (config) {
    return function (proxy, allowedHost) {
      const modifiedConfig = config(proxy, allowedHost)

      modifiedConfig.headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      }

      return modifiedConfig
    }
  },
}
