const Achievements = {
  init() {
    this.render();
  },

  getAchievements() {
    return Store.get('achievements') || [];
  },

  saveAchievements(items) {
    Store.set('achievements', items);
  },

  render() {
    const section = document.getElementById('section-achievements');
    const achievements = this.getAchievements();

    const grouped = {};
    achievements.forEach(a => {
      const year = a.date ? a.date.substring(0, 4) : 'Undated';
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(a);
    });

    const years = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    section.innerHTML = `
      <div class="section-header">
        <h2 class="section-title glow-text">Achievements</h2>
        <button class="btn btn-primary" onclick="Achievements.openEditor()">+ Add</button>
      </div>
      <div class="section-sub">Record your wins — big or small</div>

      ${achievements.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">🏆</div>
          <div class="empty-state-text">No achievements logged yet. Start recording your victories.</div>
          <button class="btn btn-primary" onclick="Achievements.openEditor()">Add Achievement</button>
        </div>
      ` : ''}

      ${years.map(year => `
        <div class="panel" style="margin-bottom: 16px;">
          <div class="corner-bl"></div>
          <div class="corner-br"></div>
          <h2 style="font-size: 0.85rem; color: var(--accent); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 14px; border-bottom: 1px solid rgba(76,201,255,0.2); padding-bottom: 8px;">${year}</h2>
          ${grouped[year].map(a => this.renderCard(a)).join('')}
        </div>
      `).join('')}
    `;
  },

  renderCard(achievement) {
    const icons = {
      career: '💼',
      personal: '🌟',
      fitness: '💪',
      learning: '📚',
      creative: '🎨',
      social: '🤝',
      other: '🏆'
    };
    const icon = icons[achievement.category] || '🏆';

    return `
      <div class="card">
        <div class="achievement-card">
          <div class="achievement-icon">${icon}</div>
          <div class="achievement-info">
            <div class="achievement-title">${this.escapeHtml(achievement.title)}</div>
            ${achievement.description ? `<div class="achievement-desc">${this.escapeHtml(achievement.description)}</div>` : ''}
            <div class="achievement-date">
              <span style="color: var(--accent);">${achievement.date || 'No date'}</span>
              <span class="badge badge-accent" style="margin-left: 6px;">${achievement.category || 'other'}</span>
            </div>
          </div>
          <div style="display: flex; gap: 4px;">
            <button class="btn btn-sm btn-ghost" onclick="Achievements.openEditor('${achievement.id}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="Achievements.deleteAchievement('${achievement.id}')">×</button>
          </div>
        </div>
      </div>
    `;
  },

  openEditor(editId) {
    const achievements = this.getAchievements();
    const existing = editId ? achievements.find(a => a.id === editId) : null;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'achievements-modal';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-title">${existing ? 'Edit Achievement' : 'New Achievement'}</div>

        <div class="form-group">
          <label class="form-label">What did you achieve?</label>
          <input class="form-input" id="ach-title" placeholder="e.g. Got promoted to Senior" value="${existing ? this.escapeHtml(existing.title) : ''}">
        </div>

        <div class="form-group">
          <label class="form-label">Details (optional)</label>
          <textarea class="form-textarea" id="ach-desc" style="min-height: 60px;" placeholder="What made this special...">${existing ? this.escapeHtml(existing.description || '') : ''}</textarea>
        </div>

        <div style="display: flex; gap: 10px;">
          <div class="form-group" style="flex: 1;">
            <label class="form-label">Category</label>
            <select class="form-select" id="ach-category">
              <option value="career" ${existing && existing.category === 'career' ? 'selected' : ''}>Career</option>
              <option value="personal" ${existing && existing.category === 'personal' ? 'selected' : ''}>Personal</option>
              <option value="fitness" ${existing && existing.category === 'fitness' ? 'selected' : ''}>Fitness</option>
              <option value="learning" ${existing && existing.category === 'learning' ? 'selected' : ''}>Learning</option>
              <option value="creative" ${existing && existing.category === 'creative' ? 'selected' : ''}>Creative</option>
              <option value="social" ${existing && existing.category === 'social' ? 'selected' : ''}>Social</option>
              <option value="other" ${existing && existing.category === 'other' ? 'selected' : ''}>Other</option>
            </select>
          </div>
          <div class="form-group" style="flex: 1;">
            <label class="form-label">Date</label>
            <input class="form-input" id="ach-date" type="date" value="${existing && existing.date ? existing.date : Store.formatDate(new Date())}">
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-ghost" onclick="Achievements.closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="Achievements.saveAchievement('${editId || ''}')">Save</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  saveAchievement(editId) {
    const title = document.getElementById('ach-title').value.trim();
    if (!title) return;

    const achievements = this.getAchievements();
    const data = {
      id: editId || Store.generateId(),
      title,
      description: document.getElementById('ach-desc').value.trim(),
      category: document.getElementById('ach-category').value,
      date: document.getElementById('ach-date').value || null,
      createdAt: new Date().toISOString()
    };

    if (editId) {
      const idx = achievements.findIndex(a => a.id === editId);
      if (idx >= 0) {
        data.createdAt = achievements[idx].createdAt;
        achievements[idx] = data;
      }
    } else {
      achievements.unshift(data);
    }

    this.saveAchievements(achievements);
    this.closeModal();
    this.render();
  },

  deleteAchievement(id) {
    if (!confirm('Delete this achievement?')) return;
    const achievements = this.getAchievements().filter(a => a.id !== id);
    this.saveAchievements(achievements);
    this.render();
  },

  closeModal() {
    const modal = document.getElementById('achievements-modal');
    if (modal) modal.remove();
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};
