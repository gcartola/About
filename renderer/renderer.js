const folderPathInput = document.getElementById('folderPath');
const selectFolderBtn = document.getElementById('selectFolderBtn');
const refreshBtn = document.getElementById('refreshBtn');
const reportsList = document.getElementById('reportsList');

function renderReports(reports) {
  reportsList.innerHTML = '';

  if (!reports.length) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = 'Nenhum arquivo .pbix encontrado na pasta selecionada.';
    reportsList.appendChild(empty);
    return;
  }

  reports.forEach((report) => {
    const item = document.createElement('li');
    item.className = 'report-item';

    const title = document.createElement('span');
    title.textContent = report.displayName;

    const openBtn = document.createElement('button');
    openBtn.textContent = 'Abrir';
    openBtn.addEventListener('click', async () => {
      await window.viewerAPI.openReport(report.fullPath);
    });

    item.append(title, openBtn);
    reportsList.appendChild(item);
  });
}

async function refreshReports() {
  const reports = await window.viewerAPI.listReports();
  renderReports(reports);
}

async function loadConfig() {
  const config = await window.viewerAPI.getConfig();
  folderPathInput.value = config.reportsFolder || '';
  await refreshReports();
}

selectFolderBtn.addEventListener('click', async () => {
  const updatedConfig = await window.viewerAPI.selectFolder();
  if (updatedConfig?.reportsFolder) {
    folderPathInput.value = updatedConfig.reportsFolder;
    await refreshReports();
  }
});

refreshBtn.addEventListener('click', refreshReports);

loadConfig();
