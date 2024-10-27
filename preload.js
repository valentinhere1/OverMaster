const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  closeApp: () => ipcRenderer.send('close-window'),
  minimizeApp: () => ipcRenderer.send('minimize-window'),
  getInstalledVersions: () => ipcRenderer.invoke('get-installed-versions'),
  installMinecraft: (version) => ipcRenderer.invoke('install-minecraft', version),
  installForge: (version) => ipcRenderer.invoke('install-forge', version),
  launchMinecraft: (data) => ipcRenderer.invoke('launch-minecraft', data),
});
