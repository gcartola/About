const fs = require('node:fs');
const { spawn } = require('node:child_process');

function openPowerBI(powerBIPath, reportPath) {
  if (!fs.existsSync(powerBIPath)) {
    throw new Error(`Power BI Desktop não encontrado em: ${powerBIPath}`);
  }

  const processRef = spawn(powerBIPath, [reportPath], {
    detached: false,
    stdio: 'ignore'
  });

  processRef.unref();
  return processRef;
}

function closePowerBI(processRef) {
  if (!processRef || processRef.killed) {
    return;
  }

  try {
    processRef.kill('SIGTERM');
  } catch (error) {
    // Ignora falhas de encerramento em plataformas sem sinal SIGTERM.
  }
}

function sendPresentationShortcut(processRef) {
  if (process.platform !== 'win32' || !processRef?.pid) {
    return;
  }

  const command = `Start-Sleep -Milliseconds 3000;` +
    `$wshell = New-Object -ComObject WScript.Shell;` +
    `$null = $wshell.AppActivate(${processRef.pid});` +
    `Start-Sleep -Milliseconds 400;` +
    `$wshell.SendKeys('{F11}')`;

  spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', command], {
    detached: true,
    stdio: 'ignore'
  }).unref();
}

module.exports = {
  openPowerBI,
  closePowerBI,
  sendPresentationShortcut
};
