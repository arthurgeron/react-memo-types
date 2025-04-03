const path = require('node:path');

/** @type {import('@rspack/cli').Configuration} */
module.exports = {
  context: __dirname,
  entry: {
    main: './src/index.ts',
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: '@arthurgeron/react-memo-types',
      type: 'umd',
    },
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'builtin:swc-loader',
        options: {
          jsc: {
            parser: {
              syntax: 'typescript',
            },
            transform: {
              react: {
                runtime: 'automatic',
              },
            },
          },
        },
        type: 'javascript/auto',
      },
    ],
  },
  externals: {
    react: 'react', // Don't bundle React
  },
  target: 'node', // Or 'web' if primarily for browser use
  mode: 'production',
  devtool: 'source-map',
}; 