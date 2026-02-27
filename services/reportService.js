const fs = require('node:fs');
const path = require('node:path');

const PREVIEW_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.bmp'];

function listReports(folderPath) {
  if (!folderPath || !fs.existsSync(folderPath)) {
    return [];
  }

  return fs
    .readdirSync(folderPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === '.pbix')
    .map((entry) => {
      const fullPath = path.join(folderPath, entry.name);
      return {
        fileName: entry.name,
        displayName: path.basename(entry.name, '.pbix'),
        fullPath
      };
    })
    .sort((a, b) => a.displayName.localeCompare(b.displayName, 'pt-BR'));
}

function findReportByName(folderPath, reportName) {
  const reports = listReports(folderPath);
  return reports.find((report) => report.displayName.toLowerCase() === reportName.toLowerCase()) || null;
}

function getReportPreviewPath(reportPath) {
  if (!reportPath || !fs.existsSync(reportPath)) {
    return null;
  }

  const dir = path.dirname(reportPath);
  const baseName = path.basename(reportPath, '.pbix');

  for (const ext of PREVIEW_EXTENSIONS) {
    const candidate = path.join(dir, `${baseName}${ext}`);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

module.exports = {
  listReports,
  findReportByName,
  getReportPreviewPath
};
