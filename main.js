import { app, BrowserWindow, Menu, nativeTheme, ipcMain, Tray } from 'electron';
import path from 'node:path';
let win;
let tray;

function createWindow() {
  win = new BrowserWindow({
    width: 380,
    height: 520,
    resizable: false,
    titleBarStyle: 'hiddenInset',
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#1e1e1e' : '#ffffff',
    webPreferences: {
      preload: path.join(process.cwd(), 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.loadFile(path.join(process.cwd(), 'renderer', 'index.html'));

  // Optional: Open devtools during development
  // win.webContents.openDevTools({ mode: 'detach' });

  const template = [
    {
      label: 'Stopwatch',
      submenu: [
        { label: 'Start/Pause', accelerator: 'Space', click: () => win.webContents.send('hotkey:toggle') },
        { label: 'Lap', accelerator: 'CmdOrCtrl+L', click: () => win.webContents.send('hotkey:lap') },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'togglefullscreen' },
        { label: 'Always on Top', type: 'checkbox', click: (m) => win.setAlwaysOnTop(m.checked) }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  // Tray (optional)
  tray = new Tray(process.platform === 'darwin'
    ? path.join(process.cwd(), 'renderer', 'iconTemplate.png')
    : path.join(process.cwd(), 'renderer', 'icon.png'));
  tray.setToolTip('Stopwatch');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Show', click: () => win.show() },
    { label: 'Start/Pause', click: () => win.webContents.send('hotkey:toggle') },
    { label: 'Lap', click: () => win.webContents.send('hotkey:lap') },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ]));
  tray.on('click', () => win.isVisible() ? win.hide() : win.show());
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Persist/restore simple state via IPC (optional)
let persisted = { laps: [], elapsedMs: 0, running: false };
ipcMain.handle('persist:get', () => persisted);
ipcMain.on('persist:set', (_, next) => { persisted = next; });
