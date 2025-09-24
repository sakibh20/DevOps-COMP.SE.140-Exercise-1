const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

const app = express();

const LOG_FILE = '/vStorage';
//fs.mkdirSync(VOLUME_PATH, { recursive: true });
//const LOG_FILE = path.join(VOLUME_PATH, 'logs.txt');

async function getFreeDiskInMB() {
  try {
    const { stdout } = await execAsync('df -k /');
    const parts = stdout.trim().split('\n')[1].split(/\s+/);
    const availKB = parseInt(parts[3], 10);
    return Math.round(availKB / 1024);
  } catch (e) {
    return null;
  }
}

function getUptimeHours() {
  return (process.uptime() / 3600).toFixed(2);
}

async function createTimestamp1Record() {
  const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');;
  const uptime = getUptimeHours();
  const freeMB = await getFreeDiskInMB();

  return `Timestamp1: ${timestamp}: uptime ${uptime} hours, free disk in root: ${freeMB ?? 'unknown'} MBytes`;
}

async function postToStorage(record) {
  try {
    await axios.post('http://storage:5000/log', record, {
      headers: { 'Content-Type': 'text/plain' }
    });
  } catch (err) {
    console.warn('Could not POST to Storage:', err.message);
  }
}

function writeToVStorage(record) {
  fs.appendFileSync(LOG_FILE, record + '\n');
}

app.get('/status', async (req, res) => {
  try {
    const ts1 = await createTimestamp1Record();
    await postToStorage(ts1);

    writeToVStorage(ts1);

    let ts2 = '';
    try {
      const resp = await axios.get('http://app:5000/status', { responseType: 'text', timeout: 2000 });
      ts2 = resp.data;
    } catch (err) {
      ts2 = 'Service2 unavailable';
    }

    const combined = `${ts1}\n${ts2}`;
    res.set('Content-Type', 'text/plain');
    res.send(combined);

  } catch (err) {
    res.status(500).send('Error generating status');
  }
});

app.get('/log', async (req, res) => {
  try {
    const resp = await axios.get('http://storage:5000/log', { responseType: 'text', timeout: 2000 });
    res.set('Content-Type', 'text/plain');
    res.send(resp.data);
  } catch (err) {
    res.status(500).send('Storage unavailable');
  }
});

app.listen(3000, () => {
  console.log('Gateway listening on port 3000');
});
