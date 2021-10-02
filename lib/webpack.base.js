const autoprefixer = require('autoprefixer')
const glob = require('glob')
const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const projectRoot = process.cwd();

const setMPA = () => {
  const entry = {}
  const htmlWebpackPlugins = []
  const entryFiles = glob.sync(path.join(projectRoot, './src/*/index.js'))

  for (const item of entryFiles) {
    const match = item.match(/src\/(.*)\/index\.js/)
    const pageName = match && match[1]

    entry[pageName] = item

    htmlWebpackPlugins.push(
      new HtmlWebpackPlugin({
        inlineSource: '.css$',
        template: path.join(projectRoot, `./src/${pageName}/index.html`),
        filename: `${pageName}.html`,
        chunks: ['vendors', pageName],
        inject: true,
        minify: {
          html5: true, // 是否根据 HTML5 规范解析输入
          collapseWhitespace: true, // 是否删除多余的空格
          preserveLineBreaks: false, // 当标签之间的空白包含换行符时，总是折叠到 1 个换行符（永远不要完全删除它）。必须与collapseWhitespace=true结合使用
          minifyCSS: true, // 压缩存在于 style 标签和 style 属性中的 css 样式
          minifyJS: true, // 压缩存在于 script 标签和事件监听属性中的 js 代码
          removeComments: false // 是否删除注释
        }
      })
    )
  }

  return {
    entry,
    htmlWebpackPlugins
  }
}

const { entry, htmlWebpackPlugins } = setMPA()

module.exports = {
  entry: entry,
  output: {
    path: path.join(projectRoot, 'dist'),
    filename: '[name]_[chunkhash:8].js'
  },
  module: {
    rules: [
      {
        test: /.js$/,
        use: ['loader']
      },
      {
        test: /.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      {
        test: /.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'less-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [
                autoprefixer({
                  browsers: ['last 2 version', '>1%', 'ios7']
                })
              ]
            }
          },
          {
            loader: 'px2rem-loader',
            options: {
              remUnit: 75,
              remPrecision: 8,
            },
          },
        ]
      },
      {
        test: /.(png|jpg|gif|jpeg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name]_[hash:8].[ext]'
            }
          }
        ]
      },
      {
        test: /.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name]_[hash:8][ext]',
            },
          },
        ],
      },
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name]_[contenthash:8].css',
    }),
    new CleanWebpackPlugin(),
    new FriendlyErrorsWebpackPlugin(),
    function errorPlugin() {
      this.hooks.done.tap('done', (stats) => {
        if (stats.compilation.errors && stats.compilation.errors.length && process.argv.indexOf('--watch') === -1) {
          process.exit(1);
        }
      });
    },
  ].concat(htmlWebpackPlugins),
  stats: 'errors-only'
}