const Goals = {
  init() {
    this.render();
  },

  getGoals() {
    return Store.get('goals') || [];
  },

  saveGoals(goals) {
    Store.set('goals', goals);
  },

  render() {
    const section = document.getElementById('section-goals');
    const goals = this.getGoals();
    const active = goals.filter(g => !g.completed);
    const completed = goals.filter(g => g.completed);

    section.innerHTML = `
      <div class="section-header">
        <h2 class="section-title glow-text">Goals</h2>
        <button class="btn btn-primary" onclick="Goals.openEditor()">+ New Goal</button>
      </div>
      <div class="section-sub">Set targets · track progress · level up</div>

      ${active.length === 0 && completed.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">⭐</div>
          <div class="empty-state-text">No quests set. Add your first goal to begin.</div>
          <button class="btn btn-primary" onclick="Goals.openEditor()">Add Goal</button>
        </div>
      ` : ''}

      ${active.length > 0 ? `
        <div class="panel">
          <div class="corner-bl"></div>
          <div class="corner-br"></div>
          <h2 style="font-size: 0.85rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 14px;">Active</h2>
          ${active.map(g => this.renderGoalCard(g)).join('')}
        </div>
      ` : ''}

      ${completed.length > 0 ? `
        <div style="margin-top: 20px;">
          <h3 style="font-size: 0.85rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 12px;">Completed</h3>
          ${completed.map(g => this.renderGoalCard(g)).join('')}
        </div>
      ` : ''}
    `;
  },

  renderGoalCard(goal) {
    const progress = goal.target ? Math.min(100, Math.round((goal.current / goal.target) * 100)) : 0;
    return `
      <div class="card" style="${goal.completed ? 'opacity: 0.6;' : ''}">
        <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px;">
          <div>
            <div style="font-weight: 600; font-size: 0.95rem;">${this.escapeHtml(goal.title)}</div>
            ${goal.description ? `<div style="font-size: 0.78rem; color: var(--muted); margin-top: 4px;">${this.escapeHtml(goal.description)}</div>` : ''}
          </div>
          <span class="badge badge-accent">${goal.category === 'short' ? 'Short-term' : 'Long-term'}</span>
        </div>

        ${goal.target ? `
          <div class="goal-progress">
            <div class="goal-meta">
              <span>${goal.current || 0} / ${goal.target} ${goal.unit || ''}</span>
              <span style="color: var(--accent);">${progress}%</span>
            </div>
            <div class="progress-bar" style="margin-bottom: 0;">
              <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
          </div>
        ` : ''}

        ${goal.deadline ? `<div style="font-size: 0.7rem; color: var(--muted); margin-top: 8px;">Deadline: <span style="color: var(--accent);">${goal.deadline}</span></div>` : ''}

        <div style="display: flex; gap: 6px; margin-top: 12px;">
          ${!goal.completed && goal.target ? `<button class="btn btn-sm btn-primary" onclick="Goals.updateProgress('${goal.id}')">Update</button>` : ''}
          ${!goal.completed ? `<button class="btn btn-sm btn-ghost" onclick="Goals.markComplete('${goal.id}')">Complete</button>` : ''}
          <button class="btn btn-sm btn-ghost" onclick="Goals.openEditor('${goal.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="Goals.deleteGoal('${goal.id}')">×</button>
        </div>
      </div>
    `;
  },

  openEditor(editId) {
    const goals = this.getGoals();
    const existing = editId ? goals.find(g => g.id === editId) : null;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'goals-modal';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-title">${existing ? 'Edit Goal' : 'New Goal'}</div>

        <div class="form-group">
          <label class="form-label">Goal Title</label>
          <input class="form-input" id="goal-title" placeholder="e.g. Run a marathon" value="${existing ? this.escapeHtml(existing.title) : ''}">
        </div>

        <div class="form-group">
          <label class="form-label">Description (optional)</label>
          <textarea class="form-textarea" id="goal-desc" style="min-height: 60px;" placeholder="Why this matters...">${existing ? this.escapeHtml(existing.description || '') : ''}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Category</label>
          <select class="form-select" id="goal-category">
            <option value="short" ${existing && existing.category === 'short' ? 'selected' : ''}>Short-term</option>
            <option value="long" ${existing && existing.category === 'long' ? 'selected' : ''}>Long-term</option>
          </select>
        </div>

        <div style="display: flex; gap: 10px;">
          <div class="form-group" style="flex: 1;">
            <label class="form-label">Target (optional)</label>
            <input class="form-input" id="goal-target" type="number" placeholder="e.g. 42" value="${existing && existing.target ? existing.target : ''}">
          </div>
          <div class="form-group" style="flex: 1;">
            <label class="form-label">Unit</label>
            <input class="form-input" id="goal-unit" placeholder="e.g. km" value="${existing ? this.escapeHtml(existing.unit || '') : ''}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Deadline (optional)</label>
          <input class="form-input" id="goal-deadline" type="date" value="${existing && existing.deadline ? existing.deadline : ''}">
        </div>

        <div class="modal-actions">
          <button class="btn btn-ghost" onclick="Goals.closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="Goals.saveGoal('${editId || ''}')">Save</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  saveGoal(editId) {
    const title = document.getElementById('goal-title').value.trim();
    if (!title) return;

    const goals = this.getGoals();
    const goalData = {
      id: editId || Store.generateId(),
      title,
      description: document.getElementById('goal-desc').value.trim(),
      category: document.getElementById('goal-category').value,
      target: parseInt(document.getElementById('goal-target').value) || null,
      unit: document.getElementById('goal-unit').value.trim(),
      deadline: document.getElementById('goal-deadline').value || null,
      current: 0,
      completed: false,
      createdAt: new Date().toISOString()
    };

    if (editId) {
      const idx = goals.findIndex(g => g.id === editId);
      if (idx >= 0) {
        goalData.current = goals[idx].current;
        goalData.completed = goals[idx].completed;
        goalData.createdAt = goals[idx].createdAt;
        goals[idx] = goalData;
      }
    } else {
      goals.unshift(goalData);
    }

    this.saveGoals(goals);
    this.closeModal();
    this.render();
  },

  updateProgress(id) {
    const goals = this.getGoals();
    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    const val = prompt(`Current progress (target: ${goal.target} ${goal.unit || ''})`, goal.current || 0);
    if (val === null) return;

    goal.current = parseInt(val) || 0;
    if (goal.target && goal.current >= goal.target) {
      goal.completed = true;
      goal.completedAt = new Date().toISOString();
    }
    this.saveGoals(goals);
    this.render();
  },

  markComplete(id) {
    const goals = this.getGoals();
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    goal.completed = true;
    goal.completedAt = new Date().toISOString();
    if (goal.target) goal.current = goal.target;
    this.saveGoals(goals);

    const result = XP.award('goal', goal.title, XP.rewards.goalComplete);
    XP.showXPGain(result.amount, 'Goal Complete');

    this.render();
  },

  deleteGoal(id) {
    if (!confirm('Delete this goal?')) return;
    const goals = this.getGoals().filter(g => g.id !== id);
    this.saveGoals(goals);
    this.render();
  },

  closeModal() {
    const modal = document.getElementById('goals-modal');
    if (modal) modal.remove();
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};
