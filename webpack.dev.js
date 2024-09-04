/* eslint-disable @typescript-eslint/no-var-requires */
const { default: merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',

  devServer: {
    port: 5005,
    historyApiFallback: true,
    static: './dist',
  },
});
