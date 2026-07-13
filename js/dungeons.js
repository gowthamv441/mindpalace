const Dungeons = {
  types: [
    { key: 'discipline', name: 'Discipline Dungeon', icon: '&#9876;' },
    { key: 'strength', name: 'Strength Dungeon', icon: '&#9889;' },
    { key: 'intelligence', name: 'Knowledge Dungeon', icon: '&#9733;' },
    { key: 'vitality', name: 'Vitality Dungeon', icon: '&#9829;' }
  ],

  weeklyChallenges: {
    discipline: [
      'Complete all habits for 5 days',
      'Write journal entries for 5 days',
      'Complete all daily quests for 3 days',
      'No missed habits for 4 consecutive days',
      'Meditate or reflect every day this week'
    ],
    strength: [
      'Log 4 workouts this week',
      'Hit 10,000 steps for 5 days',
      'Complete 200 pushups total',
      'Exercise for 30+ minutes 5 times',
      'Try a new exercise'
    ],
    intelligence: [
      'Read for 2 hours total this week',
      'Learn 3 new concepts',
      'Complete a course module',
      'Write notes on what you learned for 4 days',
      'Solve 3 coding challenges'
    ],
    vitality: [
      'Drink 3L water for 5 days',
      'Sleep 7+ hours for 5 nights',
      'Eat clean for 5 days',
      'No caffeine after 2 PM for 5 days',
      'Cook healthy meals 4 times'
    ]
  },

  monthlyRaids: [
    { name: 'The 30-Day Forge', desc: 'Complete 80% of all habits for the entire month', target: 80 },
    { name: 'Shadow Monarch Trial', desc: 'Reach 3 completed goals this month', target: 3 },
    { name: 'Tower of Knowledge', desc: 'Write 20 journal entries this month', target: 20 },
    { name: 'Iron Will Gauntlet', desc: 'Maintain a 14-day streak', target: 14 }
  ],

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
    const seed = this.hashStr(weekId);
    const typeIdx = seed % this.types.length;
    const type = this.types[typeIdx];
    const pool = this.weeklyChallenges[type.key];

    const challenges = [];
    const used = new Set();
    for (let i = 0; i < 3; i++) {
      let idx = (seed + i * 3) % pool.length;
      while (used.has(idx)) idx = (idx + 1) % pool.length;
      used.add(idx);
      challenges.push({ id: `wc_${i}`, name: pool[idx], completed: false });
    }

    const data = {
      id: weekId,
      name: type.name,
      type: type.key,
      icon: type.icon,
      startDate: this.getWeekStart(),
      endDate: this.getWeekEnd(),
      challenges,
      cleared: false,
      rewards: { xp: 150, currency: 50 }
    };

    Store.set(`dungeon_weekly_${weekId}`, data);
    return data;
  },

  generateMonthly(monthId) {
    const seed = this.hashStr(monthId);
    const raid = this.monthlyRaids[seed % this.monthlyRaids.length];

    const data = {
      id: monthId,
      name: raid.name,
      description: raid.desc,
      target: raid.target,
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

      Shadows.addShadow({
        name: data.name + ' Shadow',
        type: 'knight',
        source: `raid:${monthId}`,
        rank: 'B'
      });
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
    return new Date(now.setDate(diff)).toISOString().split('T')[0];
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
