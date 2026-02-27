const fs = require('node:fs');
const path = require('node:path');

function createLogService(app) {
  const logPath = path.join(app.getPath('userData'), 'openings.log');

  function logReportOpen(reportName) {
    const line = `${new Date().toISOString()} | ${reportName}\n`;
    fs.mkdirSync(path.dirname(logPath), { recursive: true });
    fs.appendFileSync(logPath, line, 'utf8');
  }

  return {
    logPath,
    logReportOpen
  };
}

module.exports = {
  createLogService
};
