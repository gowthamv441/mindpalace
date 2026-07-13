const Settings = {
  init() {},

  render() {
    const section = document.getElementById('section-settings');
    if (!section) return;
    const config = Sync.getConfig();

    section.innerHTML = `
      <div class="section-header">
        <h2 class="section-title glow-text">Settings</h2>
      </div>
      <div class="section-sub">Sync & configuration</div>

      <div class="panel">
        <div class="corner-bl"></div>
        <div class="corner-br"></div>
        <h3 class="profile-section-title">Cross-Device Sync</h3>
        <p style="font-size: 0.8rem; color: var(--muted); margin-bottom: 16px;">
          Sync your data across devices using a private GitHub Gist. You need a
          <a href="https://github.com/settings/tokens/new?scopes=gist&description=MindPalace" target="_blank" style="color: var(--accent);">Personal Access Token</a> with gist scope.
        </p>

        <div class="form-group">
          <label class="form-label">GitHub Token</label>
          <input class="form-input" id="sync-token" type="password" placeholder="ghp_..." value="${config.token || ''}">
        </div>

        <div class="form-group">
          <label class="form-label">Gist ID (auto-created on first push)</label>
          <input class="form-input" id="sync-gist-id" placeholder="Auto-generated" value="${config.gistId || ''}" readonly>
        </div>

        <button class="btn btn-primary" onclick="Settings.saveSync()" style="margin-bottom: 12px;">Save Token</button>

        <div style="display: flex; gap: 8px; margin-top: 12px;">
          <button class="btn btn-primary" onclick="Settings.pushData()" ${!config.token ? 'disabled' : ''}>Push Data</button>
          <button class="btn btn-ghost" onclick="Settings.pullData()" ${!config.token || !config.gistId ? 'disabled' : ''}>Pull Data</button>
        </div>

        <div id="sync-status" style="font-size: 0.75rem; color: var(--muted); margin-top: 12px;"></div>
      </div>

      <div class="panel" style="margin-top: 20px;">
        <div class="corner-bl"></div>
        <div class="corner-br"></div>
        <h3 class="profile-section-title">Data</h3>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-ghost" onclick="Settings.exportData()">Export JSON</button>
          <button class="btn btn-ghost" onclick="Settings.importData()">Import JSON</button>
        </div>
      </div>

      <div class="panel" style="margin-top: 20px;">
        <div class="corner-bl"></div>
        <div class="corner-br"></div>
        <h3 class="profile-section-title">Danger Zone</h3>
        <button class="btn btn-danger" onclick="Settings.resetAll()">Reset All Data</button>
      </div>
    `;
  },

  saveSync() {
    const token = document.getElementById('sync-token').value.trim();
    const config = Sync.getConfig();
    config.token = token;
    Sync.saveConfig(config);
    Sync.showToast('Token saved', '');
    this.render();
  },

  async pushData() {
    const status = document.getElementById('sync-status');
    status.textContent = 'Pushing...';
    status.style.color = 'var(--muted)';
    try {
      await Sync.push();
      status.textContent = 'Push complete! ' + new Date().toLocaleTimeString();
      status.style.color = 'var(--accent)';
      this.render();
    } catch (e) {
      status.textContent = 'Error: ' + e.message;
      status.style.color = 'var(--danger)';
    }
  },

  async pullData() {
    const status = document.getElementById('sync-status');
    status.textContent = 'Pulling...';
    status.style.color = 'var(--muted)';
    try {
      const data = await Sync.pull();
      if (!confirm('Replace local data with remote? This will overwrite everything.')) {
        status.textContent = 'Cancelled';
        return;
      }
      Sync.restoreAllData(data);
      status.textContent = 'Pull complete! Reloading...';
      status.style.color = 'var(--accent)';
      setTimeout(() => location.reload(), 1000);
    } catch (e) {
      status.textContent = 'Error: ' + e.message;
      status.style.color = 'var(--danger)';
    }
  },

  exportData() {
    const data = Sync.getAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindpalace_backup_${Store.formatDate(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (!confirm('Replace all local data with imported file?')) return;
          Sync.restoreAllData(data);
          Sync.showToast('Import complete! Reloading...', '');
          setTimeout(() => location.reload(), 1000);
        } catch (err) {
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  },

  resetAll() {
    if (!confirm('Delete ALL Mind Palace data? This cannot be undone.')) return;
    if (!confirm('Are you really sure?')) return;
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('mindpalace_')) keys.push(key);
    }
    keys.forEach(k => localStorage.removeItem(k));
    location.reload();
  }
};
