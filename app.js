const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');

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
    resizable: false,  // Deshabilitar el redimensionamiento
    frame: false,  // Eliminar el borde de la ventana
    transparent: true,  // Fondo transparente
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  // Cargar la pantalla de carga o la pantalla principal dependiendo de si hay actualizaciones
  mainWindow.loadFile('loading.html');  // Pantalla de "Buscando actualizaciones"

  // Una vez que la ventana está lista, buscamos actualizaciones
  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdates();
  });

  // Si hay una actualización disponible
  autoUpdater.on('update-available', () => {
    mainWindow.loadFile('update.html');  // Pantalla de "Descargando actualización..."
  });

  // Cuando la actualización ha sido descargada
  autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall();  // Instalar y reiniciar
  });

  // Si no hay actualizaciones
  autoUpdater.on('update-not-available', () => {
    mainWindow.loadFile('index.html');  // Ejecutar el launcher
    // También actualizamos el archivo de eventos al iniciar
    updateEventFile();
  });

  // Si hay algún error en la búsqueda de actualizaciones
  autoUpdater.on('error', (error) => {
    console.error('Error al buscar actualizaciones:', error);
    mainWindow.loadFile('index.html');  // Si hay un error, ejecuta el launcher de todos modos
  });

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
      modal: true,
      parent: mainWindow,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });
    popup.loadFile('poppup/versions.html');  // Corregido: 'popup' a 'poppup'
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
        alert("Hay una nueva versión del launcher disponible. Actualiza para obtener las últimas correcciones.");
        localStorage.setItem('lastLauncherVersion', latestCommitHash);
      }
    } else {
      console.error("Error al verificar actualizaciones del launcher:", response.statusText);
    }
  } catch (error) {
    console.error("Error de conexión:", error);
  }
}

// Actualiza el archivo de eventos desde el repositorio
async function updateEventFile() {
  const eventFileUrl = `https://raw.githubusercontent.com/valentinhere1/OverMaster/main/event_file.json`;

  try {
    const response = await fetch(eventFileUrl);
    if (response.ok) {
      const eventData = await response.json();
      console.log("Event file actualizado:", eventData);

      // Guardar los datos del event_file en localStorage
      localStorage.setItem('eventData', JSON.stringify(eventData));

      alert("Archivo de eventos actualizado.");
    } else {
      console.error("Error al descargar el event_file:", response.statusText);
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
