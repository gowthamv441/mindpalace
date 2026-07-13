const Sync = {
  getConfig() {
    return Store.get('sync_config') || { token: '', gistId: '' };
  },

  saveConfig(config) {
    Store.set('sync_config', config);
  },

  isConfigured() {
    const config = this.getConfig();
    return !!(config.token && config.gistId);
  },

  getAllData() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('mindpalace_')) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key));
        } catch (e) {
          data[key] = localStorage.getItem(key);
        }
      }
    }
    data._syncedAt = new Date().toISOString();
    return data;
  },

  restoreAllData(data) {
    const syncConfig = this.getConfig();

    const keysToKeep = new Set();
    Object.keys(data).forEach(key => {
      if (key === '_syncedAt') return;
      keysToKeep.add(key);
      try {
        localStorage.setItem(key, JSON.stringify(data[key]));
      } catch (e) {
        localStorage.setItem(key, data[key]);
      }
    });

    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key.startsWith('mindpalace_') && !keysToKeep.has(key) && key !== 'mindpalace_sync_config') {
        localStorage.removeItem(key);
      }
    }

    this.saveConfig(syncConfig);
  },

  async push() {
    const config = this.getConfig();
    if (!config.token) throw new Error('No token configured');

    const data = this.getAllData();
    const content = JSON.stringify(data, null, 2);

    if (config.gistId) {
      const res = await fetch(`https://api.github.com/gists/${config.gistId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          files: { 'mindpalace_data.json': { content } }
        })
      });
      if (!res.ok) throw new Error(`Push failed: ${res.status}`);
      return await res.json();
    } else {
      const res = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: 'Mind Palace Data',
          public: false,
          files: { 'mindpalace_data.json': { content } }
        })
      });
      if (!res.ok) throw new Error(`Create gist failed: ${res.status}`);
      const result = await res.json();
      config.gistId = result.id;
      this.saveConfig(config);
      return result;
    }
  },

  async pull() {
    const config = this.getConfig();
    if (!config.token || !config.gistId) throw new Error('Sync not configured');

    const res = await fetch(`https://api.github.com/gists/${config.gistId}`, {
      headers: { 'Authorization': `Bearer ${config.token}` }
    });
    if (!res.ok) throw new Error(`Pull failed: ${res.status}`);

    const gist = await res.json();
    const file = gist.files['mindpalace_data.json'];
    if (!file) throw new Error('No data file found in gist');

    const data = JSON.parse(file.content);
    return data;
  },

  showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `xp-toast ${type || ''}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }
};
