module.exports = {
  mode: 'development',
  entry: './src/index.jsx',
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
  },
  output: {
    path: `${__dirname}`,
    filename: 'index.js',
    libraryTarget: 'commonjs'

  },

  module: {
    rules: [
      /*
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader'
    },
    */
      {
        test: /\.jsx$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                'react',
                ['env', {'modules': false}],
              ],
              "plugins": ["transform-object-rest-spread"]
            }
          }
        ]
      }
    ]
  }
};

