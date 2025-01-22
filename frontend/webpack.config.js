const webpack = require('webpack');

module.exports = {
  resolve: {
    fallback: {
      stream: require.resolve("stream-browserify"),
      assert: require.resolve("assert"),
      path: require.resolve('path-browserify'),
      os: require.resolve('os-browserify/browser'),
      crypto: require.resolve('crypto-browserify'),
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ],
};
