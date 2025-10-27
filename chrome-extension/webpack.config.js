const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    background: './src/background.js',
    popup: './src/popup.js',
    content: './src/content.js',
    injected: './src/injected.js',
    inheritance: './src/inheritance.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'styles/[name].css'
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'manifest.json',
          to: 'manifest.json'
        },
        {
          from: 'popup.html',
          to: 'popup.html'
        },
        {
          from: 'inheritance.html',
          to: 'inheritance.html'
        },
        {
          from: 'styles',
          to: 'styles'
        },
        {
          from: 'icons',
          to: 'icons'
        },
        {
          from: '../gada/target/idl/gado.json',
          to: 'idl/gado.json',
          noErrorOnMissing: true
        }
      ]
    })
  ],
  resolve: {
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer"),
      "process": require.resolve("process/browser")
    }
  },
  mode: 'production',
  devtool: 'source-map'
};