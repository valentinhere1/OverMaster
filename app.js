const { app, BrowserWindow, ipcMain } = require('electron'); // Añadido ipcMain
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater'); // Añadimos autoUpdater para manejar las actualizaciones

// Verificar la existencia de ffmpeg.dll
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

  // Cargar el archivo HTML principal
  mainWindow.loadFile('index.html');

  // Escuchar eventos del renderer para minimizar y cerrar la ventana
  ipcMain.on('minimize-window', () => {
    mainWindow.minimize();
  });

  ipcMain.on('close-window', () => {
    mainWindow.close();
  });

  // Abrir el popup de selección de versión
  ipcMain.on('open-version-popup', () => {
    const popup = new BrowserWindow({
      width: 400,
      height: 300,
      modal: true, // Hacer que la ventana sea modal
      parent: mainWindow, // Hacer que el popup dependa de la ventana principal
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });
    popup.loadFile('poppup/versions.html'); // Corregido: Cambiado 'popups' a 'poppup'
  });

  // Cuando la ventana esté lista, verificar actualizaciones del repositorio
  mainWindow.once('ready-to-show', () => {
    checkForLauncherUpdates();  // Verificar actualizaciones
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
        autoUpdater.checkForUpdatesAndNotify();  // Ejecutar la verificación y notificación de actualizaciones del launcher
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
