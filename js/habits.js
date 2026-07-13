const Habits = {
  currentDay: 1,

  init() {
    if (!Store.get('habits_list')) {
      Store.set('habits_list', [
        { id: 'eat', label: 'Eat clean' },
        { id: 'water', label: 'Drink 2 litres of water' },
        { id: 'upskill', label: 'Upskill 1 hour' },
        { id: 'meditate', label: 'Meditate 30 mins' },
        { id: 'sleep', label: 'Sleep 7 hours' },
        { id: 'workout', label: 'Workout' },
      ]);
    }
    const saved = Store.get('habits_state');
    if (saved && saved.currentDay) this.currentDay = saved.currentDay;
    this.render();
  },

  getHabits() {
    return Store.get('habits_list') || [];
  },

  getDayData(day) {
    return Store.get(`habits_day_${day}`) || {};
  },

  setDayData(day, data) {
    Store.set(`habits_day_${day}`, data);
  },

  isDayComplete(day) {
    const habits = this.getHabits();
    const data = this.getDayData(day);
    return habits.length > 0 && habits.every(h => data[h.id]);
  },

  completedCount(day) {
    const habits = this.getHabits();
    const data = this.getDayData(day);
    return habits.filter(h => data[h.id]).length;
  },

  calcStats() {
    const TOTAL = 75;
    let fullDays = 0;
    let currentStreak = 0;
    let streakBroken = false;
    for (let i = 1; i <= TOTAL; i++) {
      if (this.isDayComplete(i)) {
        fullDays++;
        if (!streakBroken) currentStreak++;
      } else {
        streakBroken = true;
      }
    }
    const pct = Math.round((fullDays / TOTAL) * 100);
    return { fullDays, currentStreak, pct };
  },

  render() {
    const section = document.getElementById('section-habits');
    const TOTAL = 75;
    const day = this.currentDay;
    const habits = this.getHabits();
    const dayData = this.getDayData(day);
    const complete = this.isDayComplete(day);
    const { fullDays, currentStreak, pct } = this.calcStats();

    let gridCells = '';
    for (let i = 1; i <= TOTAL; i++) {
      const c = this.completedCount(i);
      let cls = 'cell';
      if (c === habits.length) cls += ' complete';
      else if (c > 0) cls += ' partial';
      if (i === day) cls += ' today';
      gridCells += `<div class="${cls}" onclick="Habits.goToDay(${i})">${i}</div>`;
    }

    let habitsHtml = '';
    habits.forEach(h => {
      const done = !!dayData[h.id];
      habitsHtml += `
        <div class="habit-item ${done ? 'done' : ''}" onclick="Habits.toggle('${h.id}')">
          <div class="habit-check">${done ? '✓' : ''}</div>
          <div class="habit-label">${h.label}</div>
        </div>`;
    });

    section.innerHTML = `
      <div class="section-header">
        <h2 class="section-title glow-text">75 Hard</h2>
        <button class="btn btn-primary" onclick="Habits.openManage()">Manage</button>
      </div>
      <div class="section-sub">${habits.length} habits · 75 days · no exceptions</div>

      <div class="panel">
        <div class="corner-bl"></div>
        <div class="corner-br"></div>
        <div class="stats-row">
          <div class="stat"><div class="num">${fullDays}/75</div><div class="label">Days Done</div></div>
          <div class="stat"><div class="num">${currentStreak}</div><div class="label">Streak</div></div>
          <div class="stat"><div class="num">${pct}%</div><div class="label">Progress</div></div>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      </div>

      <div class="day-nav">
        <button onclick="Habits.goToDay(${day - 1})" ${day <= 1 ? 'disabled' : ''}>&larr;</button>
        <div class="day-title">
          <div class="n">Day ${day} / ${TOTAL}</div>
          <div class="status ${complete ? 'complete' : ''}">${complete ? 'Complete ✓' : this.completedCount(day) + '/' + habits.length + ' done'}</div>
        </div>
        <button onclick="Habits.goToDay(${day + 1})" ${day >= TOTAL ? 'disabled' : ''}>&rarr;</button>
      </div>

      <div style="margin-bottom: 20px;">${habitsHtml}</div>

      <div class="grid-section">
        <h2>All 75 Days</h2>
        <div class="grid">${gridCells}</div>
      </div>

      <button class="reset-btn" onclick="Habits.resetAll()">Reset all progress</button>
    `;
  },

  toggle(habitId) {
    const day = this.currentDay;
    const dayData = this.getDayData(day);
    dayData[habitId] = !dayData[habitId];
    this.setDayData(day, dayData);
    this.render();
  },

  goToDay(n) {
    if (n < 1 || n > 75) return;
    this.currentDay = n;
    Store.set('habits_state', { currentDay: n });
    this.render();
  },

  resetAll() {
    if (!confirm('Reset all 75 Hard progress? This cannot be undone.')) return;
    for (let i = 1; i <= 75; i++) {
      Store.remove(`habits_day_${i}`);
    }
    this.currentDay = 1;
    Store.set('habits_state', { currentDay: 1 });
    this.render();
  },

  openManage() {
    const habits = this.getHabits();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'habits-modal';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-title">Manage Habits</div>

        <div id="habits-manage-list">
          ${habits.map((h, i) => `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <input class="form-input" style="flex: 1;" value="${h.label}" data-idx="${i}" data-field="label">
              <button class="btn btn-sm btn-danger" onclick="Habits.removeHabit(${i})">×</button>
            </div>
          `).join('')}
        </div>

        <div style="display: flex; gap: 8px; margin-top: 12px;">
          <input class="form-input" id="new-habit-label" placeholder="New habit name" style="flex: 1;">
          <button class="btn btn-sm btn-primary" onclick="Habits.addHabit()">Add</button>
        </div>

        <div class="modal-actions">
          <button class="btn btn-ghost" onclick="Habits.closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="Habits.saveManage()">Save</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  addHabit() {
    const label = document.getElementById('new-habit-label').value.trim();
    if (!label) return;
    const habits = this.getHabits();
    habits.push({ id: Store.generateId(), label });
    Store.set('habits_list', habits);
    this.closeModal();
    this.openManage();
  },

  removeHabit(idx) {
    const habits = this.getHabits();
    habits.splice(idx, 1);
    Store.set('habits_list', habits);
    this.closeModal();
    this.openManage();
  },

  saveManage() {
    const habits = this.getHabits();
    const inputs = document.querySelectorAll('#habits-manage-list input');
    inputs.forEach(input => {
      const idx = parseInt(input.dataset.idx);
      if (habits[idx]) habits[idx].label = input.value.trim();
    });
    Store.set('habits_list', habits);
    this.closeModal();
    this.render();
  },

  closeModal() {
    const modal = document.getElementById('habits-modal');
    if (modal) modal.remove();
  }
};
