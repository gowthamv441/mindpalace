const Store = {
  get(key) {
    try {
      const raw = localStorage.getItem(`mindpalace_${key}`);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(`mindpalace_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error('Store save failed:', e);
    }
  },

  getAll(prefix) {
    const results = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith(`mindpalace_${prefix}`)) {
        try {
          results.push(JSON.parse(localStorage.getItem(k)));
        } catch (e) {}
      }
    }
    return results;
  },

  remove(key) {
    localStorage.removeItem(`mindpalace_${key}`);
  },

  formatDate(date) {
    return date.toISOString().split('T')[0];
  },

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
};
