const folderPathInput = document.getElementById('folderPath');
const selectFolderBtn = document.getElementById('selectFolderBtn');
const refreshBtn = document.getElementById('refreshBtn');
const reportsList = document.getElementById('reportsList');
const previewImage = document.getElementById('previewImage');
const previewLabel = document.getElementById('previewLabel');
const previewHint = document.getElementById('previewHint');
const bindPreviewBtn = document.getElementById('bindPreviewBtn');
const previewFallback = document.getElementById('previewFallback');

let selectedReport = null;

function showFallbackBox(show) {
  previewFallback.classList.toggle('hidden', !show);
}

function clearPreview(message = 'Selecione um relatório para visualizar a prévia.') {
  previewLabel.textContent = message;
  previewImage.src = '';
  previewImage.classList.add('hidden');
  previewHint.classList.remove('hidden');
  showFallbackBox(true);
}

function showMissingPreviewHint() {
  previewImage.src = '';
  previewImage.classList.add('hidden');
  previewHint.textContent = 'Sem imagem de prévia automática. Clique em "Vincular imagem de prévia".';
  previewHint.classList.remove('hidden');
  showFallbackBox(true);
}

function showPreviewData(dataUrl) {
  previewImage.onerror = () => {
    previewHint.textContent = 'Não foi possível carregar a imagem de prévia (arquivo inválido ou inacessível).';
    previewImage.classList.add('hidden');
    previewHint.classList.remove('hidden');
    showFallbackBox(true);
  };

  previewImage.src = dataUrl;
  previewImage.classList.remove('hidden');
  previewHint.classList.add('hidden');
  showFallbackBox(false);
}

async function loadPreview(report) {
  selectedReport = report;
  previewLabel.textContent = report.displayName;
  const result = await window.viewerAPI.getReportPreview(report.fullPath);

  if (result?.previewDataUrl) {
    showPreviewData(result.previewDataUrl);
    return;
  }

  showMissingPreviewHint();
}

function renderReports(reports) {
  reportsList.innerHTML = '';

  if (!reports.length) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = 'Nenhum arquivo .pbix encontrado na pasta selecionada.';
    reportsList.appendChild(empty);
    selectedReport = null;
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

bindPreviewBtn.addEventListener('click', async () => {
  if (!selectedReport) {
    return;
  }

  const result = await window.viewerAPI.bindReportPreview(selectedReport.fullPath);
  if (result?.ok && result.previewDataUrl) {
    showPreviewData(result.previewDataUrl);
  }
});

refreshBtn.addEventListener('click', refreshReports);

loadConfig();
