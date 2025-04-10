const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1200, 
    height: 900,
    icon: `file://${__dirname}/dist/arc-client/browser/assets/images/MatrixComSec_Logo.png`,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    //   preload: path.join(__dirname, 'preload.js') // optional if you have a preload script
    }
  });

  // Load the index.html file from the dist folder
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, 'dist/arc-client/browser/index.html'), // Point to your index.html
      protocol: 'file:',
      slashes: true
    })
  );

  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
