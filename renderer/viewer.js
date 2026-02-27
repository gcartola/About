const reportTitle = document.getElementById('reportTitle');
const closeViewerBtn = document.getElementById('closeViewerBtn');

const reportName = window.viewerAPI.getViewerReportName();
if (reportName) {
  reportTitle.textContent = reportName;
}

closeViewerBtn.addEventListener('click', () => {
  window.viewerAPI.closeViewer();
});
