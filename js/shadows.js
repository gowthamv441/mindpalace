const Shadows = {
  types: {
    knight: { icon: '&#9876;', label: 'Shadow Knight' },
    mage: { icon: '&#9733;', label: 'Shadow Mage' },
    assassin: { icon: '&#9760;', label: 'Shadow Assassin' },
    healer: { icon: '&#9829;', label: 'Shadow Healer' },
    tank: { icon: '&#9670;', label: 'Shadow Tank' },
    ranger: { icon: '&#10148;', label: 'Shadow Ranger' }
  },

  getShadows() {
    return Store.get('shadow_army') || [];
  },

  saveShadows(shadows) {
    Store.set('shadow_army', shadows);
  },

  addShadow(config) {
    const shadows = this.getShadows();
    shadows.push({
      id: Store.generateId(),
      name: config.name,
      type: config.type || 'knight',
      source: config.source || '',
      rank: config.rank || 'D',
      acquiredAt: new Date().toISOString()
    });
    this.saveShadows(shadows);
    this.showShadowGain(config.name);
  },

  showShadowGain(name) {
    const toast = document.createElement('div');
    toast.className = 'xp-toast level-up';
    toast.innerHTML = `<span class="xp-toast-icon">&#9876;</span> Shadow Acquired: ${name}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  getPassiveBonus() {
    const shadows = this.getShadows();
    const count = shadows.length;
    if (count >= 30) return 0.3;
    if (count >= 20) return 0.2;
    if (count >= 10) return 0.1;
    if (count >= 5) return 0.05;
    return 0;
  },

  getShadowTypeForGoal(goal) {
    const title = (goal.title || '').toLowerCase();
    if (title.includes('workout') || title.includes('fitness') || title.includes('run') || title.includes('gym')) return 'knight';
    if (title.includes('read') || title.includes('learn') || title.includes('study') || title.includes('course')) return 'mage';
    if (title.includes('speed') || title.includes('quick') || title.includes('agile')) return 'assassin';
    if (title.includes('health') || title.includes('mental') || title.includes('meditat')) return 'healer';
    if (title.includes('endur') || title.includes('persist') || title.includes('discipline')) return 'tank';
    return 'ranger';
  },

  getRankForGoal(goal) {
    if (goal.category === 'long') return 'B';
    return 'C';
  },

  renderArmy() {
    const shadows = this.getShadows();
    if (shadows.length === 0) {
      return `
        <div class="empty-state" style="padding: 30px;">
          <div class="empty-state-icon">&#9876;</div>
          <div class="empty-state-text">No shadows yet. Complete goals to build your army.</div>
        </div>
      `;
    }

    return `
      <div class="shadow-grid">
        ${shadows.map(s => {
          const typeInfo = this.types[s.type] || this.types.knight;
          return `
            <div class="shadow-card">
              <div class="shadow-icon">${typeInfo.icon}</div>
              <div class="shadow-name">${s.name}</div>
              <div class="shadow-meta">${typeInfo.label} &bull; ${s.rank}-Rank</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
};
