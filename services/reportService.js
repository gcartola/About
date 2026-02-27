const fs = require('node:fs');
const path = require('node:path');

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

module.exports = {
  listReports,
  findReportByName
};
