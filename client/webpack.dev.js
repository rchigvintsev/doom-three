const common = require('./webpack.common.js')
const {merge} = require('webpack-merge')
const dotenv = require('dotenv');
const path = require('path');

const serverPort = dotenv.config().parsed.PORT;

module.exports = merge(common, {
    mode: 'development',
    devtool: 'eval-source-map',
    devServer: {
        static: {
            directory: path.join(__dirname, '../dist/client'),
        },
        hot: true,
        port: serverPort
    }
});
