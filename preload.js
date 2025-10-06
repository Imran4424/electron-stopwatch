import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('stopwatchAPI', {
  // Hotkeys from menu / tray
  onToggle: (cb) => ipcRenderer.on('hotkey:toggle', cb),
  onLap: (cb) => ipcRenderer.on('hotkey:lap', cb),

  // Persist (simple in-memory for demo; you can swap to a file later)
  getPersist: () => ipcRenderer.invoke('persist:get'),
  setPersist: (state) => ipcRenderer.send('persist:set', state)
});
