const SkillTree = {
  trees: {
    strength: {
      name: 'Strength',
      icon: '&#9876;',
      skills: [
        { id: 'str1', name: 'Iron Body', desc: '+5% XP from workouts', level: 0, maxLevel: 3, cost: 2, effect: { source: 'workout', bonus: 0.05 } },
        { id: 'str2', name: 'Relentless', desc: 'Streak shield: forgive 1 missed day', level: 0, maxLevel: 1, cost: 5, requires: 'str1' },
        { id: 'str3', name: 'Titan Grip', desc: '+10% XP from workouts', level: 0, maxLevel: 3, cost: 4, requires: 'str1', effect: { source: 'workout', bonus: 0.1 } },
        { id: 'str4', name: 'Berserker', desc: 'Double XP on perfect habit days', level: 0, maxLevel: 1, cost: 8, requires: 'str3' },
      ]
    },
    intelligence: {
      name: 'Intelligence',
      icon: '&#9733;',
      skills: [
        { id: 'int1', name: 'Quick Study', desc: '+5% XP from books', level: 0, maxLevel: 3, cost: 2, effect: { source: 'book', bonus: 0.05 } },
        { id: 'int2', name: 'Deep Focus', desc: '+10% XP from journal', level: 0, maxLevel: 3, cost: 3, requires: 'int1', effect: { source: 'journal', bonus: 0.1 } },
        { id: 'int3', name: 'Polymath', desc: 'Extra daily quest slot', level: 0, maxLevel: 1, cost: 6, requires: 'int1' },
        { id: 'int4', name: 'Sage Mind', desc: '+1 stat point per level up', level: 0, maxLevel: 1, cost: 10, requires: 'int2' },
      ]
    },
    discipline: {
      name: 'Discipline',
      icon: '&#9670;',
      skills: [
        { id: 'dis1', name: 'Consistency', desc: '+5% XP from habits', level: 0, maxLevel: 3, cost: 2, effect: { source: 'habit', bonus: 0.05 } },
        { id: 'dis2', name: 'Iron Will', desc: 'Streak multiplier +0.25x', level: 0, maxLevel: 2, cost: 4, requires: 'dis1' },
        { id: 'dis3', name: 'Dungeon Master', desc: '+25% dungeon rewards', level: 0, maxLevel: 2, cost: 5, requires: 'dis1' },
        { id: 'dis4', name: 'Unbreakable', desc: 'Rank-down immunity', level: 0, maxLevel: 1, cost: 10, requires: 'dis2' },
      ]
    },
    vitality: {
      name: 'Vitality',
      icon: '&#9829;',
      skills: [
        { id: 'vit1', name: 'Recovery', desc: '+5 currency per day', level: 0, maxLevel: 3, cost: 2 },
        { id: 'vit2', name: 'Endurance', desc: '+10% all XP gains', level: 0, maxLevel: 2, cost: 5, requires: 'vit1' },
        { id: 'vit3', name: 'Rejuvenate', desc: 'Weekly bonus: +50 XP every Sunday', level: 0, maxLevel: 1, cost: 4, requires: 'vit1' },
        { id: 'vit4', name: 'Immortal', desc: 'Shadow army bonus doubled', level: 0, maxLevel: 1, cost: 10, requires: 'vit2' },
      ]
    },
    agility: {
      name: 'Agility',
      icon: '&#10148;',
      skills: [
        { id: 'agi1', name: 'Swift', desc: '+5% XP from quests', level: 0, maxLevel: 3, cost: 2, effect: { source: 'quest', bonus: 0.05 } },
        { id: 'agi2', name: 'Lucky', desc: '+10% currency from all sources', level: 0, maxLevel: 2, cost: 4, requires: 'agi1' },
        { id: 'agi3', name: 'Evasion', desc: 'Reduce rank-up requirements by 10%', level: 0, maxLevel: 1, cost: 6, requires: 'agi1' },
        { id: 'agi4', name: 'Shadow Step', desc: 'Shadows grant 2x passive bonus', level: 0, maxLevel: 1, cost: 10, requires: 'agi2' },
      ]
    }
  },

  getState() {
    return Store.get('skill_tree_state') || { points: 0, skills: {} };
  },

  saveState(state) {
    Store.set('skill_tree_state', state);
  },

  getSkillLevel(skillId) {
    const state = this.getState();
    return state.skills[skillId] || 0;
  },

  getAvailablePoints() {
    const xpState = XP.getState();
    const state = this.getState();
    const totalEarned = Math.floor(xpState.level / 2);
    const totalSpent = Object.values(state.skills).reduce((sum, v) => sum + v, 0);
    return totalEarned - totalSpent;
  },

  canUnlock(tree, skill) {
    if (skill.requires) {
      const reqLevel = this.getSkillLevel(skill.requires);
      if (reqLevel === 0) return false;
    }
    const currentLevel = this.getSkillLevel(skill.id);
    if (currentLevel >= skill.maxLevel) return false;
    return this.getAvailablePoints() >= skill.cost;
  },

  unlockSkill(treeKey, skillId) {
    const tree = this.trees[treeKey];
    if (!tree) return;
    const skill = tree.skills.find(s => s.id === skillId);
    if (!skill || !this.canUnlock(tree, skill)) return;

    const state = this.getState();
    state.skills[skillId] = (state.skills[skillId] || 0) + 1;
    this.saveState(state);

    Sync.showToast(`Unlocked: ${skill.name}`, '');
  },

  render() {
    const section = document.getElementById('section-skills');
    if (!section) return;

    const available = this.getAvailablePoints();

    section.innerHTML = `
      <div class="section-header">
        <h2 class="section-title glow-text">Skill Trees</h2>
      </div>
      <div class="section-sub">Spend points earned every 2 levels</div>
      <div style="margin-bottom: 18px;">
        <span class="badge badge-accent" style="font-size: 0.8rem; padding: 4px 12px;">Available Points: ${available}</span>
      </div>

      ${Object.entries(this.trees).map(([key, tree]) => `
        <div class="panel" style="margin-bottom: 16px;">
          <div class="corner-bl"></div>
          <div class="corner-br"></div>
          <h3 class="profile-section-title">${tree.icon} ${tree.name}</h3>
          <div class="skill-nodes">
            ${tree.skills.map(skill => {
              const level = this.getSkillLevel(skill.id);
              const unlockable = this.canUnlock(tree, skill);
              const maxed = level >= skill.maxLevel;
              let cls = 'skill-node';
              if (maxed) cls += ' maxed';
              else if (level > 0) cls += ' partial';
              else if (unlockable) cls += ' available';
              else cls += ' locked';
              return `
                <div class="${cls}" onclick="${unlockable ? `SkillTree.unlockSkill('${key}', '${skill.id}')` : ''}">
                  <div class="skill-node-header">
                    <span class="skill-node-name">${skill.name}</span>
                    <span class="skill-node-level">${level}/${skill.maxLevel}</span>
                  </div>
                  <div class="skill-node-desc">${skill.desc}</div>
                  ${!maxed ? `<div class="skill-node-cost">Cost: ${skill.cost} pts</div>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `).join('')}
    `;
  }
};
