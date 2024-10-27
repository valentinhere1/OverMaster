const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const DiscordRPC = require('discord-rpc');
const path = require('path');
const fetch = require('node-fetch');
const Store = require('electron-store');
const os = require('os');

const store = new Store();
const clientId = '1288531063513157642';  // Reemplaza esto con el Client ID de tu aplicación en Discord
DiscordRPC.register(clientId);

const rpc = new DiscordRPC.Client({ transport: 'ipc' });
const userWindow = os.userInfo().username;
const minecraftDirectory = `C:/Users/${userWindow}/AppData/Roaming/.minecraft`;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 850,
    height: 650,
    resizable: false,
    frame: false,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.loadFile('loading.html');

  // Comienza a buscar actualizaciones una vez que la ventana esté lista
  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdates();
  });

  // Estado de actualización disponible
  autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update-status', { status: 'available', message: 'Se encontraron actualizaciones...' });
  });

  // Estado de actualización descargando
  autoUpdater.on('download-progress', (progress) => {
    mainWindow.webContents.send('update-status', {
      status: 'downloading',
      message: `Descargando... ${Math.floor(progress.percent)}%`
    });
  });

  // Estado de actualización descargada y lista para instalar
  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update-status', { status: 'downloaded', message: 'Actualización descargada. Instalando...' });
    autoUpdater.quitAndInstall();
  });

  // No se encontraron actualizaciones
  autoUpdater.on('update-not-available', () => {
    mainWindow.webContents.send('update-status', { status: 'no-update', message: 'No se encontraron actualizaciones. Lanzando launcher...' });
    setTimeout(() => mainWindow.webContents.send('launch-app'), 2000); // Espera antes de lanzar la app
  });
}


  ipcMain.on('minimize-window', () => mainWindow.minimize());
  ipcMain.on('close-window', () => mainWindow.close());
}

async function setActivity(activity) {
  if (!rpc) return;
  rpc.setActivity({
    details: activity.details,
    state: activity.state,
    largeImageKey: 'launcher-icon',  // Configura un icono en el portal de Discord
    largeImageText: 'OverMaster',
    instance: false,
  });
}

rpc.on('ready', () => {
  setActivity({ details: 'En el launcher', state: 'OverMaster (Selector)' });
});

rpc.login({ clientId }).catch(console.error);

ipcMain.handle('launch-minecraft', (event, { mineUser, version, ram }) => {
  const options = {
    username: mineUser,
    jvmArguments: [`-Xmx${ram}G`, `-Xms${ram}G`],
    launcherVersion: "0.0.2",
  };

  const minecraftCommand = minecraftLauncherLib.command.get_minecraft_command(version, minecraftDirectory, options);
  const subprocess = require('child_process').spawn(minecraftCommand[0], minecraftCommand.slice(1));
  
  subprocess.stdout.on('data', (data) => console.log(`stdout: ${data}`));
  subprocess.stderr.on('data', (data) => console.error(`stderr: ${data}`));

  BrowserWindow.getFocusedWindow().minimize();
  setActivity({ details: `Jugando a OverMaster`, state: `Minecraft (${version})` });

  return 'Minecraft ejecutándose';
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

