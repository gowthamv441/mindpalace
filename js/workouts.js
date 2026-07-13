const Workouts = {
  currentTab: 'exercises',

  muscleGroups: ['chest', 'back', 'shoulders', 'arms', 'legs', 'core'],
  equipment: ['barbell', 'dumbbell', 'bodyweight', 'cable', 'machine'],

  defaultExercises: [
    { id: 'bench', name: 'Bench Press', muscleGroup: 'chest', secondary: ['triceps', 'shoulders'], equipment: 'barbell', difficulty: 'intermediate' },
    { id: 'squat', name: 'Barbell Squat', muscleGroup: 'legs', secondary: ['core', 'back'], equipment: 'barbell', difficulty: 'intermediate' },
    { id: 'deadlift', name: 'Deadlift', muscleGroup: 'back', secondary: ['legs', 'core'], equipment: 'barbell', difficulty: 'advanced' },
    { id: 'ohp', name: 'Overhead Press', muscleGroup: 'shoulders', secondary: ['triceps', 'core'], equipment: 'barbell', difficulty: 'intermediate' },
    { id: 'row', name: 'Barbell Row', muscleGroup: 'back', secondary: ['biceps', 'core'], equipment: 'barbell', difficulty: 'intermediate' },
    { id: 'pullup', name: 'Pull-ups', muscleGroup: 'back', secondary: ['biceps', 'core'], equipment: 'bodyweight', difficulty: 'intermediate' },
    { id: 'pushup', name: 'Push-ups', muscleGroup: 'chest', secondary: ['triceps', 'shoulders'], equipment: 'bodyweight', difficulty: 'beginner' },
    { id: 'dips', name: 'Dips', muscleGroup: 'chest', secondary: ['triceps', 'shoulders'], equipment: 'bodyweight', difficulty: 'intermediate' },
    { id: 'curl', name: 'Bicep Curl', muscleGroup: 'arms', secondary: [], equipment: 'dumbbell', difficulty: 'beginner' },
    { id: 'lateralraise', name: 'Lateral Raise', muscleGroup: 'shoulders', secondary: [], equipment: 'dumbbell', difficulty: 'beginner' },
    { id: 'legpress', name: 'Leg Press', muscleGroup: 'legs', secondary: [], equipment: 'machine', difficulty: 'beginner' },
    { id: 'latpull', name: 'Lat Pulldown', muscleGroup: 'back', secondary: ['biceps'], equipment: 'cable', difficulty: 'beginner' },
    { id: 'cablefly', name: 'Cable Fly', muscleGroup: 'chest', secondary: [], equipment: 'cable', difficulty: 'beginner' },
    { id: 'plank', name: 'Plank', muscleGroup: 'core', secondary: ['shoulders'], equipment: 'bodyweight', difficulty: 'beginner' },
    { id: 'lunge', name: 'Lunges', muscleGroup: 'legs', secondary: ['core'], equipment: 'bodyweight', difficulty: 'beginner' },
    { id: 'tricepext', name: 'Tricep Extension', muscleGroup: 'arms', secondary: [], equipment: 'cable', difficulty: 'beginner' },
    { id: 'facepull', name: 'Face Pull', muscleGroup: 'shoulders', secondary: ['back'], equipment: 'cable', difficulty: 'beginner' },
    { id: 'rdl', name: 'Romanian Deadlift', muscleGroup: 'legs', secondary: ['back'], equipment: 'barbell', difficulty: 'intermediate' },
    { id: 'inclinepress', name: 'Incline DB Press', muscleGroup: 'chest', secondary: ['shoulders', 'triceps'], equipment: 'dumbbell', difficulty: 'intermediate' },
    { id: 'hammercurl', name: 'Hammer Curl', muscleGroup: 'arms', secondary: [], equipment: 'dumbbell', difficulty: 'beginner' },
  ],

  init() {
    if (!Store.get('workout_exercises')) {
      Store.set('workout_exercises', this.defaultExercises);
    }
    this.render();
  },

  render() {
    const section = document.getElementById('section-workouts');
    if (!section) return;

    section.innerHTML = `
      <div class="section-header">
        <h2 class="section-title glow-text">Workouts</h2>
      </div>
      <div class="section-sub">Exercises · Plans · Progress</div>

      <div class="lib-tabs">
        <button class="lib-tab ${this.currentTab === 'exercises' ? 'active' : ''}" onclick="Workouts.switchTab('exercises')">Exercises</button>
        <button class="lib-tab ${this.currentTab === 'plans' ? 'active' : ''}" onclick="Workouts.switchTab('plans')">Plans</button>
        <button class="lib-tab ${this.currentTab === 'log' ? 'active' : ''}" onclick="Workouts.switchTab('log')">Log</button>
        <button class="lib-tab ${this.currentTab === 'progress' ? 'active' : ''}" onclick="Workouts.switchTab('progress')">PRs</button>
      </div>

      <div id="workout-content">${this.renderTab()}</div>
    `;
  },

  switchTab(tab) {
    this.currentTab = tab;
    this.render();
  },

  renderTab() {
    switch (this.currentTab) {
      case 'exercises': return this.renderExercises();
      case 'plans': return this.renderPlans();
      case 'log': return this.renderLog();
      case 'progress': return this.renderPRs();
      default: return '';
    }
  },

  // === EXERCISES ===
  getExercises() { return Store.get('workout_exercises') || []; },
  saveExercises(ex) { Store.set('workout_exercises', ex); },

  renderExercises() {
    const exercises = this.getExercises();
    const grouped = {};
    this.muscleGroups.forEach(g => { grouped[g] = exercises.filter(e => e.muscleGroup === g); });

    return `
      <div style="display: flex; justify-content: flex-end; margin-bottom: 14px;">
        <button class="btn btn-primary" onclick="Workouts.openExerciseEditor()">+ Add</button>
      </div>
      ${this.muscleGroups.map(group => grouped[group].length > 0 ? `
        <h3 class="profile-section-title" style="margin-top: 16px; text-transform: capitalize;">${group}</h3>
        ${grouped[group].map(ex => `
          <div class="card" style="margin-bottom: 8px; padding: 12px 14px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div style="font-weight: 600; font-size: 0.85rem;">${ex.name}</div>
                <div style="font-size: 0.7rem; color: var(--muted);">${ex.equipment} · ${ex.difficulty}${ex.secondary && ex.secondary.length ? ' · +' + ex.secondary.join(', ') : ''}</div>
              </div>
              <button class="btn btn-sm btn-danger" onclick="Workouts.deleteExercise('${ex.id}')">×</button>
            </div>
          </div>
        `).join('')}
      ` : '').join('')}
    `;
  },

  openExerciseEditor() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'workout-modal';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-title">Add Exercise</div>
        <div class="form-group">
          <label class="form-label">Name</label>
          <input class="form-input" id="ex-name">
        </div>
        <div style="display: flex; gap: 10px;">
          <div class="form-group" style="flex: 1;">
            <label class="form-label">Muscle Group</label>
            <select class="form-select" id="ex-muscle">
              ${this.muscleGroups.map(g => `<option value="${g}">${g}</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="flex: 1;">
            <label class="form-label">Equipment</label>
            <select class="form-select" id="ex-equip">
              ${this.equipment.map(e => `<option value="${e}">${e}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Difficulty</label>
          <select class="form-select" id="ex-diff">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Secondary Muscles (comma separated)</label>
          <input class="form-input" id="ex-secondary" placeholder="e.g. triceps, shoulders">
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" onclick="Workouts.closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="Workouts.saveExercise()">Save</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  saveExercise() {
    const name = document.getElementById('ex-name').value.trim();
    if (!name) return;
    const exercises = this.getExercises();
    exercises.push({
      id: Store.generateId(),
      name,
      muscleGroup: document.getElementById('ex-muscle').value,
      equipment: document.getElementById('ex-equip').value,
      difficulty: document.getElementById('ex-diff').value,
      secondary: document.getElementById('ex-secondary').value.split(',').map(s => s.trim()).filter(Boolean)
    });
    this.saveExercises(exercises);
    this.closeModal();
    this.render();
  },

  deleteExercise(id) {
    if (!confirm('Delete this exercise?')) return;
    this.saveExercises(this.getExercises().filter(e => e.id !== id));
    this.render();
  },

  // === PLANS ===
  getPlans() { return Store.get('workout_plans') || []; },
  savePlans(plans) { Store.set('workout_plans', plans); },

  renderPlans() {
    const plans = this.getPlans();

    return `
      <div style="display: flex; justify-content: flex-end; margin-bottom: 14px;">
        <button class="btn btn-primary" onclick="Workouts.openPlanEditor()">+ New Plan</button>
      </div>
      ${plans.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">&#128203;</div>
          <div class="empty-state-text">No workout plans yet. Create one to get started.</div>
        </div>
      ` : plans.map(plan => `
        <div class="card" style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-weight: 600; font-size: 0.9rem;">${this.escapeHtml(plan.name)}</div>
            <span class="badge ${plan.active ? 'badge-accent' : 'badge-success'}">${plan.active ? 'Active' : 'Inactive'}</span>
          </div>
          <div style="font-size: 0.75rem; color: var(--muted);">${Object.keys(plan.days).length} days · ${Object.values(plan.days).reduce((sum, d) => sum + d.exercises.length, 0)} exercises</div>
          ${Object.entries(plan.days).map(([day, data]) => `
            <div style="margin-top: 8px; padding: 8px 10px; border: 1px solid var(--border); border-radius: 6px;">
              <div style="font-size: 0.75rem; font-weight: 600; text-transform: capitalize; margin-bottom: 4px;">${day} — ${data.label}</div>
              <div style="font-size: 0.7rem; color: var(--muted);">${data.exercises.map(e => e.name).join(', ')}</div>
            </div>
          `).join('')}
          <div style="display: flex; gap: 6px; margin-top: 12px;">
            ${!plan.active ? `<button class="btn btn-sm btn-primary" onclick="Workouts.activatePlan('${plan.id}')">Activate</button>` : ''}
            <button class="btn btn-sm btn-ghost" onclick="Workouts.startSession('${plan.id}')">Start Session</button>
            <button class="btn btn-sm btn-danger" onclick="Workouts.deletePlan('${plan.id}')">×</button>
          </div>
        </div>
      `).join('')}
    `;
  },

  openPlanEditor() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'workout-modal';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-title">New Workout Plan</div>
        <div class="form-group">
          <label class="form-label">Plan Name</label>
          <input class="form-input" id="plan-name" placeholder="e.g. Push Pull Legs">
        </div>
        <div id="plan-days">
          <div class="form-group">
            <label class="form-label">Day 1 Label</label>
            <input class="form-input plan-day-label" placeholder="e.g. Push">
          </div>
        </div>
        <button class="btn btn-sm btn-ghost" onclick="Workouts.addPlanDay()" style="margin-bottom: 12px;">+ Add Day</button>
        <div class="modal-actions">
          <button class="btn btn-ghost" onclick="Workouts.closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="Workouts.savePlan()">Create</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  addPlanDay() {
    const container = document.getElementById('plan-days');
    const count = container.querySelectorAll('.plan-day-label').length + 1;
    const div = document.createElement('div');
    div.className = 'form-group';
    div.innerHTML = `<label class="form-label">Day ${count} Label</label><input class="form-input plan-day-label" placeholder="e.g. Pull">`;
    container.appendChild(div);
  },

  savePlan() {
    const name = document.getElementById('plan-name').value.trim();
    if (!name) return;
    const labels = document.querySelectorAll('.plan-day-label');
    const days = {};
    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    labels.forEach((input, i) => {
      const label = input.value.trim() || `Day ${i + 1}`;
      days[dayNames[i] || `day${i + 1}`] = { label, exercises: [] };
    });

    const plans = this.getPlans();
    plans.push({ id: Store.generateId(), name, days, active: plans.length === 0 });
    this.savePlans(plans);
    this.closeModal();
    this.render();
  },

  activatePlan(id) {
    const plans = this.getPlans();
    plans.forEach(p => p.active = (p.id === id));
    this.savePlans(plans);
    this.render();
  },

  deletePlan(id) {
    if (!confirm('Delete this plan?')) return;
    this.savePlans(this.getPlans().filter(p => p.id !== id));
    this.render();
  },

  startSession(planId) {
    const plans = this.getPlans();
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    const dayKeys = Object.keys(plan.days);
    const dayName = dayKeys[0];
    this.openLogSession(plan, dayName);
  },

  openLogSession(plan, dayName) {
    const dayData = plan.days[dayName];
    const exercises = this.getExercises();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'workout-modal';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-title">${plan.name} — ${dayData.label}</div>
        <div class="form-group">
          <label class="form-label">Select exercises for this session</label>
          <div id="session-exercises" style="max-height: 200px; overflow-y: auto;">
            ${exercises.map(ex => `
              <label style="display: flex; align-items: center; gap: 8px; padding: 6px 0; font-size: 0.8rem; cursor: pointer;">
                <input type="checkbox" value="${ex.id}" data-name="${ex.name}">
                ${ex.name} <span style="color: var(--muted); font-size: 0.7rem;">(${ex.muscleGroup})</span>
              </label>
            `).join('')}
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" onclick="Workouts.closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="Workouts.logSession('${plan.id}', '${dayName}')">Log Session</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  logSession(planId, dayName) {
    const checks = document.querySelectorAll('#session-exercises input:checked');
    const entries = [];
    checks.forEach(cb => {
      entries.push({ exerciseId: cb.value, name: cb.dataset.name, sets: [] });
    });

    if (entries.length === 0) return;

    const logs = Store.get('workout_logs') || [];
    logs.unshift({
      id: Store.generateId(),
      date: Store.formatDate(new Date()),
      planId,
      dayLabel: dayName,
      entries,
      createdAt: new Date().toISOString()
    });
    Store.set('workout_logs', logs);

    const result = XP.award('workout', 'Workout logged', XP.rewards.workout);
    XP.showXPGain(result.amount, 'Workout');

    this.closeModal();
    this.switchTab('log');
  },

  // === LOG ===
  renderLog() {
    const logs = Store.get('workout_logs') || [];

    return `
      ${logs.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">&#127947;</div>
          <div class="empty-state-text">No workouts logged yet. Start a session from your plan.</div>
        </div>
      ` : logs.slice(0, 20).map(log => `
        <div class="card" style="margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-weight: 600; font-size: 0.85rem;">${log.date}</div>
            <span class="badge badge-success">${log.entries.length} exercises</span>
          </div>
          <div style="font-size: 0.75rem; color: var(--muted); margin-top: 4px;">
            ${log.entries.map(e => e.name).join(', ')}
          </div>
          <button class="btn btn-sm btn-ghost" style="margin-top: 8px;" onclick="Workouts.openSetLogger('${log.id}')">Log Sets</button>
        </div>
      `).join('')}
    `;
  },

  openSetLogger(logId) {
    const logs = Store.get('workout_logs') || [];
    const log = logs.find(l => l.id === logId);
    if (!log) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'workout-modal';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-title">Log Sets — ${log.date}</div>
        ${log.entries.map((entry, i) => `
          <div style="margin-bottom: 14px; padding: 10px; border: 1px solid var(--border); border-radius: 6px;">
            <div style="font-weight: 600; font-size: 0.8rem; margin-bottom: 8px;">${entry.name}</div>
            <div id="sets-${i}" style="font-size: 0.75rem;">
              ${(entry.sets || []).map((s, si) => `<div style="color: var(--muted);">Set ${si + 1}: ${s.weight}kg × ${s.reps}</div>`).join('')}
            </div>
            <div style="display: flex; gap: 6px; margin-top: 6px;">
              <input class="form-input" id="weight-${i}" type="number" placeholder="kg" style="width: 70px; padding: 6px 8px; font-size: 0.75rem;">
              <input class="form-input" id="reps-${i}" type="number" placeholder="reps" style="width: 70px; padding: 6px 8px; font-size: 0.75rem;">
              <button class="btn btn-sm btn-primary" onclick="Workouts.addSet('${logId}', ${i})">+Set</button>
            </div>
          </div>
        `).join('')}
        <div class="modal-actions">
          <button class="btn btn-primary" onclick="Workouts.closeModal()">Done</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  addSet(logId, entryIdx) {
    const weight = parseFloat(document.getElementById(`weight-${entryIdx}`).value) || 0;
    const reps = parseInt(document.getElementById(`reps-${entryIdx}`).value) || 0;
    if (!weight && !reps) return;

    const logs = Store.get('workout_logs') || [];
    const log = logs.find(l => l.id === logId);
    if (!log || !log.entries[entryIdx]) return;

    if (!log.entries[entryIdx].sets) log.entries[entryIdx].sets = [];
    log.entries[entryIdx].sets.push({ weight, reps });
    Store.set('workout_logs', logs);

    this.updatePR(log.entries[entryIdx].exerciseId, weight, reps);
    this.closeModal();
    this.openSetLogger(logId);
  },

  // === PRs ===
  updatePR(exerciseId, weight, reps) {
    if (!exerciseId) return;
    const prs = Store.get('workout_prs') || {};
    const current = prs[exerciseId];
    if (!current || weight > current.weight) {
      prs[exerciseId] = { weight, reps, date: Store.formatDate(new Date()) };
      Store.set('workout_prs', prs);
    }
  },

  renderPRs() {
    const prs = Store.get('workout_prs') || {};
    const exercises = this.getExercises();
    const entries = Object.entries(prs);

    return `
      ${entries.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">&#127942;</div>
          <div class="empty-state-text">No PRs yet. Log sets to track your personal records.</div>
        </div>
      ` : `
        <div class="panel">
          <div class="corner-bl"></div>
          <div class="corner-br"></div>
          <h3 class="profile-section-title">Personal Records</h3>
          ${entries.map(([exId, pr]) => {
            const ex = exercises.find(e => e.id === exId);
            return `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border);">
                <div>
                  <div style="font-size: 0.85rem; font-weight: 600;">${ex ? ex.name : exId}</div>
                  <div style="font-size: 0.7rem; color: var(--muted);">${pr.date}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-family: 'Orbitron', sans-serif; font-size: 0.9rem; color: var(--accent); font-weight: 700;">${pr.weight}kg</div>
                  <div style="font-size: 0.65rem; color: var(--muted);">× ${pr.reps} reps</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    `;
  },

  closeModal() {
    const modal = document.getElementById('workout-modal');
    if (modal) modal.remove();
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }
};
