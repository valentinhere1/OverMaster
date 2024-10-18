const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const ffmpegPath = path.join(__dirname, 'ffmpeg.dll');
if (fs.existsSync(ffmpegPath)) {
  console.log('ffmpeg.dll found at', ffmpegPath);
} else {
  console.error('ffmpeg.dll is missing!');
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,  // Elimina el borde de la ventana
    transparent: true,  // Hace transparente el fondo
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
