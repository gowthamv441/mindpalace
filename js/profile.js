const Profile = {
  ranks: ['E', 'D', 'C', 'B', 'A', 'S'],
  classes: ['Fighter', 'Mage', 'Assassin', 'Healer', 'Tank', 'Ranger'],

  init() {},

  getProfile() {
    const saved = Store.get('hunter_profile');
    if (saved) return saved;
    return {
      hunterName: 'Gowtham',
      hunterClass: 'Fighter',
      rank: 'E',
      level: 1,
      bio: '',
      stats: { strength: 10, intelligence: 10, discipline: 10, vitality: 10, agility: 10 }
    };
  },

  saveProfile(data) {
    Store.set('hunter_profile', data);
    Home.render();
  },

  renderStatBar(label, value) {
    return `
      <div class="profile-stat-row">
        <span class="profile-stat-label">${label}</span>
        <div class="profile-stat-bar">
          <div class="profile-stat-fill" style="width: ${value}%"></div>
        </div>
        <span class="profile-stat-val">${value}</span>
      </div>
    `;
  },

  openEditor() {
    const profile = this.getProfile();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'profile-modal';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-title">Edit Hunter Profile</div>

        <div class="form-group">
          <label class="form-label">Hunter Name</label>
          <input class="form-input" id="prof-name" value="${this.escapeHtml(profile.hunterName)}">
        </div>

        <div class="form-group">
          <label class="form-label">Class</label>
          <select class="form-select" id="prof-class">
            ${this.classes.map(c => `<option ${profile.hunterClass === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Rank</label>
          <select class="form-select" id="prof-rank">
            ${this.ranks.map(r => `<option ${profile.rank === r ? 'selected' : ''}>${r}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Level</label>
          <input class="form-input" id="prof-level" type="number" min="1" max="999" value="${profile.level}">
        </div>

        <div class="form-group">
          <label class="form-label">Bio</label>
          <textarea class="form-textarea" id="prof-bio" placeholder="Describe your hunter...">${this.escapeHtml(profile.bio)}</textarea>
        </div>

        <h3 style="font-size: 0.75rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; margin: 16px 0 10px;">Stats (0-100)</h3>

        <div class="form-group">
          <label class="form-label">Strength</label>
          <input class="form-input" id="prof-str" type="number" min="0" max="100" value="${profile.stats.strength}">
        </div>
        <div class="form-group">
          <label class="form-label">Intelligence</label>
          <input class="form-input" id="prof-int" type="number" min="0" max="100" value="${profile.stats.intelligence}">
        </div>
        <div class="form-group">
          <label class="form-label">Discipline</label>
          <input class="form-input" id="prof-dis" type="number" min="0" max="100" value="${profile.stats.discipline}">
        </div>
        <div class="form-group">
          <label class="form-label">Vitality</label>
          <input class="form-input" id="prof-vit" type="number" min="0" max="100" value="${profile.stats.vitality}">
        </div>
        <div class="form-group">
          <label class="form-label">Agility</label>
          <input class="form-input" id="prof-agi" type="number" min="0" max="100" value="${profile.stats.agility}">
        </div>

        <div class="modal-actions">
          <button class="btn btn-ghost" onclick="Profile.closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="Profile.save()">Save</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  save() {
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const data = {
      hunterName: document.getElementById('prof-name').value.trim() || 'Hunter',
      hunterClass: document.getElementById('prof-class').value,
      rank: document.getElementById('prof-rank').value,
      level: clamp(parseInt(document.getElementById('prof-level').value) || 1, 1, 999),
      bio: document.getElementById('prof-bio').value.trim(),
      stats: {
        strength: clamp(parseInt(document.getElementById('prof-str').value) || 0, 0, 100),
        intelligence: clamp(parseInt(document.getElementById('prof-int').value) || 0, 0, 100),
        discipline: clamp(parseInt(document.getElementById('prof-dis').value) || 0, 0, 100),
        vitality: clamp(parseInt(document.getElementById('prof-vit').value) || 0, 0, 100),
        agility: clamp(parseInt(document.getElementById('prof-agi').value) || 0, 0, 100),
      }
    };
    this.closeModal();
    this.saveProfile(data);
  },

  closeModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.remove();
  },

  getTotalHabits() {
    return (Store.get('habits') || []).length;
  },

  getTotalGoals() {
    return (Store.get('goals') || []).length;
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }
};
