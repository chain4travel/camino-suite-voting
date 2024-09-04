/* eslint-disable @typescript-eslint/no-var-requires */
const HtmlWebPackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const path = require('path');
const Dotenv = require('dotenv-webpack');
const webpack = require('webpack');
const childProcess = require('child_process');
let GIT_COMMIT_HASH;
const deps = require('./package.json').dependencies;
try {
  GIT_COMMIT_HASH = childProcess
    .execSync('git rev-parse --short HEAD')
    .toString()
    .trim();
} catch (e) {
  GIT_COMMIT_HASH = 'N/A';
}
module.exports = {
  module: {
    rules: [
      {
        test: /\.m?js/,
        type: 'javascript/auto',
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.(css|s[ac]ss)$/i,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.json$/,
        use: ['json-loader'],
      },
    ],
  },
  resolve: {
    fallback: {
      fs: false,
      tls: false,
      net: false,
    },
    extensions: ['.vue', '.tsx', '.ts', '.jsx', '.js', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  plugins: [
    new Dotenv(),
    new webpack.DefinePlugin({
      'process.env.GIT_COMMIT_HASH': JSON.stringify(GIT_COMMIT_HASH),
    }),
    new NodePolyfillPlugin(),
    new ModuleFederationPlugin({
      name: 'dac',
      filename: 'remoteEntry.js',
      remotes: {
        wallet: 'wallet@http://localhost:5003/remoteEntry.js',
      },
      exposes: {
        './dac': './src/root.tsx',
      },
      shared: {
        ...deps,
        react: {
          singleton: true,
          requiredVersion: deps.react,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: deps['react-dom'],
        },
        luxon: {
          singleton: true,
          eager: true,
          version: deps.luxon,
          requiredVersion: deps.luxon,
        },
      },
    }),
    new HtmlWebPackPlugin({
      template: path.resolve(__dirname, 'public/index.html'),
      favicon: './public/favicon.ico',
      manifest: './public/manifest.json',
    }),
  ],
};
