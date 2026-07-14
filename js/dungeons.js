const Dungeons = {
  getWeekly() {
    const weekId = this.getCurrentWeekId();
    const saved = Store.get(`dungeon_weekly_${weekId}`);
    if (saved) return saved;
    return this.generateWeekly(weekId);
  },

  getMonthly() {
    const monthId = this.getCurrentMonthId();
    const saved = Store.get(`dungeon_monthly_${monthId}`);
    if (saved) return saved;
    return this.generateMonthly(monthId);
  },

  generateWeekly(weekId) {
    const goals = (Store.get('goals') || []).filter(g => !g.completed);
    const challenges = [];

    if (goals.length > 0) {
      goals.slice(0, 3).forEach((goal, i) => {
        challenges.push({
          id: `wc_${i}`,
          name: this.weeklyChallenge(goal),
          goalId: goal.id,
          completed: false
        });
      });
    } else {
      challenges.push({ id: 'wc_0', name: 'Complete all habits for 5 days', completed: false });
      challenges.push({ id: 'wc_1', name: 'Complete all daily tasks for 3 days', completed: false });
      challenges.push({ id: 'wc_2', name: 'Log 3 workouts this week', completed: false });
    }

    const data = {
      id: weekId,
      name: 'Weekly Dungeon',
      startDate: this.getWeekStart(),
      endDate: this.getWeekEnd(),
      challenges,
      cleared: false,
      rewards: { xp: 150, currency: 50 }
    };

    Store.set(`dungeon_weekly_${weekId}`, data);
    return data;
  },

  weeklyChallenge(goal) {
    const title = goal.title.toLowerCase();
    if (title.includes('weight') || title.includes('muscle') || title.includes('gym') || title.includes('fitness')) {
      const options = [
        `Meet calorie goal for 5 days (${goal.title})`,
        `Work out 4 times this week (${goal.title})`,
        `Hit protein target 5 days (${goal.title})`
      ];
      return options[Math.floor(this.hashStr(goal.id) % options.length)];
    }
    if (title.includes('read') || title.includes('learn') || title.includes('study') || title.includes('course')) {
      const options = [
        `Study 1 hour daily for 5 days (${goal.title})`,
        `Complete 3 sessions this week (${goal.title})`,
        `Take notes every study day (${goal.title})`
      ];
      return options[Math.floor(this.hashStr(goal.id) % options.length)];
    }
    if (title.includes('save') || title.includes('money') || title.includes('invest')) {
      return `Track expenses every day this week (${goal.title})`;
    }
    return `Make progress on "${goal.title}" 4 days this week`;
  },

  generateMonthly(monthId) {
    const goals = (Store.get('goals') || []).filter(g => !g.completed);
    let name, description, target;

    if (goals.length > 0) {
      const mainGoal = goals[0];
      name = `Raid: ${mainGoal.title}`;
      description = `Monthly milestone for your top goal: "${mainGoal.title}"`;
      target = mainGoal.target ? Math.ceil(mainGoal.target * 0.3) : 10;
    } else {
      name = 'The 30-Day Forge';
      description = 'Complete 80% of all habits for the month';
      target = 24;
    }

    const data = {
      id: monthId,
      name,
      description,
      target,
      progress: 0,
      startDate: this.getMonthStart(),
      endDate: this.getMonthEnd(),
      cleared: false,
      rewards: { xp: 500, currency: 200 }
    };

    Store.set(`dungeon_monthly_${monthId}`, data);
    return data;
  },

  completeChallenge(challengeId) {
    const weekId = this.getCurrentWeekId();
    const data = this.getWeekly();
    const challenge = data.challenges.find(c => c.id === challengeId);
    if (!challenge || challenge.completed) return;

    challenge.completed = true;
    Store.set(`dungeon_weekly_${weekId}`, data);

    if (data.challenges.every(c => c.completed) && !data.cleared) {
      data.cleared = true;
      Store.set(`dungeon_weekly_${weekId}`, data);
      XP.award('dungeon', 'Weekly Dungeon Cleared', data.rewards.xp);
      XP.showXPGain(data.rewards.xp, 'Dungeon Clear!');
    }

    if (App.currentSection === 'home') Home.render();
  },

  updateMonthlyProgress(value) {
    const monthId = this.getCurrentMonthId();
    const data = this.getMonthly();
    data.progress = value;

    if (data.progress >= data.target && !data.cleared) {
      data.cleared = true;
      XP.award('raid', 'Monthly Raid Cleared', data.rewards.xp);
      XP.showXPGain(data.rewards.xp, 'Raid Boss Defeated!');
    }

    Store.set(`dungeon_monthly_${monthId}`, data);
  },

  getCurrentWeekId() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const week = Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${week}`;
  },

  getCurrentMonthId() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  },

  getWeekStart() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.getFullYear(), now.getMonth(), diff).toISOString().split('T')[0];
  },

  getWeekEnd() {
    const start = new Date(this.getWeekStart());
    start.setDate(start.getDate() + 6);
    return start.toISOString().split('T')[0];
  },

  getMonthStart() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  },

  getMonthEnd() {
    const now = new Date();
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return last.toISOString().split('T')[0];
  },

  hashStr(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
};
