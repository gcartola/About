const path = require('node:path');
const { spawn } = require('node:child_process');
const { app, BrowserWindow, dialog, ipcMain, screen } = require('electron');
const { createConfigService } = require('./services/configService');
const { createLogService } = require('./services/logService');
const { listReports, findReportByName, getReportPreviewPath } = require('./services/reportService');
const { openPowerBI, closePowerBI, sendPresentationShortcut } = require('./services/powerBIService');

let configService;
let logService;

function parseCliArgs(argv) {
  const viewerArg = argv.find((arg) => arg.startsWith('--viewer='));
  const protocolArg = argv.find((arg) => arg.startsWith('bicreditoviewer://'));

  return {
    reportPath: viewerArg ? decodeURIComponent(viewerArg.replace('--viewer=', '')) : null,
    protocolArg: protocolArg || null
  };
}

function buildLaunchArgs(reportPath) {
  return [`--viewer=${encodeURIComponent(reportPath)}`];
}

function launchIsolatedViewer(reportPath) {
  const args = process.defaultApp
    ? [app.getAppPath(), ...buildLaunchArgs(reportPath)]
    : buildLaunchArgs(reportPath);

  const cmd = process.execPath;
  const child = spawn(cmd, args, {
    detached: true,
    stdio: 'ignore'
  });

  child.unref();
}

function resolveProtocolReport(protocolArg) {
  if (!protocolArg) {
    return null;
  }

  const decoded = decodeURIComponent(protocolArg.replace('bicreditoviewer://', '')).trim();
  const config = configService.getConfig();

  if (!decoded || !config.reportsFolder) {
    return null;
  }

  const report = findReportByName(config.reportsFolder, decoded);
  return report?.fullPath || null;
}

function registerProtocol() {
  if (process.defaultApp) {
    app.setAsDefaultProtocolClient('bicreditoviewer', process.execPath, [path.resolve(process.argv[1])]);
    return;
  }

  app.setAsDefaultProtocolClient('bicreditoviewer');
}

function createLauncherWindow() {
  const mainWindow = new BrowserWindow({
    width: 920,
    height: 680,
    minWidth: 800,
    minHeight: 560,
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

function createViewerWindow(reportPath) {
  const display = screen.getPrimaryDisplay().workAreaSize;
  const width = Math.round(display.width * 0.5);
  const height = Math.round(display.height * 0.8);
  const config = configService.getConfig();

  const viewerWindow = new BrowserWindow({
    width,
    height,
    frame: false,
    backgroundColor: '#f3f3f3',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      additionalArguments: [
        `--reportName=${path.basename(reportPath, '.pbix')}`
      ]
    }
  });

  viewerWindow.loadFile(path.join(__dirname, 'renderer', 'viewer.html'));

  let powerBIProcess;

  try {
    powerBIProcess = openPowerBI(config.powerBIPath, reportPath);
    sendPresentationShortcut(powerBIProcess);
    logService.logReportOpen(path.basename(reportPath, '.pbix'));
  } catch (error) {
    dialog.showErrorBox('Erro ao abrir relatório', error.message);
    viewerWindow.close();
    return;
  }

  viewerWindow.on('closed', () => {
    closePowerBI(powerBIProcess);
  });

}

function registerIpcHandlers() {
  ipcMain.handle('config:get', () => configService.getConfig());

  ipcMain.handle('folder:select', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });

    if (result.canceled || !result.filePaths[0]) {
      return null;
    }

    return configService.saveConfig({ reportsFolder: result.filePaths[0] });
  });

  ipcMain.handle('reports:list', () => {
    const { reportsFolder } = configService.getConfig();
    return listReports(reportsFolder);
  });

  ipcMain.handle('report:open', (_event, reportPath) => {
    launchIsolatedViewer(reportPath);
    return { ok: true };
  });

  ipcMain.handle('report:preview', (_event, reportPath) => ({
    previewPath: getReportPreviewPath(reportPath)
  }));

  ipcMain.on('viewer:close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      win.close();
    }
  });
}

app.whenReady().then(() => {
  configService = createConfigService(app);
  logService = createLogService(app);
  registerProtocol();
  registerIpcHandlers();

  const { reportPath, protocolArg } = parseCliArgs(process.argv);
  const protocolReportPath = resolveProtocolReport(protocolArg);
  const reportToOpen = reportPath || protocolReportPath;

  if (reportToOpen) {
    createViewerWindow(reportToOpen);
  } else {
    createLauncherWindow();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createLauncherWindow();
    }
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
