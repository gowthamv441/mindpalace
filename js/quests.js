const Quests = {
  questPool: {
    discipline: [
      { name: 'Wake up before 6 AM', rank: 'C' },
      { name: 'No social media until noon', rank: 'B' },
      { name: 'Meditate for 20 minutes', rank: 'C' },
      { name: 'Cold shower', rank: 'B' },
      { name: 'Read for 30 minutes', rank: 'C' },
      { name: 'No junk food today', rank: 'C' },
      { name: 'Write 500 words', rank: 'B' },
      { name: 'Complete all habits before noon', rank: 'A' },
      { name: 'No phone for 2 hours straight', rank: 'B' },
      { name: 'Plan tomorrow before bed', rank: 'D' },
    ],
    strength: [
      { name: 'Do 50 pushups', rank: 'C' },
      { name: 'Do 100 pushups', rank: 'B' },
      { name: 'Run 3 km', rank: 'C' },
      { name: 'Run 5 km', rank: 'B' },
      { name: 'Hold plank for 3 minutes', rank: 'B' },
      { name: '10,000 steps', rank: 'C' },
      { name: '15,000 steps', rank: 'B' },
      { name: 'Workout for 60+ minutes', rank: 'A' },
      { name: 'Stretch for 15 minutes', rank: 'D' },
      { name: 'Do 200 bodyweight reps total', rank: 'A' },
    ],
    intelligence: [
      { name: 'Learn one new concept', rank: 'D' },
      { name: 'Watch an educational video', rank: 'D' },
      { name: 'Read 20 pages', rank: 'C' },
      { name: 'Read 50 pages', rank: 'B' },
      { name: 'Solve a coding challenge', rank: 'C' },
      { name: 'Write notes on what you learned', rank: 'C' },
      { name: 'Teach someone something', rank: 'B' },
      { name: 'Study for 2 hours uninterrupted', rank: 'A' },
      { name: 'Complete a course module', rank: 'B' },
      { name: 'Read a research paper', rank: 'A' },
    ],
    vitality: [
      { name: 'Drink 3 litres of water', rank: 'C' },
      { name: 'Eat 5 servings of vegetables', rank: 'C' },
      { name: 'Sleep 8 hours', rank: 'C' },
      { name: 'No caffeine after 2 PM', rank: 'D' },
      { name: 'Cook a healthy meal', rank: 'C' },
      { name: 'No sugar today', rank: 'B' },
      { name: 'Take vitamins', rank: 'D' },
      { name: 'Sunlight within 30 min of waking', rank: 'D' },
      { name: 'No eating after 8 PM', rank: 'B' },
      { name: 'Full clean eating day', rank: 'A' },
    ]
  },

  getToday() {
    const today = Store.formatDate(new Date());
    const saved = Store.get(`quests_${today}`);
    if (saved) return saved;
    return this.generate(today);
  },

  generate(dateStr) {
    const seed = this.hashDate(dateStr);
    const categories = Object.keys(this.questPool);
    const quests = [];

    for (let i = 0; i < 4; i++) {
      const cat = categories[i % categories.length];
      const pool = this.questPool[cat];
      const idx = (seed + i * 7) % pool.length;
      const quest = pool[idx];
      quests.push({
        id: `quest_${dateStr}_${i}`,
        name: quest.name,
        rank: quest.rank,
        type: cat,
        xp: XP.rewards[`quest${quest.rank}`],
        completed: false
      });
    }

    const data = {
      date: dateStr,
      quests,
      allCompleteBonus: 50,
      bonusClaimed: false
    };

    Store.set(`quests_${dateStr}`, data);
    return data;
  },

  hashDate(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  },

  completeQuest(questId) {
    const today = Store.formatDate(new Date());
    const data = this.getToday();
    const quest = data.quests.find(q => q.id === questId);
    if (!quest || quest.completed) return;

    quest.completed = true;
    Store.set(`quests_${today}`, data);

    const result = XP.award('quest', quest.name, quest.xp);
    XP.showXPGain(result.amount, quest.name);

    if (data.quests.every(q => q.completed) && !data.bonusClaimed) {
      data.bonusClaimed = true;
      Store.set(`quests_${today}`, data);
      const bonus = XP.award('quest_bonus', 'All quests complete!', data.allCompleteBonus);
      setTimeout(() => XP.showXPGain(bonus.amount, 'All Quests Bonus'), 500);
    }

    if (typeof Home !== 'undefined' && App.currentSection === 'home') {
      Home.render();
    }
  },

  rankColor(rank) {
    const colors = { D: '#3b82f6', C: '#22c55e', B: '#eab308', A: '#f97316', S: '#ef4444' };
    return colors[rank] || 'var(--accent)';
  }
};
