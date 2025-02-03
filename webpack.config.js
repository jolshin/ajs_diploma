const path = require('path');
const htmlWebpackPlugin=require('html-webpack-plugin');
const miniCssExtractPlugin=require('mini-css-extract-plugin');

module.exports = {
  entry: './src/index.js',

  output: {
    path: path.resolve(__dirname, 'dist'), // каталог для результатов сборки 
    filename: 'bundle.js', // имя файла с результатами сборки (должно совпадать с entry point в шаге 1)
  },

  plugins: [
    new htmlWebpackPlugin({
      template: "./src/index.html",
      filename: "./index.html"
    }),
    new miniCssExtractPlugin({
      filename: '[name].css'
    })
  ],

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: [
          miniCssExtractPlugin.loader, 'css-loader', 
        ],
      },
      
    ],
  },
  
};