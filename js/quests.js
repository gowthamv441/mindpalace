const Quests = {
  getToday() {
    const today = Store.formatDate(new Date());
    return Store.get(`quests_${today}`) || { date: today, tasks: [] };
  },

  getTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = Store.formatDate(tomorrow);
    return Store.get(`quests_${dateStr}`) || { date: dateStr, tasks: [] };
  },

  saveTasks(dateStr, data) {
    Store.set(`quests_${dateStr}`, data);
  },

  addTask(dateStr, task) {
    const data = Store.get(`quests_${dateStr}`) || { date: dateStr, tasks: [] };
    data.tasks.push({
      id: Store.generateId(),
      name: task.name,
      time: task.time,
      rank: this.rankFromTime(task.time),
      xp: 0,
      completed: false,
      completedAt: null
    });
    data.tasks.sort((a, b) => a.time.localeCompare(b.time));
    this.saveTasks(dateStr, data);
  },

  removeTask(dateStr, taskId) {
    const data = Store.get(`quests_${dateStr}`) || { date: dateStr, tasks: [] };
    data.tasks = data.tasks.filter(t => t.id !== taskId);
    this.saveTasks(dateStr, data);
  },

  completeTask(taskId) {
    const today = Store.formatDate(new Date());
    const data = this.getToday();
    const task = data.tasks.find(t => t.id === taskId);
    if (!task || task.completed) return;

    task.completed = true;
    task.completedAt = new Date().toISOString();

    const now = new Date();
    const [hours, minutes] = task.time.split(':').map(Number);
    const deadline = new Date();
    deadline.setHours(hours, minutes, 0, 0);

    const onTime = now <= deadline;
    const baseXP = this.xpForRank(task.rank);
    task.xp = onTime ? Math.round(baseXP * 1.5) : baseXP;

    this.saveTasks(today, data);

    const result = XP.award('quest', task.name, task.xp);
    XP.showXPGain(result.amount, onTime ? `${task.name} (On Time!)` : task.name);

    if (data.tasks.every(t => t.completed)) {
      const bonus = XP.award('quest_bonus', 'All tasks complete!', 50);
      setTimeout(() => XP.showXPGain(bonus.amount, 'All Tasks Bonus!'), 500);
    }

    if (App.currentSection === 'home') Home.render();
  },

  rankFromTime(time) {
    const [h] = time.split(':').map(Number);
    if (h < 7) return 'A';
    if (h < 10) return 'B';
    if (h < 14) return 'C';
    return 'D';
  },

  xpForRank(rank) {
    const xp = { A: 60, B: 40, C: 25, D: 15 };
    return xp[rank] || 15;
  },

  rankColor(rank) {
    const colors = { D: '#3b82f6', C: '#22c55e', B: '#eab308', A: '#f97316', S: '#ef4444' };
    return colors[rank] || 'var(--accent)';
  },

  openPlanner() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = Store.formatDate(tomorrow);
    const data = Store.get(`quests_${dateStr}`) || { date: dateStr, tasks: [] };

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'quest-modal';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-title">Plan Tomorrow — ${dateStr}</div>
        <div id="planner-tasks">
          ${data.tasks.map(t => `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 0.75rem; color: var(--accent); font-family: 'Orbitron', sans-serif; width: 50px;">${t.time}</span>
              <span style="flex: 1; font-size: 0.82rem;">${t.name}</span>
              <button class="btn btn-sm btn-danger" onclick="Quests.removeTomorrowTask('${t.id}')">×</button>
            </div>
          `).join('')}
        </div>
        <div style="display: flex; gap: 8px; margin-top: 14px;">
          <input class="form-input" id="quest-time" type="time" style="width: 110px;">
          <input class="form-input" id="quest-name" placeholder="Task name" style="flex: 1;">
          <button class="btn btn-sm btn-primary" onclick="Quests.addTomorrowTask()">+</button>
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" onclick="Quests.closePlanner()">Done</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  addTomorrowTask() {
    const time = document.getElementById('quest-time').value;
    const name = document.getElementById('quest-name').value.trim();
    if (!time || !name) return;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = Store.formatDate(tomorrow);

    this.addTask(dateStr, { name, time });
    this.closePlanner();
    this.openPlanner();
  },

  removeTomorrowTask(taskId) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = Store.formatDate(tomorrow);
    this.removeTask(dateStr, taskId);
    this.closePlanner();
    this.openPlanner();
  },

  closePlanner() {
    const modal = document.getElementById('quest-modal');
    if (modal) modal.remove();
  }
};
