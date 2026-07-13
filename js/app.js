const App = {
  currentSection: 'journal',

  init() {
    this.bindNav();
    Journal.init();
    Habits.init();
    Goals.init();
    Achievements.init();
  },

  bindNav() {
    document.querySelectorAll('.nav-link, .tab').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.dataset.section;
        this.navigate(section);
      });
    });
  },

  navigate(section) {
    this.currentSection = section;

    document.querySelectorAll('.nav-link').forEach(el => {
      el.classList.toggle('active', el.dataset.section === section);
    });

    document.querySelectorAll('.tab').forEach(el => {
      el.classList.toggle('active', el.dataset.section === section);
    });

    document.querySelectorAll('.section').forEach(el => {
      el.classList.toggle('active', el.id === `section-${section}`);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
