var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var rules = [
  {
    "test": /\.jsx?$/,
    "exclude": /node_modules/,
    "use": {
      "loader": "babel-loader",
      "options": {
        "presets": [
          "babel-preset-es2015"
        ],
        "plugins": []
      }
    }
  },
  {
    "test": /\.css?$/,
    "use": "style-loader!css-loader"
  },
  {
    "test": /\.hyp?$/,
    "use": "hyperhtml-loader"
  }
];

module.exports = {
  devtool: 'source-map',
  entry: path.resolve('src', 'main.js'),
  output: {
    path: path.resolve('build'),
    filename: 'main.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js', '.hyp']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve('src', 'index.tpl.html'),
      filename: 'index.html',
      inject: false
    })
  ],
  module: {
    rules: rules
  }
};
