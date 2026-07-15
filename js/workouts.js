const Workouts = {
  currentTab: 'today',

  muscleGroups: ['chest', 'back', 'shoulders', 'arms', 'legs', 'core'],
  equipment: ['barbell', 'dumbbell', 'bodyweight', 'cable', 'machine'],
  weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],

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
      <div class="section-sub">Track · Plan · Progress</div>

      <div class="lib-tabs">
        <button class="lib-tab ${this.currentTab === 'today' ? 'active' : ''}" onclick="Workouts.switchTab('today')">Today</button>
        <button class="lib-tab ${this.currentTab === 'plans' ? 'active' : ''}" onclick="Workouts.switchTab('plans')">Plans</button>
        <button class="lib-tab ${this.currentTab === 'history' ? 'active' : ''}" onclick="Workouts.switchTab('history')">History</button>
        <button class="lib-tab ${this.currentTab === 'exercises' ? 'active' : ''}" onclick="Workouts.switchTab('exercises')">Library</button>
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
      case 'today': return this.renderToday();
      case 'plans': return this.renderPlans();
      case 'history': return this.renderHistory();
      case 'exercises': return this.renderExercises();
      case 'progress': return this.renderPRs();
      default: return '';
    }
  },

  // === HELPERS ===
  getExercises() { return Store.get('workout_exercises') || []; },
  saveExercises(ex) { Store.set('workout_exercises', ex); },
  getPlans() { return Store.get('workout_plans') || []; },
  savePlans(plans) { Store.set('workout_plans', plans); },

  getActivePlan() {
    return this.getPlans().find(p => p.active) || null;
  },

  getTodayKey() {
    return Store.formatDate(new Date());
  },

  getTodayDayName() {
    return this.weekdays[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  },

  getDayLog(dateKey) {
    return Store.get(`workout_day_${dateKey}`) || null;
  },

  saveDayLog(dateKey, log) {
    Store.set(`workout_day_${dateKey}`, log);
  },

  calcDayPercentage(dayLog) {
    if (!dayLog || !dayLog.exercises || dayLog.exercises.length === 0) return 0;
    const completed = dayLog.exercises.filter(e => e.completed).length;
    return Math.round((completed / dayLog.exercises.length) * 100);
  },

  // === TODAY TAB ===
  renderToday() {
    const plan = this.getActivePlan();
    const todayKey = this.getTodayKey();
    const dayName = this.getTodayDayName();
    let dayLog = this.getDayLog(todayKey);

    if (!plan) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">&#128170;</div>
          <div class="empty-state-text">No active plan. Create and activate a plan to start tracking daily workouts.</div>
          <button class="btn btn-primary" style="margin-top: 12px;" onclick="Workouts.switchTab('plans')">Go to Plans</button>
        </div>`;
    }

    const planDay = plan.days[dayName];
    if (!planDay || planDay.exercises.length === 0) {
      return `
        <div class="panel">
          <div class="corner-bl"></div>
          <div class="corner-br"></div>
          <div style="text-align: center; padding: 20px 0;">
            <div style="font-size: 0.85rem; color: var(--muted); margin-bottom: 8px;">
              ${dayName.charAt(0).toUpperCase() + dayName.slice(1)} — Rest Day
            </div>
            <div style="font-size: 0.75rem; color: var(--muted);">No exercises planned for today. Enjoy the recovery!</div>
          </div>
        </div>
        <button class="btn btn-primary" style="margin-top: 12px;" onclick="Workouts.startCustomSession()">Start Custom Session</button>
      `;
    }

    if (!dayLog) {
      dayLog = {
        date: todayKey,
        dayName,
        planId: plan.id,
        planLabel: planDay.label,
        exercises: planDay.exercises.map(e => ({
          exerciseId: e.exerciseId,
          name: e.name,
          targetSets: e.sets,
          targetReps: e.reps,
          sets: [],
          completed: false
        })),
        startedAt: new Date().toISOString()
      };
      this.saveDayLog(todayKey, dayLog);
    }

    const pct = this.calcDayPercentage(dayLog);
    const completedCount = dayLog.exercises.filter(e => e.completed).length;
    const totalCount = dayLog.exercises.length;

    let exercisesHtml = dayLog.exercises.map((ex, i) => {
      const setsLogged = ex.sets.length;
      const setsTarget = ex.targetSets || 0;
      const setsPct = setsTarget > 0 ? Math.min(100, Math.round((setsLogged / setsTarget) * 100)) : (setsLogged > 0 ? 100 : 0);

      return `
        <div class="workout-exercise-card ${ex.completed ? 'completed' : ''}">
          <div class="workout-exercise-header" onclick="Workouts.toggleExercise(${i})">
            <div class="workout-exercise-check">${ex.completed ? '✓' : ''}</div>
            <div class="workout-exercise-info">
              <div class="workout-exercise-name">${ex.name}</div>
              <div class="workout-exercise-target">${setsLogged}/${setsTarget} sets · ${ex.targetReps} reps target</div>
            </div>
            <div class="workout-exercise-pct">${setsPct}%</div>
          </div>
          ${ex.sets.length > 0 ? `
            <div class="workout-sets-list">
              ${ex.sets.map((s, si) => `<div class="workout-set-row">Set ${si + 1}: <strong>${s.weight}kg</strong> × ${s.reps}</div>`).join('')}
            </div>
          ` : ''}
          <div class="workout-set-input">
            <input class="form-input" id="w-${i}" type="number" placeholder="kg" style="width: 65px; padding: 6px 8px; font-size: 0.75rem;">
            <input class="form-input" id="r-${i}" type="number" placeholder="reps" style="width: 65px; padding: 6px 8px; font-size: 0.75rem;">
            <button class="btn btn-sm btn-primary" onclick="Workouts.addSetToday(${i})">+ Set</button>
          </div>
        </div>`;
    }).join('');

    return `
      <div class="panel">
        <div class="corner-bl"></div>
        <div class="corner-br"></div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div>
            <div style="font-size: 0.9rem; font-weight: 600;">${planDay.label}</div>
            <div style="font-size: 0.7rem; color: var(--muted);">${dayName.charAt(0).toUpperCase() + dayName.slice(1)} · ${plan.name}</div>
          </div>
          <div style="font-family: 'Orbitron', sans-serif; font-size: 1.2rem; color: var(--accent); font-weight: 700;">${pct}%</div>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div style="font-size: 0.7rem; color: var(--muted); margin-top: 6px;">${completedCount}/${totalCount} exercises completed</div>
      </div>

      ${exercisesHtml}

      ${pct === 100 ? `<div class="workout-complete-badge">Workout Complete! &#127881;</div>` : ''}
    `;
  },

  toggleExercise(idx) {
    const todayKey = this.getTodayKey();
    const dayLog = this.getDayLog(todayKey);
    if (!dayLog) return;

    const wasCompleted = dayLog.exercises[idx].completed;
    dayLog.exercises[idx].completed = !wasCompleted;
    this.saveDayLog(todayKey, dayLog);

    if (!wasCompleted && dayLog.exercises[idx].completed) {
      const result = XP.award('workout', dayLog.exercises[idx].name, XP.rewards.workout);
      XP.showXPGain(result.amount, 'Exercise');
    }

    this.render();
  },

  addSetToday(idx) {
    const weight = parseFloat(document.getElementById(`w-${idx}`).value) || 0;
    const reps = parseInt(document.getElementById(`r-${idx}`).value) || 0;
    if (!weight && !reps) return;

    const todayKey = this.getTodayKey();
    const dayLog = this.getDayLog(todayKey);
    if (!dayLog) return;

    dayLog.exercises[idx].sets.push({ weight, reps });

    if (dayLog.exercises[idx].sets.length >= dayLog.exercises[idx].targetSets) {
      dayLog.exercises[idx].completed = true;
    }

    this.saveDayLog(todayKey, dayLog);
    this.updatePR(dayLog.exercises[idx].exerciseId, weight, reps);
    this.render();
  },

  startCustomSession() {
    const exercises = this.getExercises();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'workout-modal';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-title">Custom Session</div>
        <div class="form-group">
          <label class="form-label">Select exercises</label>
          <div id="custom-exercises" style="max-height: 250px; overflow-y: auto;">
            ${exercises.map(ex => `
              <label style="display: flex; align-items: center; gap: 8px; padding: 6px 0; font-size: 0.8rem; cursor: pointer;">
                <input type="checkbox" value="${ex.id}" data-name="${ex.name}">
                ${ex.name} <span style="color: var(--muted); font-size: 0.7rem;">(${ex.muscleGroup})</span>
              </label>
            `).join('')}
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <div class="form-group" style="flex:1">
            <label class="form-label">Sets per exercise</label>
            <input class="form-input" id="custom-sets" type="number" value="3">
          </div>
          <div class="form-group" style="flex:1">
            <label class="form-label">Reps target</label>
            <input class="form-input" id="custom-reps" type="number" value="10">
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" onclick="Workouts.closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="Workouts.saveCustomSession()">Start</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  saveCustomSession() {
    const checks = document.querySelectorAll('#custom-exercises input:checked');
    if (checks.length === 0) return;
    const sets = parseInt(document.getElementById('custom-sets').value) || 3;
    const reps = parseInt(document.getElementById('custom-reps').value) || 10;

    const todayKey = this.getTodayKey();
    const exercises = [];
    checks.forEach(cb => {
      exercises.push({
        exerciseId: cb.value,
        name: cb.dataset.name,
        targetSets: sets,
        targetReps: reps,
        sets: [],
        completed: false
      });
    });

    const dayLog = {
      date: todayKey,
      dayName: this.getTodayDayName(),
      planId: null,
      planLabel: 'Custom Session',
      exercises,
      startedAt: new Date().toISOString()
    };
    this.saveDayLog(todayKey, dayLog);
    this.closeModal();
    this.render();
  },

  // === PLANS TAB ===
  renderPlans() {
    const plans = this.getPlans();

    return `
      <div style="display: flex; justify-content: flex-end; margin-bottom: 14px;">
        <button class="btn btn-primary" onclick="Workouts.openPlanEditor()">+ New Plan</button>
      </div>
      ${plans.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">&#128203;</div>
          <div class="empty-state-text">No workout plans yet. Create one to schedule your week.</div>
        </div>
      ` : plans.map(plan => `
        <div class="card" style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-weight: 600; font-size: 0.9rem;">${this.escapeHtml(plan.name)}</div>
            <span class="badge ${plan.active ? 'badge-accent' : 'badge-success'}">${plan.active ? 'Active' : 'Inactive'}</span>
          </div>
          <div style="font-size: 0.75rem; color: var(--muted); margin-bottom: 8px;">${Object.keys(plan.days).filter(d => plan.days[d].exercises.length > 0).length} training days</div>
          ${this.weekdays.map(day => {
            const d = plan.days[day];
            if (!d || d.exercises.length === 0) return '';
            return `
              <div style="margin-top: 6px; padding: 8px 10px; border: 1px solid var(--border); border-radius: 6px;">
                <div style="font-size: 0.75rem; font-weight: 600; text-transform: capitalize; margin-bottom: 4px;">${day} — ${d.label}</div>
                <div style="font-size: 0.7rem; color: var(--muted);">${d.exercises.map(e => `${e.name} (${e.sets}×${e.reps})`).join(', ')}</div>
              </div>`;
          }).join('')}
          <div style="display: flex; gap: 6px; margin-top: 12px;">
            ${!plan.active ? `<button class="btn btn-sm btn-primary" onclick="Workouts.activatePlan('${plan.id}')">Activate</button>` : ''}
            <button class="btn btn-sm btn-ghost" onclick="Workouts.editPlan('${plan.id}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="Workouts.deletePlan('${plan.id}')">×</button>
          </div>
        </div>
      `).join('')}
    `;
  },

  openPlanEditor(existing) {
    const exercises = this.getExercises();
    const plan = existing || { name: '', days: {} };

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'workout-modal';
    overlay.innerHTML = `
      <div class="modal" style="max-height: 90vh; overflow-y: auto;">
        <div class="modal-title">${existing ? 'Edit' : 'New'} Workout Plan</div>
        <div class="form-group">
          <label class="form-label">Plan Name</label>
          <input class="form-input" id="plan-name" value="${this.escapeHtml(plan.name)}" placeholder="e.g. Push Pull Legs">
        </div>

        ${this.weekdays.map(day => {
          const dayData = plan.days[day] || { label: '', exercises: [] };
          return `
            <div class="plan-day-section" data-day="${day}">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <span style="font-size: 0.75rem; font-weight: 600; text-transform: capitalize; min-width: 80px;">${day}</span>
                <input class="form-input plan-day-label" data-day="${day}" value="${this.escapeHtml(dayData.label)}" placeholder="e.g. Push Day" style="flex: 1; padding: 6px 8px; font-size: 0.75rem;">
              </div>
              <div id="plan-exercises-${day}">
                ${dayData.exercises.map((e, i) => `
                  <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px; padding-left: 88px; font-size: 0.72rem;">
                    <span style="flex: 1;">${e.name}</span>
                    <span style="color: var(--muted);">${e.sets}×${e.reps}</span>
                    <button class="btn btn-sm btn-danger" style="padding: 2px 6px; font-size: 0.65rem;" onclick="Workouts.removePlanExercise('${day}', ${i})">×</button>
                  </div>
                `).join('')}
              </div>
              <button class="btn btn-sm btn-ghost" style="margin-left: 88px; margin-bottom: 12px; font-size: 0.7rem;" onclick="Workouts.openAddExerciseToDay('${day}')">+ Exercise</button>
            </div>`;
        }).join('')}

        <div class="modal-actions">
          <button class="btn btn-ghost" onclick="Workouts.closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="Workouts.savePlanFromEditor('${existing ? existing.id : ''}')">Save Plan</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    this._editingPlan = JSON.parse(JSON.stringify(plan));
    if (existing) this._editingPlan.id = existing.id;
  },

  _editingPlan: null,

  openAddExerciseToDay(day) {
    const exercises = this.getExercises();
    const subModal = document.createElement('div');
    subModal.className = 'modal-overlay';
    subModal.id = 'workout-submodal';
    subModal.style.zIndex = '1001';
    subModal.innerHTML = `
      <div class="modal">
        <div class="modal-title">Add Exercise to ${day}</div>
        <div class="form-group">
          <label class="form-label">Exercise</label>
          <select class="form-select" id="add-ex-select">
            ${exercises.map(e => `<option value="${e.id}">${e.name} (${e.muscleGroup})</option>`).join('')}
          </select>
        </div>
        <div style="display: flex; gap: 8px;">
          <div class="form-group" style="flex:1">
            <label class="form-label">Sets</label>
            <input class="form-input" id="add-ex-sets" type="number" value="3">
          </div>
          <div class="form-group" style="flex:1">
            <label class="form-label">Reps</label>
            <input class="form-input" id="add-ex-reps" type="number" value="10">
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" onclick="document.getElementById('workout-submodal').remove()">Cancel</button>
          <button class="btn btn-primary" onclick="Workouts.confirmAddExerciseToDay('${day}')">Add</button>
        </div>
      </div>
    `;
    document.body.appendChild(subModal);
  },

  confirmAddExerciseToDay(day) {
    const exId = document.getElementById('add-ex-select').value;
    const sets = parseInt(document.getElementById('add-ex-sets').value) || 3;
    const reps = parseInt(document.getElementById('add-ex-reps').value) || 10;
    const exercises = this.getExercises();
    const ex = exercises.find(e => e.id === exId);
    if (!ex) return;

    if (!this._editingPlan.days) this._editingPlan.days = {};
    if (!this._editingPlan.days[day]) this._editingPlan.days[day] = { label: '', exercises: [] };
    this._editingPlan.days[day].exercises.push({ exerciseId: ex.id, name: ex.name, sets, reps });

    document.getElementById('workout-submodal').remove();

    const container = document.getElementById(`plan-exercises-${day}`);
    const idx = this._editingPlan.days[day].exercises.length - 1;
    const div = document.createElement('div');
    div.style.cssText = 'display: flex; align-items: center; gap: 4px; margin-bottom: 4px; padding-left: 88px; font-size: 0.72rem;';
    div.innerHTML = `<span style="flex: 1;">${ex.name}</span><span style="color: var(--muted);">${sets}×${reps}</span><button class="btn btn-sm btn-danger" style="padding: 2px 6px; font-size: 0.65rem;" onclick="Workouts.removePlanExercise('${day}', ${idx})">×</button>`;
    container.appendChild(div);
  },

  removePlanExercise(day, idx) {
    if (this._editingPlan && this._editingPlan.days[day]) {
      this._editingPlan.days[day].exercises.splice(idx, 1);
    }
    this.closeModal();
    this.openPlanEditor(this._editingPlan);
  },

  savePlanFromEditor(existingId) {
    const name = document.getElementById('plan-name').value.trim();
    if (!name) return;

    const days = {};
    this.weekdays.forEach(day => {
      const labelInput = document.querySelector(`.plan-day-label[data-day="${day}"]`);
      const label = labelInput ? labelInput.value.trim() : '';
      const exercisesForDay = (this._editingPlan && this._editingPlan.days && this._editingPlan.days[day])
        ? this._editingPlan.days[day].exercises
        : [];
      days[day] = { label: label || (exercisesForDay.length > 0 ? day : ''), exercises: exercisesForDay };
    });

    const plans = this.getPlans();

    if (existingId) {
      const idx = plans.findIndex(p => p.id === existingId);
      if (idx >= 0) {
        plans[idx].name = name;
        plans[idx].days = days;
      }
    } else {
      plans.push({ id: Store.generateId(), name, days, active: plans.length === 0 });
    }

    this.savePlans(plans);
    this._editingPlan = null;
    this.closeModal();
    this.render();
  },

  editPlan(id) {
    const plan = this.getPlans().find(p => p.id === id);
    if (plan) this.openPlanEditor(plan);
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

  // === HISTORY TAB ===
  renderHistory() {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = Store.formatDate(d);
      const log = this.getDayLog(key);
      if (log) {
        days.push({ key, log, pct: this.calcDayPercentage(log) });
      }
    }

    if (days.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">&#128197;</div>
          <div class="empty-state-text">No workout history yet. Complete today's workout to start tracking.</div>
        </div>`;
    }

    const avgPct = Math.round(days.reduce((s, d) => s + d.pct, 0) / days.length);
    const perfectDays = days.filter(d => d.pct === 100).length;

    let graphBars = days.slice().reverse().map(d => {
      let cls = 'graph-bar';
      if (d.pct === 100) cls += ' full';
      else if (d.pct > 0) cls += ' partial';
      return `<div class="${cls}" style="--bar-h:${d.pct}%" title="${d.key}: ${d.pct}%"><span class="graph-bar-tip">${d.pct}%</span></div>`;
    }).join('');

    return `
      <div class="panel" style="margin-bottom: 16px;">
        <div class="corner-bl"></div>
        <div class="corner-br"></div>
        <div class="stats-row">
          <div class="stat"><div class="num">${avgPct}%</div><div class="label">Avg Completion</div></div>
          <div class="stat"><div class="num">${perfectDays}</div><div class="label">Perfect Days</div></div>
          <div class="stat"><div class="num">${days.length}</div><div class="label">Days Tracked</div></div>
        </div>
      </div>

      <div class="habits-graph-section">
        <h2>Last ${days.length} Days</h2>
        <div class="habits-graph-container">
          <div class="habits-graph-y">
            <span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span>
          </div>
          <div class="habits-graph-bars">${graphBars}</div>
        </div>
      </div>

      ${days.map(d => `
        <div class="card" style="margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 600; font-size: 0.85rem;">${d.key}</div>
              <div style="font-size: 0.7rem; color: var(--muted);">${d.log.planLabel || 'Workout'} · ${d.log.exercises.length} exercises</div>
            </div>
            <div style="font-family: 'Orbitron', sans-serif; font-size: 0.9rem; color: ${d.pct === 100 ? 'var(--accent)' : 'var(--muted)'}; font-weight: 700;">${d.pct}%</div>
          </div>
          <div class="progress-bar" style="margin-top: 8px;"><div class="progress-fill" style="width:${d.pct}%"></div></div>
        </div>
      `).join('')}
    `;
  },

  // === EXERCISES LIBRARY ===
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
    const sub = document.getElementById('workout-submodal');
    if (sub) sub.remove();
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }
};
