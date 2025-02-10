const webpack = require('webpack');

module.exports = {
  resolve: {
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve("stream-browserify"),
      assert: require.resolve("assert"),
      path: require.resolve('path-browserify'),
      os: require.resolve('os-browserify/browser'),
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ],
};
