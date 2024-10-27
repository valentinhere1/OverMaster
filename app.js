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

  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdates();
  });

  autoUpdater.on('update-available', () => {
    mainWindow.loadFile('update.html');
  });

  autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall();
  });

  autoUpdater.on('update-not-available', () => {
    mainWindow.loadFile('index.html');
    updateEventFile();
  });

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

