const path = require('path')
function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  chainWebpack: (config) => {
    config.resolve.alias
      .set('@', resolve('src/renderer'))
      .set('~', resolve('src'))
      .set('root', resolve('./'))
    // 将 icons 目录排除在 svg 默认规则之外
    config.module
      .rule('svg')
      .exclude.add(resolve('src/renderer/icons'))
      .end()
    // 用 svg-sprite-loader 处理 icons 下的 svg
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/renderer/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      preload: 'src/preload.js',
      chainWebpackMainProcess: (config) => {
        config.resolve.alias
          .set('@', resolve('src/renderer'))
          .set('~', resolve('src'))
          .set('root', resolve('./'))
      },
      mainProcessWatch: ['src/main/api/index.js'],
      builderOptions: {
        productName: '京东抢购助手',
        dmg: {},
        mac: {},
        win: {
          icon: 'src/renderer/assets/icon.ico',
          target: ['nsis', 'zip']
        },
        nsis: {
          oneClick: false, //是否一键安装
          allowToChangeInstallationDirectory: true, //允许修改安装目录
          installerIcon: 'src/renderer/assets/icon.ico', //安装图标
          uninstallerIcon: 'src/renderer/assets/icon.ico', //卸载图标
          installerHeaderIcon: 'src/renderer/assets/icon.ico', //安装时头部图标
          createDesktopShortcut: true, //创建桌面图标
          createStartMenuShortcut: false //创建开始菜单图标
        }
      }
    }
  }
}
