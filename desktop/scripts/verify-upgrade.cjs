'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { once } = require('node:events');
const { createHash } = require('node:crypto');
const { spawn } = require('node:child_process');

async function verify([previous, resources, assets, scratch, installFlag]) {
  assert(previous && resources && assets && scratch);
  assert(installFlag === undefined || installFlag === '--install');
  const old = require(path.resolve(previous, 'package.json'));
  const { NsisUpdater } = require(path.resolve(previous, 'node_modules/electron-updater'));
  const { ElectronHttpExecutor } = require(path.resolve(previous, 'node_modules/electron-updater/out/electronHttpExecutor'));
  const { HttpExecutor } = require(path.resolve(previous, 'node_modules/builder-util-runtime'));
  const { load } = require(path.resolve(previous, 'node_modules/js-yaml'));
  const previousConfig = path.resolve(resources, 'app-update.yml');
  const { owner, repo, provider } = load(fs.readFileSync(previousConfig, 'utf8'));
  assert.equal(provider, 'github');
  const tag = 'v0.3.6.5';
  const release = `/${owner}/${repo}/releases`;
  const manifest = fs.readFileSync(path.join(assets, 'latest.yml'));
  const info = load(manifest.toString());
  const setup = info.files.find(file => file.url === 'ApexAI-Setup-0.3.6.5-x64.exe');
  assert(setup);
  const installer = path.join(assets, setup.url);
  const requests = new Set();

  const server = http.createServer((request, response) => {
    const url = new URL(request.url, 'http://127.0.0.1');
    requests.add(url.pathname);
    if (url.pathname === release + '.atom') {
      return response.end(`<feed><entry><link href="https://github.com${release}/tag/${tag}"/><title>Apex AI 0.3.6.5</title><content>Stint repair</content></entry></feed>`);
    }
    if (url.pathname === release + '/latest') return response.end(JSON.stringify({ tag_name: tag }));
    if (url.pathname === `${release}/download/${tag}/latest.yml`) return response.end(manifest);
    if (url.pathname === `${release}/download/${tag}/${setup.url}`) {
      response.writeHead(200, { 'Content-Length': fs.statSync(installer).size });
      fs.createReadStream(installer).pipe(response);
      return;
    }
    response.writeHead(404).end();
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    class TestHttpExecutor extends HttpExecutor {
      createRequest(options, callback) {
        assert.equal(options.hostname, 'github.com');
        return http.request({ ...options, protocol: 'http:', hostname: '127.0.0.1', port: server.address().port }, callback);
      }
      download(...args) {
        return ElectronHttpExecutor.prototype.download.apply(this, args);
      }
    }
    const isolated = fs.mkdtempSync(path.join(path.resolve(scratch), 'updater-'));
    let quit;
    const updater = new NsisUpdater(null, {
      version: old.version,
      isPackaged: true,
      name: 'Apex AI',
      get isReady() { return true; },
      whenReady: async () => {},
      userDataPath: isolated,
      baseCachePath: isolated,
      appUpdateConfigPath: previousConfig,
      onQuit: handler => { quit = handler; }
    });
    updater.httpExecutor = new TestHttpExecutor();
    let available = 0;
    let downloaded = 0;
    let launched;
    let processResult;
    updater.on('update-available', () => available++);
    updater.on('update-downloaded', () => downloaded++);
    updater.spawnLog = async (file, args) => {
      assert.equal(launched, undefined);
      launched = { file, args };
      if (installFlag === '--install') {
        const child = spawn(file, args, { windowsHide: true, stdio: 'ignore' });
        processResult = once(child, 'exit');
        await once(child, 'spawn');
      }
    };
    const update = await updater.checkForUpdates();
    assert.equal(update.updateInfo.version, info.version);
    assert.equal(update.updateInfo.tag, tag);
    assert(update.downloadPromise);
    const [file] = await update.downloadPromise;
    assert.equal(available, 1);
    assert.equal(downloaded, 1);
    assert.equal(fs.statSync(file).size, setup.size);
    assert.equal(createHash('sha512').update(fs.readFileSync(file)).digest('base64'), setup.sha512);
    assert(requests.has(`${release}/download/${tag}/${setup.url}`));
    assert.equal(typeof quit, 'function');
    quit(0);
    quit(0);
    assert.equal(launched.file, file);
    assert.deepEqual(launched.args, ['--updated', '/S']);
    console.log(`PASS: ${old.version} found ${tag}, downloaded and validated the NSIS installer, triggered a single silent install on quit.`);
    if (processResult) {
      const [exitCode] = await processResult;
      assert.equal(exitCode, 0);
      console.log('PASS: NSIS updater process exited with code 0.');
    }
  } finally {
    server.close();
  }
}

verify(process.argv.slice(2)).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
