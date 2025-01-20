const webpack = require('webpack');

module.exports = {
  resolve: {
    fallback: {
      stream: require.resolve("stream-browserify"),
      assert: require.resolve("assert"),
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ],
};
