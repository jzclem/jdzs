import { app, protocol, BrowserWindow, Menu, Tray } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import path from 'path'
const isDevelopment = process.env.NODE_ENV !== 'production'

const menus = [
  {
    label: '视图',
    submenu: [
      {
        label: '刷新',
        role: 'reload'
      },
      {
        label: '退出',
        role: 'quit'
      }
    ]
  },
  {
    label: '开发者工具',
    role: 'toggledevtools'
  },
  {
    label: '全屏',
    role: 'togglefullscreen'
  },
  {
    label: '最小化',
    role: 'minimize'
  }
]
const menu = Menu.buildFromTemplate(menus)
let win
let tray = null

async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 960,
    height: 720,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, 'preload.js'),
      enableRemoteModule: true,
      webSecurity: false
    }
  })
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    await win.loadURL('app://./index.html')
  }
  // 窗口关闭的监听
  win.on('closed', () => {
    win = null
  })
  // 触发关闭时触发
  win.on('close', (event) => {
    // 截获 close 默认行为
    event.preventDefault()
    // 点击关闭时触发close事件，我们按照之前的思路在关闭时，隐藏窗口，隐藏任务栏窗口
    win.hide()
    win.setSkipTaskbar(true)
  })
  // 触发显示时触发
  win.on('show', () => {})
  // 触发隐藏时触发
  win.on('hide', () => {})

  // 新建托盘
  tray = new Tray(path.join(__dirname, 'favicon.ico'))
  // 托盘名称
  tray.setToolTip('京东助手')
  // 托盘菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示',
      click: () => {
        win.show()
      }
    },
    {
      label: '退出',
      click: () => {
        win.destroy()
      }
    }
  ])
  // 载入托盘菜单
  tray.setContextMenu(contextMenu)
  // 双击触发
  tray.on('double-click', () => {
    // 双击通知区图标实现应用的显示或隐藏
    win.isVisible() ? win.hide() : win.show()
    win.isVisible() ? win.setSkipTaskbar(false) : win.setSkipTaskbar(true)
  })
  Menu.setApplicationMenu(menu)
}

class LifeCycle {
  beforeReady() {
    // Scheme must be registered before the app is ready
    protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }])
  }

  onReady() {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', async () => {
      if (isDevelopment && !process.env.IS_TEST) {
        // Install Vue Devtools
        try {
          await installExtension(VUEJS_DEVTOOLS)
        } catch (e) {
          console.error('Vue Devtools failed to install:', e.toString())
        }
      }
      await createWindow()
    })
  }

  onRunning() {
    app.on('activate', async () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (win === null) await createWindow()
    })
  }

  onQuit() {
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })

    app.on('will-quit', () => {
      // globalShortcut.unregisterAll()
      // bus.removeAllListeners()
      // server.shutdown()
    })
    // Exit cleanly on request from parent process in development mode.
    if (isDevelopment) {
      if (process.platform === 'win32') {
        process.on('message', (data) => {
          if (data === 'graceful-exit') {
            app.quit()
            // server.shutdown()
          }
        })
      } else {
        process.on('SIGTERM', () => {
          app.quit()
          // server.shutdown()
        })
      }
    }
  }

  launchApp() {
    // 保证单例运行
    const gotTheLock = app.requestSingleInstanceLock()
    if (!gotTheLock) {
      app.quit()
    } else {
      this.beforeReady()
      this.onReady()
      this.onRunning()
      this.onQuit()
    }
  }
}

const bootstrap = new LifeCycle()

export { bootstrap }
