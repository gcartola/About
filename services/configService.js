const fs = require('node:fs');
const path = require('node:path');

function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

function createConfigService(app) {
  const configPath = path.join(app.getPath('userData'), 'config.json');
  const defaultConfigPath = path.join(__dirname, '..', 'config', 'default.json');

  function getConfig() {
    const defaults = readJsonFile(defaultConfigPath) || {};
    const stored = readJsonFile(configPath) || {};
    return { ...defaults, ...stored };
  }

  function saveConfig(partial) {
    const merged = { ...getConfig(), ...partial };
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(merged, null, 2), 'utf8');
    return merged;
  }

  return {
    getConfig,
    saveConfig,
    configPath
  };
}

module.exports = {
  createConfigService
};
