const Ranks = {
  gates: {
    D: { minLevel: 5, streakDays: 7, goalsCompleted: 1 },
    C: { minLevel: 15, streakDays: 21, goalsCompleted: 3 },
    B: { minLevel: 30, streakDays: 45, goalsCompleted: 7 },
    A: { minLevel: 50, streakDays: 90, goalsCompleted: 15 },
    S: { minLevel: 80, streakDays: 180, goalsCompleted: 30 }
  },

  order: ['E', 'D', 'C', 'B', 'A', 'S'],

  getNextRank() {
    const profile = Profile.getProfile();
    const idx = this.order.indexOf(profile.rank);
    if (idx >= this.order.length - 1) return null;
    return this.order[idx + 1];
  },

  getGateStatus(targetRank) {
    const gate = this.gates[targetRank];
    if (!gate) return null;

    const xpState = XP.getState();
    const goals = Store.get('goals') || [];
    const completedGoals = goals.filter(g => g.completed).length;

    const currentStreak = this.getCurrentStreak();

    return {
      rank: targetRank,
      requirements: gate,
      progress: {
        level: xpState.level,
        streakDays: currentStreak,
        goalsCompleted: completedGoals
      },
      met: {
        level: xpState.level >= gate.minLevel,
        streakDays: currentStreak >= gate.streakDays,
        goalsCompleted: completedGoals >= gate.goalsCompleted
      }
    };
  },

  canRankUp() {
    const nextRank = this.getNextRank();
    if (!nextRank) return false;
    const status = this.getGateStatus(nextRank);
    return status && Object.values(status.met).every(v => v);
  },

  rankUp() {
    const nextRank = this.getNextRank();
    if (!nextRank || !this.canRankUp()) return false;

    const profile = Profile.getProfile();
    profile.rank = nextRank;
    Profile.saveProfile(profile);

    this.showRankUp(nextRank);
    return true;
  },

  showRankUp(rank) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'rankup-modal';
    overlay.innerHTML = `
      <div class="modal" style="text-align: center; padding: 40px;">
        <div style="font-size: 3rem; margin-bottom: 16px;">&#9876;</div>
        <div class="modal-title" style="font-size: 1.2rem;">Rank Up!</div>
        <div style="font-family: 'Orbitron', sans-serif; font-size: 2.5rem; font-weight: 800; color: var(--accent); margin: 20px 0; text-shadow: 0 0 20px rgba(76,201,255,0.5);">${rank}</div>
        <p style="color: var(--muted); font-size: 0.85rem; margin-bottom: 24px;">You have proven yourself worthy. Your hunter rank has increased.</p>
        <button class="btn btn-primary" onclick="document.getElementById('rankup-modal').remove()">Accept</button>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  getCurrentStreak() {
    const habits = Store.get('habits_list') || [];
    if (habits.length === 0) return 0;

    let streak = 0;
    for (let day = 75; day >= 1; day--) {
      const dayData = Store.get(`habits_day_${day}`) || {};
      const allDone = habits.every(h => dayData[h.id]);
      if (allDone) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }
};
