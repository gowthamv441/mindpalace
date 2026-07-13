const Journal = {
  currentDate: new Date(),

  init() {
    this.render();
  },

  render() {
    const section = document.getElementById('section-journal');
    const dateStr = Store.formatDate(this.currentDate);
    const entry = Store.get(`journal_${dateStr}`);
    const entries = this.getAllEntries();

    section.innerHTML = `
      <div class="section-header">
        <h2 class="section-title glow-text">Journal</h2>
        <button class="btn btn-primary" onclick="Journal.openEditor()">+ New Entry</button>
      </div>
      <div class="section-sub">Your thoughts, one day at a time</div>

      <div class="day-nav">
        <button onclick="Journal.prevDay()">&larr;</button>
        <div class="day-title">
          <div class="n">${this.formatDisplayDate(this.currentDate)}</div>
          <div class="status ${entry ? 'complete' : ''}">${entry ? 'Entry written ✓' : 'No entry yet'}</div>
        </div>
        <button onclick="Journal.nextDay()">&rarr;</button>
      </div>

      ${entry ? this.renderEntry(entry) : this.renderEmpty()}

      ${entries.length > 0 ? `
        <div class="panel" style="margin-top: 24px;">
          <div class="corner-bl"></div>
          <div class="corner-br"></div>
          <h2 style="font-size: 0.85rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 14px;">Recent Entries</h2>
          ${entries.slice(0, 7).map(e => this.renderEntryCard(e)).join('')}
        </div>
      ` : ''}
    `;
  },

  renderEntry(entry) {
    return `
      <div class="card" style="border-color: rgba(76, 201, 255, 0.3); box-shadow: var(--accent-glow);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.3rem;">${entry.mood || ''}</span>
            <span class="badge badge-accent">${entry.mood ? this.moodLabel(entry.mood) : ''}</span>
          </div>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-sm btn-ghost" onclick="Journal.openEditor('${entry.date}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="Journal.deleteEntry('${entry.date}')">Delete</button>
          </div>
        </div>
        <div style="font-size: 0.9rem; line-height: 1.7; white-space: pre-wrap;">${this.escapeHtml(entry.content)}</div>
        ${entry.tags && entry.tags.length ? `
          <div style="margin-top: 12px; display: flex; gap: 6px; flex-wrap: wrap;">
            ${entry.tags.map(t => `<span class="badge badge-success">${t}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    `;
  },

  renderEntryCard(entry) {
    const isActive = entry.date === Store.formatDate(this.currentDate);
    return `
      <div class="card" style="cursor: pointer; ${isActive ? 'border-color: var(--accent); box-shadow: var(--accent-glow);' : ''}" onclick="Journal.goToDate('${entry.date}')">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <span>${entry.mood || '📝'}</span>
          <span style="font-size: 0.8rem; font-weight: 500; color: var(--accent);">${entry.date}</span>
        </div>
        <div style="font-size: 0.8rem; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${this.escapeHtml(entry.content.substring(0, 80))}${entry.content.length > 80 ? '...' : ''}
        </div>
      </div>
    `;
  },

  renderEmpty() {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <div class="empty-state-text">No entry for this day</div>
        <button class="btn btn-primary" onclick="Journal.openEditor()">Write something</button>
      </div>
    `;
  },

  openEditor(editDate) {
    const dateStr = editDate || Store.formatDate(this.currentDate);
    const existing = Store.get(`journal_${dateStr}`);

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'journal-modal';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-title">${existing ? 'Edit Entry' : 'New Entry'} — ${dateStr}</div>

        <div class="form-group">
          <label class="form-label">How are you feeling?</label>
          <div class="mood-select" id="mood-select">
            ${['😊', '😌', '😐', '😔', '😤'].map(m => `
              <div class="mood-option ${existing && existing.mood === m ? 'selected' : ''}" data-mood="${m}" onclick="Journal.selectMood(this)">${m}</div>
            `).join('')}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">What's on your mind?</label>
          <textarea class="form-textarea" id="journal-content" placeholder="Write freely...">${existing ? this.escapeHtml(existing.content) : ''}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Tags (comma separated)</label>
          <input class="form-input" id="journal-tags" placeholder="e.g. work, personal, gratitude" value="${existing && existing.tags ? existing.tags.join(', ') : ''}">
        </div>

        <div class="modal-actions">
          <button class="btn btn-ghost" onclick="Journal.closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="Journal.saveEntry('${dateStr}')">Save</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  selectMood(el) {
    document.querySelectorAll('#mood-select .mood-option').forEach(e => e.classList.remove('selected'));
    el.classList.add('selected');
  },

  saveEntry(dateStr) {
    const content = document.getElementById('journal-content').value.trim();
    if (!content) return;

    const moodEl = document.querySelector('#mood-select .mood-option.selected');
    const mood = moodEl ? moodEl.dataset.mood : null;
    const tagsRaw = document.getElementById('journal-tags').value;
    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

    Store.set(`journal_${dateStr}`, {
      date: dateStr,
      content,
      mood,
      tags,
      updatedAt: new Date().toISOString()
    });

    this.closeModal();
    this.render();
  },

  deleteEntry(dateStr) {
    if (!confirm('Delete this journal entry?')) return;
    Store.remove(`journal_${dateStr}`);
    this.render();
  },

  closeModal() {
    const modal = document.getElementById('journal-modal');
    if (modal) modal.remove();
  },

  prevDay() {
    this.currentDate.setDate(this.currentDate.getDate() - 1);
    this.render();
  },

  nextDay() {
    this.currentDate.setDate(this.currentDate.getDate() + 1);
    this.render();
  },

  goToDate(dateStr) {
    this.currentDate = new Date(dateStr + 'T12:00:00');
    this.render();
  },

  getAllEntries() {
    const entries = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('mindpalace_journal_')) {
        try {
          entries.push(JSON.parse(localStorage.getItem(key)));
        } catch (e) {}
      }
    }
    return entries.sort((a, b) => b.date.localeCompare(a.date));
  },

  formatDisplayDate(date) {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  },

  moodLabel(mood) {
    const labels = { '😊': 'Happy', '😌': 'Calm', '😐': 'Neutral', '😔': 'Low', '😤': 'Frustrated' };
    return labels[mood] || '';
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};
