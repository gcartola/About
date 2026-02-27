const folderPathInput = document.getElementById('folderPath');
const selectFolderBtn = document.getElementById('selectFolderBtn');
const refreshBtn = document.getElementById('refreshBtn');
const reportsList = document.getElementById('reportsList');
const previewImage = document.getElementById('previewImage');
const previewLabel = document.getElementById('previewLabel');
const previewHint = document.getElementById('previewHint');

function clearPreview(message = 'Selecione um relatório para visualizar a prévia.') {
  previewLabel.textContent = message;
  previewImage.src = '';
  previewImage.classList.add('hidden');
  previewHint.classList.remove('hidden');
}

async function loadPreview(report) {
  previewLabel.textContent = report.displayName;
  const result = await window.viewerAPI.getReportPreview(report.fullPath);

  if (result?.previewPath) {
    previewImage.src = `file://${result.previewPath.replace(/\\/g, '/')}`;
    previewImage.classList.remove('hidden');
    previewHint.classList.add('hidden');
    return;
  }

  previewImage.src = '';
  previewImage.classList.add('hidden');
  previewHint.classList.remove('hidden');
}

function renderReports(reports) {
  reportsList.innerHTML = '';

  if (!reports.length) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = 'Nenhum arquivo .pbix encontrado na pasta selecionada.';
    reportsList.appendChild(empty);
    clearPreview('Nenhum relatório disponível para prévia.');
    return;
  }

  reports.forEach((report) => {
    const item = document.createElement('li');
    item.className = 'report-item';

    const title = document.createElement('span');
    title.textContent = report.displayName;

    title.addEventListener('click', () => loadPreview(report));

    const openBtn = document.createElement('button');
    openBtn.textContent = 'Abrir';
    openBtn.addEventListener('click', async () => {
      await window.viewerAPI.openReport(report.fullPath);
    });

    item.append(title, openBtn);
    reportsList.appendChild(item);
  });

  loadPreview(reports[0]);
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
