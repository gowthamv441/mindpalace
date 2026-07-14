const Shadows = {
  ranks: [
    { name: 'Soldier', minXP: 0, icon: '&#9876;' },
    { name: 'Knight', minXP: 100, icon: '&#9813;' },
    { name: 'Commander', minXP: 300, icon: '&#9814;' },
    { name: 'General', minXP: 700, icon: '&#9812;' },
    { name: 'Chief', minXP: 1500, icon: '&#9775;' }
  ],

  getSoldiers() {
    return Store.get('shadow_soldiers') || [];
  },

  saveSoldiers(soldiers) {
    Store.set('shadow_soldiers', soldiers);
  },

  getSoldier(id) {
    return this.getSoldiers().find(s => s.id === id);
  },

  addSoldier(name, category) {
    const soldiers = this.getSoldiers();
    if (soldiers.find(s => s.name.toLowerCase() === name.toLowerCase())) return;
    soldiers.push({
      id: Store.generateId(),
      name,
      category,
      xp: 0,
      createdAt: new Date().toISOString()
    });
    this.saveSoldiers(soldiers);
  },

  awardXP(soldierId, amount) {
    const soldiers = this.getSoldiers();
    const soldier = soldiers.find(s => s.id === soldierId);
    if (!soldier) return;

    const oldRank = this.getRank(soldier.xp);
    soldier.xp += amount;
    const newRank = this.getRank(soldier.xp);

    this.saveSoldiers(soldiers);

    if (newRank.name !== oldRank.name) {
      this.showRankUp(soldier.name, newRank.name);
    }
  },

  awardXPByCategory(category, amount) {
    const soldiers = this.getSoldiers();
    const matching = soldiers.filter(s => s.category === category);
    matching.forEach(s => {
      const oldRank = this.getRank(s.xp);
      s.xp += amount;
      const newRank = this.getRank(s.xp);
      if (newRank.name !== oldRank.name) {
        this.showRankUp(s.name, newRank.name);
      }
    });
    if (matching.length > 0) this.saveSoldiers(soldiers);
  },

  getRank(xp) {
    let rank = this.ranks[0];
    for (const r of this.ranks) {
      if (xp >= r.minXP) rank = r;
    }
    return rank;
  },

  getNextRank(xp) {
    for (const r of this.ranks) {
      if (xp < r.minXP) return r;
    }
    return null;
  },

  showRankUp(soldierName, rankName) {
    const toast = document.createElement('div');
    toast.className = 'xp-toast level-up';
    toast.innerHTML = `<span class="xp-toast-icon">&#9876;</span> ${soldierName} promoted to ${rankName}!`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  getPassiveBonus() {
    const soldiers = this.getSoldiers();
    let bonus = 0;
    soldiers.forEach(s => {
      const rank = this.getRank(s.xp);
      const idx = this.ranks.indexOf(rank);
      bonus += idx * 0.02;
    });
    return Math.min(bonus, 0.5);
  },

  openEditor() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'shadow-modal';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-title">Add Shadow Soldier</div>
        <div class="form-group">
          <label class="form-label">Soldier Name</label>
          <input class="form-input" id="shadow-name" placeholder="e.g. Workout Warrior">
        </div>
        <div class="form-group">
          <label class="form-label">Skill Category</label>
          <select class="form-select" id="shadow-category">
            <option value="workout">Workout / Fitness</option>
            <option value="communication">Communication</option>
            <option value="problem_solving">Problem Solving</option>
            <option value="discipline">Discipline</option>
            <option value="creativity">Creativity</option>
            <option value="leadership">Leadership</option>
            <option value="technical">Technical Skills</option>
            <option value="health">Health / Nutrition</option>
            <option value="finance">Finance</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" onclick="Shadows.closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="Shadows.saveSoldier()">Create</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  saveSoldier() {
    const name = document.getElementById('shadow-name').value.trim();
    const category = document.getElementById('shadow-category').value;
    if (!name) return;
    this.addSoldier(name, category);
    this.closeModal();
    if (App.currentSection === 'home') Home.render();
  },

  closeModal() {
    const modal = document.getElementById('shadow-modal');
    if (modal) modal.remove();
  },

  deleteSoldier(id) {
    if (!confirm('Remove this shadow soldier?')) return;
    this.saveSoldiers(this.getSoldiers().filter(s => s.id !== id));
    if (App.currentSection === 'home') Home.render();
  },

  renderArmy() {
    const soldiers = this.getSoldiers();
    if (soldiers.length === 0) {
      return `
        <div class="empty-state" style="padding: 20px;">
          <div class="empty-state-icon">&#9876;</div>
          <div class="empty-state-text">No soldiers yet. Add your skill-based shadows.</div>
          <button class="btn btn-primary" onclick="Shadows.openEditor()">+ Add Soldier</button>
        </div>
      `;
    }

    return `
      <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
        <button class="btn btn-sm btn-primary" onclick="Shadows.openEditor()">+ Add</button>
      </div>
      <div class="shadow-grid">
        ${soldiers.map(s => {
          const rank = this.getRank(s.xp);
          const nextRank = this.getNextRank(s.xp);
          const progress = nextRank ? Math.round(((s.xp - rank.minXP) / (nextRank.minXP - rank.minXP)) * 100) : 100;
          return `
            <div class="shadow-card">
              <div class="shadow-icon">${rank.icon}</div>
              <div class="shadow-name">${s.name}</div>
              <div class="shadow-meta">${rank.name}</div>
              <div class="progress-bar" style="height: 4px; margin-top: 6px;">
                <div class="progress-fill" style="width: ${progress}%"></div>
              </div>
              <div style="font-size: 0.5rem; color: var(--muted); margin-top: 3px;">${s.xp} XP${nextRank ? ` / ${nextRank.minXP}` : ' MAX'}</div>
              <button class="btn btn-sm btn-danger" style="margin-top: 6px; padding: 2px 6px; font-size: 0.6rem;" onclick="Shadows.deleteSoldier('${s.id}')">×</button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
};
