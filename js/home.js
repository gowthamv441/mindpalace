const Home = {
  init() {
    this.render();
  },

  render() {
    const section = document.getElementById('section-home');
    const profile = Profile.getProfile();
    const name = profile.hunterName || 'Hunter';
    const xpState = XP.getState();
    const { xpIntoLevel, xpForNext } = XP.getCurrentLevelProgress(xpState);
    const levelPct = Math.min(100, Math.round((xpIntoLevel / xpForNext) * 100));
    const todayXP = XP.getTodayXP();
    const questData = Quests.getToday();

    const nextRank = Ranks.getNextRank();
    const gateStatus = nextRank ? Ranks.getGateStatus(nextRank) : null;

    section.innerHTML = `
      <div class="home-welcome">
        <div class="welcome-text">
          <span class="welcome-label">System Notice</span>
          <h1 class="welcome-msg" id="typing-target"></h1>
          <div class="typing-cursor" id="typing-cursor">|</div>
        </div>
      </div>

      <div class="section-header">
        <h2 class="section-title glow-text">Hunter Profile</h2>
        <button class="btn btn-primary" onclick="Profile.openEditor()">Edit</button>
      </div>
      <div class="section-sub">Your identity in the system</div>

      <div class="profile-card">
        <div class="profile-avatar">
          <div class="avatar-rank">${profile.rank}</div>
        </div>
        <div class="profile-info">
          <div class="profile-name">${Profile.escapeHtml(profile.hunterName)}</div>
          <div class="profile-class">${profile.hunterClass} — Rank ${profile.rank}</div>
        </div>
      </div>

      <div class="panel">
        <div class="corner-bl"></div>
        <div class="corner-br"></div>
        <h3 class="profile-section-title">Level ${xpState.level}</h3>
        <div class="xp-bar-container">
          <div class="progress-bar" style="margin-bottom: 6px;">
            <div class="progress-fill" style="width: ${levelPct}%"></div>
          </div>
          <div class="xp-bar-labels">
            <span>${xpIntoLevel} / ${xpForNext} XP</span>
            <span>+${todayXP} today</span>
          </div>
        </div>
        <div class="profile-summary-grid" style="margin-top: 14px;">
          <div class="stat">
            <div class="num">${xpState.totalXP}</div>
            <div class="label">Total XP</div>
          </div>
          <div class="stat">
            <div class="num">${xpState.level}</div>
            <div class="label">Level</div>
          </div>
          <div class="stat">
            <div class="num">${xpState.currency || 0}</div>
            <div class="label">Gold</div>
          </div>
          <div class="stat">
            <div class="num">x${XP.getStreakMultiplier()}</div>
            <div class="label">Multiplier</div>
          </div>
        </div>
      </div>

      <div class="panel" style="margin-top: 20px;">
        <div class="corner-bl"></div>
        <div class="corner-br"></div>
        <h3 class="profile-section-title">Daily Quests</h3>
        <div class="quest-list">
          ${questData.quests.map(q => `
            <div class="quest-item ${q.completed ? 'done' : ''}" onclick="${q.completed ? '' : `Quests.completeQuest('${q.id}')`}">
              <div class="quest-check">${q.completed ? '&#10003;' : ''}</div>
              <div class="quest-info">
                <div class="quest-name">${q.name}</div>
                <div class="quest-meta">
                  <span class="quest-rank" style="color: ${Quests.rankColor(q.rank)}">${q.rank}-Rank</span>
                  <span>+${q.xp} XP</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        ${questData.quests.every(q => q.completed) ? `
          <div style="text-align: center; margin-top: 12px; font-size: 0.8rem; color: var(--accent);">
            All quests complete! +${questData.allCompleteBonus} XP bonus ${questData.bonusClaimed ? '(claimed)' : ''}
          </div>
        ` : ''}
      </div>

      ${gateStatus ? `
        <div class="panel" style="margin-top: 20px;">
          <div class="corner-bl"></div>
          <div class="corner-br"></div>
          <h3 class="profile-section-title">Rank-Up Gate: ${nextRank}</h3>
          <div class="gate-requirements">
            <div class="gate-req ${gateStatus.met.level ? 'met' : ''}">
              <span class="gate-check">${gateStatus.met.level ? '&#10003;' : '&#10007;'}</span>
              <span>Level ${gateStatus.requirements.minLevel}</span>
              <span class="gate-progress">(${gateStatus.progress.level}/${gateStatus.requirements.minLevel})</span>
            </div>
            <div class="gate-req ${gateStatus.met.streakDays ? 'met' : ''}">
              <span class="gate-check">${gateStatus.met.streakDays ? '&#10003;' : '&#10007;'}</span>
              <span>${gateStatus.requirements.streakDays}-day streak</span>
              <span class="gate-progress">(${gateStatus.progress.streakDays}/${gateStatus.requirements.streakDays})</span>
            </div>
            <div class="gate-req ${gateStatus.met.goalsCompleted ? 'met' : ''}">
              <span class="gate-check">${gateStatus.met.goalsCompleted ? '&#10003;' : '&#10007;'}</span>
              <span>${gateStatus.requirements.goalsCompleted} goals completed</span>
              <span class="gate-progress">(${gateStatus.progress.goalsCompleted}/${gateStatus.requirements.goalsCompleted})</span>
            </div>
          </div>
          ${Ranks.canRankUp() ? `
            <button class="btn btn-primary" style="width: 100%; margin-top: 14px;" onclick="Ranks.rankUp()">
              Attempt Rank-Up to ${nextRank}
            </button>
          ` : ''}
        </div>
      ` : `
        <div class="panel" style="margin-top: 20px; text-align: center;">
          <div class="corner-bl"></div>
          <div class="corner-br"></div>
          <div style="font-family: 'Orbitron', sans-serif; font-size: 1.2rem; color: var(--accent); font-weight: 700;">S-RANK</div>
          <div style="font-size: 0.8rem; color: var(--muted); margin-top: 6px;">Maximum rank achieved</div>
        </div>
      `}

      <div class="panel" style="margin-top: 20px;">
        <div class="corner-bl"></div>
        <div class="corner-br"></div>
        <h3 class="profile-section-title">Summary</h3>
        <div class="profile-summary-grid">
          <div class="stat">
            <div class="num">${Profile.getTotalEntries()}</div>
            <div class="label">Journal</div>
          </div>
          <div class="stat">
            <div class="num">${Profile.getTotalHabits()}</div>
            <div class="label">Habits</div>
          </div>
          <div class="stat">
            <div class="num">${Profile.getTotalGoals()}</div>
            <div class="label">Goals</div>
          </div>
          <div class="stat">
            <div class="num">${profile.level}</div>
            <div class="label">Level</div>
          </div>
        </div>
      </div>

      <div class="home-nav-section">
        <h3 class="profile-section-title" style="margin-bottom: 12px; margin-top: 28px;">Quick Access</h3>
        <div class="home-nav-cards">
          <div class="home-nav-card" onclick="App.navigate('journal')">
            <img class="home-nav-img" src="https://api.iconify.design/mdi/book-edit-outline.svg?color=%234cc9ff" alt="">
            <span class="home-nav-label">Journal</span>
          </div>
          <div class="home-nav-card" onclick="App.navigate('habits')">
            <img class="home-nav-img" src="https://api.iconify.design/mdi/sword-cross.svg?color=%234cc9ff" alt="">
            <span class="home-nav-label">Habits</span>
          </div>
          <div class="home-nav-card" onclick="App.navigate('goals')">
            <img class="home-nav-img" src="https://api.iconify.design/mdi/target-arrow.svg?color=%234cc9ff" alt="">
            <span class="home-nav-label">Goals</span>
          </div>
          <div class="home-nav-card" onclick="App.navigate('settings')">
            <img class="home-nav-img" src="https://api.iconify.design/mdi/cog-outline.svg?color=%234cc9ff" alt="">
            <span class="home-nav-label">Settings</span>
          </div>
        </div>
      </div>
    `;

    this.startTyping(name);
  },

  startTyping(name) {
    const target = document.getElementById('typing-target');
    const cursor = document.getElementById('typing-cursor');
    if (!target) return;

    const message = `Welcome back, ${name}. Your palace awaits.`;
    let i = 0;

    const type = () => {
      if (i < message.length) {
        target.textContent += message[i];
        i++;
        setTimeout(type, 45);
      } else {
        cursor.classList.add('blink');
      }
    };

    target.textContent = '';
    setTimeout(type, 400);
  }
};
