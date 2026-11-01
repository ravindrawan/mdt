const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

function renderPdf(url) {
  const executablePath = findBrowser();
  if (!executablePath) {
    const error = new Error('Chrome or Edge was not found. Set CHROME_PATH to a browser executable.');
    error.code = 'BROWSER_MISSING';
    throw error;
  }
  const output = path.join(os.tmpdir(), `retreat-${Date.now()}-${Math.random().toString(16).slice(2)}.pdf`);
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--no-pdf-header-footer',
    '--virtual-time-budget=15000',
    `--print-to-pdf=${output}`,
    url
  ];
  return new Promise((resolve, reject) => {
    const child = spawn(executablePath, args, { windowsHide: true });
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error('The PDF render took too long.'));
    }, 45000);
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (!fs.existsSync(output)) {
        reject(new Error(stderr.trim() || `Browser exited with code ${code}`));
        return;
      }
      try {
        const pdf = fs.readFileSync(output);
        fs.unlink(output, () => {});
        resolve(pdf);
      } catch (error) {
        reject(error);
      }
    });
  });
}

module.exports = { findBrowser, renderPdf };
