const { contextBridge, ipcRenderer } = require('electron');

function getViewerReportName() {
  const arg = process.argv.find((item) => item.startsWith('--reportName='));
  return arg ? decodeURIComponent(arg.replace('--reportName=', '')) : null;
}

contextBridge.exposeInMainWorld('viewerAPI', {
  getConfig: () => ipcRenderer.invoke('config:get'),
  selectFolder: () => ipcRenderer.invoke('folder:select'),
  listReports: () => ipcRenderer.invoke('reports:list'),
  openReport: (reportPath) => ipcRenderer.invoke('report:open', reportPath),
  getReportPreview: (reportPath) => ipcRenderer.invoke('report:preview', reportPath),
  closeViewer: () => ipcRenderer.send('viewer:close'),
  getViewerReportName
});
