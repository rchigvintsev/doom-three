const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const NodeJsonMinify = require('node-json-minify');
const path = require('path');

module.exports = {
    entry: './client/src/index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        alias: {
            three: path.resolve('./node_modules/three')
        },
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, '../dist/client')
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './client/src/index.html'
        }),
        new CopyWebpackPlugin({
            patterns: [{
                from: './client/src/assets', to: 'assets', transform: content => NodeJsonMinify(content.toString())
            }]
        }),
        new ESLintPlugin({extensions: ['js', 'jsx', 'ts', 'tsx']})
    ],
    optimization: {
        minimizer: [new TerserPlugin({
            extractComments: false,
            terserOptions: {
                format: {
                    comments: false
                }
            }
        })]
    }
};
