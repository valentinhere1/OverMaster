const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater'); // Añadimos autoUpdater para manejar las actualizaciones

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

  // Cuando la ventana esté lista, verifica actualizaciones del repositorio
  mainWindow.once('ready-to-show', () => {
    checkForLauncherUpdates();  // Llama a la función que verifica actualizaciones del launcher
  });
}

// Verifica si hay actualizaciones en el repositorio de GitHub
async function checkForLauncherUpdates() {
  const repoUrl = "https://api.github.com/repos/valentinhere1/OverMaster/commits?sha=main";
  
  try {
    const response = await fetch(repoUrl);
    if (response.ok) {
      const commits = await response.json();
      const latestCommitHash = commits[0].sha;

      const lastLauncherVersion = localStorage.getItem('lastLauncherVersion');
      
      if (lastLauncherVersion !== latestCommitHash) {
        console.log("Hay una nueva versión disponible.");
        autoUpdater.checkForUpdatesAndNotify();  // Ejecuta la verificación y notificación de actualizaciones del launcher
        localStorage.setItem('lastLauncherVersion', latestCommitHash);
      }
    } else {
      console.error("Error al verificar actualizaciones del launcher:", response.statusText);
    }
  } catch (error) {
    console.error("Error de conexión:", error);
  }
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

// Eventos del autoUpdater
autoUpdater.on('update-available', () => {
  console.log('Nueva actualización disponible.');
});

autoUpdater.on('update-downloaded', () => {
  console.log('Actualización descargada. Instalando...');
  autoUpdater.quitAndInstall();  // Instalamos y reiniciamos la aplicación automáticamente
});
