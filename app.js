const { app, BrowserWindow, ipcMain, } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

const fs = require('fs');
const os = require('os');
// Directorio de Minecraft
const userWindow = os.userInfo().username;
const minecraftDirectori = `C:/Users/${userWindow}/AppData/Roaming/.minecraft`;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 850,
    height: 650,
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
    console.log('Actualización disponible, descargando...');
    mainWindow.loadFile('update.html');  // Pantalla de "Descargando actualización..."
  });

  // Cuando la actualización ha sido descargada
  autoUpdater.on('update-downloaded', () => {
    console.log('Actualización descargada, instalando...');
    autoUpdater.quitAndInstall();  // Instalar y reiniciar
  });

  // Si no hay actualizaciones
  autoUpdater.on('update-not-available', () => {
    console.log('No hay actualizaciones disponibles.');
    mainWindow.loadFile('index.html');  // Ejecutar el launcher
    updateEventFile();  // También actualizamos el archivo de eventos al iniciar
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


}


  // Listener para versiones instaladas
  ipcMain.handle('get-installed-versions', async () => {
    const versions = minecraftLauncherLib.utils.get_installed_versions(minecraftDirectori);
    return versions.map(version => version.id);
  });

  // Listener para instalar una versión de Minecraft
  ipcMain.handle('install-minecraft', async (event, version) => {
    await minecraftLauncherLib.install.install_minecraft_version(version, minecraftDirectori);
    return `Se ha instalado la versión ${version}`;
  });

  // Listener para instalar Forge
  ipcMain.handle('install-forge', async (event, version) => {
    const forge = minecraftLauncherLib.forge.find_forge_version(version);
    await minecraftLauncherLib.forge.install_forge_version(forge, minecraftDirectori);
    return 'Forge instalado';
  });

  // Listener para ejecutar Minecraft
  ipcMain.handle('launch-minecraft', (event, { mineUser, version, ram }) => {
    const options = {
      username: mineUser,
      uuid: '',
      token: '',
      jvmArguments: [`-Xmx${ram}G`, `-Xms${ram}G`],
      launcherVersion: "0.0.2"
    };

    const minecraftCommand = minecraftLauncherLib.command.get_minecraft_command(version, minecraftDirectori, options);
    const subprocess = require('child_process').spawn(minecraftCommand[0], minecraftCommand.slice(1));
    subprocess.stdout.on('data', (data) => console.log(`stdout: ${data}`));
    subprocess.stderr.on('data', (data) => console.error(`stderr: ${data}`));
    return 'Minecraft ejecutándose';
  });



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
        console.log("Hay una nueva versión del launcher disponible.");
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
