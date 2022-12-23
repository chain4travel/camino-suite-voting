/* eslint-disable @typescript-eslint/no-var-requires */
const HtmlWebPackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const path = require('path');
const deps = require('./package.json').dependencies;
console.log('luxon: ', deps['luxon']);
module.exports = {
  output: {
    publicPath: 'http://localhost:3005/',
  },

  resolve: {
    extensions: ['.vue', '.tsx', '.ts', '.jsx', '.js', '.json'],
    alias: {
      '@apis': path.resolve(__dirname, 'src/apis'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@utils': path.resolve(__dirname, 'src/utils'),
    },
  },

  devServer: {
    port: 3005,
    historyApiFallback: true,
  },

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
    ],
  },

  plugins: [
    new ModuleFederationPlugin({
      name: 'vote',
      filename: 'remoteEntry.js',
      remotes: {},
      exposes: {
        './vote': './src/root.tsx',
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
          version: deps['luxon'],
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
