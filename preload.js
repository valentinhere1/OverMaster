const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  closeApp: () => ipcRenderer.send('close-window'),
  minimizeApp: () => ipcRenderer.send('minimize-window'),
  getInstalledVersions: () => ipcRenderer.invoke('get-installed-versions'),
  installMinecraft: (version) => ipcRenderer.invoke('install-minecraft', version),
  installForge: (version) => ipcRenderer.invoke('install-forge', version),
  launchMinecraft: (data) => ipcRenderer.invoke('launch-minecraft', data),
});

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onUpdateStatus: (callback) => ipcRenderer.on('update-status', (event, status) => callback(status)),
  onLaunchApp: (callback) => ipcRenderer.on('launch-app', callback)
});

