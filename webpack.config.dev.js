const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const fs = require('fs');
const srcRoot = path.resolve(__dirname, 'src');
const devPath = path.resolve(__dirname, 'dev');
const pageDir = path.resolve(srcRoot, 'page');
const mainFile = 'index.js';

function getHtmlArray(entryMap) {
    let htmlArray = [];
    Object.keys(entryMap).forEach((key) => {
        let fullPathName = path.resolve(pageDir, key);
        let fileName = path.resolve(fullPathName, key + '.html');

        if (fs.existsSync(fileName)) {
            htmlArray.push(new HtmlWebpackPlugin({
                filename: key + '.html',
                template: fileName,
                chunks: ['common', key]
            }));
        }


    });
    return htmlArray;
}

function getEntry() {
    let entryMap = {};

    fs.readdirSync(pageDir).forEach((pathname) => { //同步遍历page目录下文件
        let fullPathName = path.resolve(pageDir, pathname); //获取pageDir在整个文件系统的绝对路径
        let stat = fs.statSync(fullPathName); //判断是路径还是文件
        let fileName = path.resolve(fullPathName, mainFile); //在文件路径下如果有'index.js',就将他作为入口文件

        if (stat.isDirectory() && fs.existsSync(fileName)) { //stat如果是路径不是文件并且路径下存在index文件 
            entryMap[pathname] = fileName;
        }
    });

    return entryMap;

}

const entryMap = getEntry();
const htmlArray = getHtmlArray(entryMap);

module.exports = {
    mode: 'development',
    devServer: {
        contentBase: devPath,
        hot: true
    },
    entry: entryMap,
    resolve: {
        alias: {
            component: path.resolve(srcRoot, 'component')
        },
        extensions: ['.js', '.jsx']
    },
    output: {
        path: devPath, //构建的时候会生成devpath
        filename: '[name].min.js'
    },
    module: {
        rules: [
            { test: /\.(js|jsx)$/, use: [{ loader: 'babel-loader' }, { loader: 'eslint-loader' }], include: srcRoot },
            { test: /\.css$/, use: ['style-loader', { 'loader': 'css-loader', options: { minimize: true } }], include: srcRoot },
            {
                test: /\.scss$/, use: ['style-loader', 'css-loader', 'sass-loader', {
                    loader: 'sass-resources-loader',
                    options: {
                        resources: srcRoot + '/component/rem_function.scss'
                    }
                }], include: srcRoot
            },
            { test: /\.(png|jpg|jpeg)$/, use: 'url-loader?limit=8192', include: srcRoot }
        ]
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                common: {
                    test: /[\\/]node_modules[\\/]/,
                    chunks: 'all',
                    name: 'common'
                }
            }
        }
    },
    plugins: [
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css"
        })
    ].concat(htmlArray)
};