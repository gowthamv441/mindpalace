const Home = {
  init() {
    this.render();
  },

  render() {
    const section = document.getElementById('section-home');
    const profile = Profile.getProfile();
    const name = profile.hunterName || 'Hunter';

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
          <div class="home-nav-card" onclick="App.navigate('achievements')">
            <img class="home-nav-img" src="https://api.iconify.design/mdi/trophy-outline.svg?color=%234cc9ff" alt="">
            <span class="home-nav-label">Achieve</span>
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
