const XP = {
  rewards: {
    habit: 10,
    journal: 15,
    goalMilestone: 25,
    goalComplete: 200,
    questD: 15,
    questC: 25,
    questB: 40,
    questA: 60,
    weeklyDungeon: 150,
    monthlyRaid: 500,
    bookFinished: 50,
    workout: 20
  },

  getState() {
    return Store.get('xp_state') || {
      totalXP: 0,
      level: 1,
      currency: 0,
      history: []
    };
  },

  saveState(state) {
    Store.set('xp_state', state);
  },

  xpForLevel(level) {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  },

  getCurrentLevelProgress(state) {
    let xpNeeded = 0;
    for (let i = 1; i < state.level; i++) {
      xpNeeded += this.xpForLevel(i);
    }
    const xpIntoLevel = state.totalXP - xpNeeded;
    const xpForNext = this.xpForLevel(state.level);
    return { xpIntoLevel, xpForNext };
  },

  getStreakMultiplier() {
    const habits = Store.get('habits_list') || [];
    if (habits.length === 0) return 1;

    let maxStreak = 0;
    const today = new Date();
    for (const habit of habits) {
      let streak = 0;
      for (let d = 0; d < 200; d++) {
        const date = new Date(today);
        date.setDate(date.getDate() - d);
        const dayData = Store.get(`habits_day_${d + 1}`) || {};
        if (dayData[habit.id]) {
          streak++;
        } else {
          break;
        }
      }
      if (streak > maxStreak) maxStreak = streak;
    }

    if (maxStreak >= 100) return 3.0;
    if (maxStreak >= 60) return 2.5;
    if (maxStreak >= 30) return 2.0;
    if (maxStreak >= 14) return 1.5;
    if (maxStreak >= 7) return 1.25;
    return 1.0;
  },

  award(source, detail, baseXP) {
    const state = this.getState();
    const multiplier = this.getStreakMultiplier();
    const amount = Math.round(baseXP * multiplier);

    state.totalXP += amount;
    state.currency += Math.round(amount * 0.5);

    state.history.unshift({
      date: new Date().toISOString(),
      amount,
      source,
      detail,
      multiplier
    });

    if (state.history.length > 200) {
      state.history = state.history.slice(0, 200);
    }

    let leveled = false;
    while (true) {
      const { xpIntoLevel, xpForNext } = this.getCurrentLevelProgress(state);
      if (xpIntoLevel >= xpForNext) {
        state.level++;
        leveled = true;
      } else {
        break;
      }
    }

    this.saveState(state);

    if (leveled) {
      this.showLevelUp(state.level);
    }

    return { amount, multiplier, leveled, newLevel: state.level };
  },

  showLevelUp(level) {
    const toast = document.createElement('div');
    toast.className = 'xp-toast level-up';
    toast.innerHTML = `<span class="xp-toast-icon">&#9876;</span> Level Up! You are now Level ${level}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  showXPGain(amount, source) {
    const toast = document.createElement('div');
    toast.className = 'xp-toast';
    toast.innerHTML = `<span class="xp-toast-icon">+${amount}</span> XP from ${source}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  },

  getTodayXP() {
    const state = this.getState();
    const today = new Date().toISOString().split('T')[0];
    return state.history
      .filter(h => h.date.startsWith(today))
      .reduce((sum, h) => sum + h.amount, 0);
  }
};
