const App = {
  currentSection: 'home',

  init() {
    this.bindNav();
    Home.init();
    Journal.init();
    Habits.init();
    Goals.init();
    Achievements.init();
    Library.init();
    Workouts.init();
    Settings.init();
  },

  bindNav() {
    document.querySelectorAll('.tab').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.dataset.section;
        this.navigate(section);
      });
    });
  },

  navigate(section) {
    this.currentSection = section;

    document.querySelectorAll('.tab').forEach(el => {
      el.classList.toggle('active', el.dataset.section === section);
    });

    document.querySelectorAll('.section').forEach(el => {
      el.classList.toggle('active', el.id === `section-${section}`);
    });

    if (section === 'settings') Settings.render();
    if (section === 'home') Home.render();
    if (section === 'library') Library.render();
    if (section === 'workouts') Workouts.render();
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
