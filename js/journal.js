const Journal = {
  currentDate: new Date(),
  editing: false,

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
      </div>
      <div class="section-sub">Your thoughts, one day at a time</div>

      <div class="day-nav">
        <button onclick="Journal.prevDay()">&larr;</button>
        <div class="day-title">
          <div class="n">${this.formatDisplayDate(this.currentDate)}</div>
          <div class="status ${entry ? 'complete' : ''}">${entry ? 'Entry written ✓' : ''}</div>
        </div>
        <button onclick="Journal.nextDay()">&rarr;</button>
      </div>

      ${this.renderDiaryPage(entry, dateStr)}

      ${entries.length > 1 ? `
        <div class="panel" style="margin-top: 24px;">
          <div class="corner-bl"></div>
          <div class="corner-br"></div>
          <h2 style="font-size: 0.85rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 14px;">Recent Entries</h2>
          ${entries.filter(e => e.date !== dateStr).slice(0, 5).map(e => this.renderEntryCard(e)).join('')}
        </div>
      ` : ''}
    `;
  },

  renderDiaryPage(entry, dateStr) {
    const content = entry ? entry.content : '';
    const mood = entry ? entry.mood : null;
    const tags = entry && entry.tags ? entry.tags.join(', ') : '';

    return `
      <div class="diary-page">
        <div class="diary-header">
          <div class="diary-date">${dateStr}</div>
          <div class="mood-select" id="mood-select">
            ${['😊', '😌', '😐', '😔', '😤'].map(m => `
              <div class="mood-option ${mood === m ? 'selected' : ''}" data-mood="${m}" onclick="Journal.selectMood(this)">${m}</div>
            `).join('')}
          </div>
        </div>
        <textarea class="diary-textarea" id="journal-content" placeholder="What's on your mind today...">${this.escapeHtml(content)}</textarea>
        <div class="diary-footer">
          <input class="diary-tags" id="journal-tags" placeholder="Tags: work, personal, gratitude..." value="${this.escapeHtml(tags)}">
          <div class="diary-actions">
            ${entry ? `<button class="btn btn-sm btn-danger" onclick="Journal.deleteEntry('${dateStr}')">Delete</button>` : ''}
            <button class="btn btn-sm btn-primary" onclick="Journal.saveEntry('${dateStr}')">Save</button>
          </div>
        </div>
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

    const isNew = !Store.get(`journal_${dateStr}`);

    Store.set(`journal_${dateStr}`, {
      date: dateStr,
      content,
      mood,
      tags,
      updatedAt: new Date().toISOString()
    });

    if (isNew) {
      const result = XP.award('journal', 'Journal entry', XP.rewards.journal);
      XP.showXPGain(result.amount, 'Journal');
    }

    this.render();
  },

  deleteEntry(dateStr) {
    if (!confirm('Delete this journal entry?')) return;
    Store.remove(`journal_${dateStr}`);
    this.render();
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
