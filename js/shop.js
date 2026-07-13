const Shop = {
  shopItems: [
    { id: 'xp_boost', name: 'XP Boost (2x, 24h)', type: 'consumable', price: 100, desc: 'Double all XP gains for 24 hours' },
    { id: 'streak_shield', name: 'Streak Shield', type: 'consumable', price: 150, desc: 'Protect your streak from one missed day' },
    { id: 'quest_reroll', name: 'Quest Reroll', type: 'consumable', price: 50, desc: 'Regenerate today\'s daily quests' },
    { id: 'shadow_name', name: 'Shadow Rename', type: 'consumable', price: 30, desc: 'Rename one shadow in your army' },
    { id: 'theme_crimson', name: 'Crimson Theme', type: 'theme', price: 300, desc: 'Dark red accent theme' },
    { id: 'theme_emerald', name: 'Emerald Theme', type: 'theme', price: 300, desc: 'Green accent theme' },
    { id: 'theme_gold', name: 'Golden Theme', type: 'theme', price: 500, desc: 'Gold accent for S-rank hunters' },
    { id: 'title_shadow_lord', name: 'Title: Shadow Lord', type: 'title', price: 200, desc: 'Display title on your profile' },
    { id: 'title_dungeon_crawler', name: 'Title: Dungeon Crawler', type: 'title', price: 150, desc: 'Display title on your profile' },
    { id: 'title_iron_will', name: 'Title: Iron Will', type: 'title', price: 250, desc: 'Display title on your profile' },
  ],

  getInventory() {
    return Store.get('shop_inventory') || [];
  },

  saveInventory(items) {
    Store.set('shop_inventory', items);
  },

  getCurrency() {
    const xpState = XP.getState();
    return xpState.currency || 0;
  },

  spendCurrency(amount) {
    const xpState = XP.getState();
    if ((xpState.currency || 0) < amount) return false;
    xpState.currency -= amount;
    XP.saveState(xpState);
    return true;
  },

  owns(itemId) {
    return this.getInventory().some(i => i.id === itemId);
  },

  purchase(itemId) {
    const item = this.shopItems.find(i => i.id === itemId);
    if (!item) return;

    if (item.type !== 'consumable' && this.owns(itemId)) {
      Sync.showToast('Already owned', '');
      return;
    }

    if (!this.spendCurrency(item.price)) {
      Sync.showToast('Not enough gold', '');
      return;
    }

    const inventory = this.getInventory();
    inventory.push({
      id: item.type === 'consumable' ? Store.generateId() : item.id,
      itemId: item.id,
      name: item.name,
      type: item.type,
      active: false,
      purchasedAt: new Date().toISOString()
    });
    this.saveInventory(inventory);
    Sync.showToast(`Purchased: ${item.name}`, '');
    this.render();
  },

  activate(inventoryId) {
    const inventory = this.getInventory();
    const item = inventory.find(i => i.id === inventoryId);
    if (!item) return;

    if (item.type === 'title') {
      inventory.forEach(i => { if (i.type === 'title') i.active = false; });
      item.active = true;
    } else if (item.type === 'theme') {
      inventory.forEach(i => { if (i.type === 'theme') i.active = false; });
      item.active = true;
      this.applyTheme(item.itemId);
    } else if (item.type === 'consumable') {
      this.useConsumable(item);
      const idx = inventory.indexOf(item);
      if (idx >= 0) inventory.splice(idx, 1);
    }

    this.saveInventory(inventory);
    this.render();
  },

  useConsumable(item) {
    switch (item.itemId) {
      case 'xp_boost':
        Store.set('xp_boost_until', new Date(Date.now() + 86400000).toISOString());
        Sync.showToast('2x XP active for 24 hours!', '');
        break;
      case 'streak_shield':
        Store.set('streak_shield', true);
        Sync.showToast('Streak shield active!', '');
        break;
      case 'quest_reroll':
        const today = Store.formatDate(new Date());
        Store.remove(`quests_${today}`);
        Sync.showToast('Daily quests rerolled!', '');
        break;
      default:
        Sync.showToast(`Used: ${item.name}`, '');
    }
  },

  applyTheme(itemId) {
    const themes = {
      theme_crimson: { accent: '#ff4c6b', accentDim: 'rgba(255,76,107,0.15)', accentGlow: '0 0 15px rgba(255,76,107,0.15)' },
      theme_emerald: { accent: '#22c55e', accentDim: 'rgba(34,197,94,0.15)', accentGlow: '0 0 15px rgba(34,197,94,0.15)' },
      theme_gold: { accent: '#ffd700', accentDim: 'rgba(255,215,0,0.15)', accentGlow: '0 0 15px rgba(255,215,0,0.15)' },
    };
    const theme = themes[itemId];
    if (theme) {
      document.documentElement.style.setProperty('--accent', theme.accent);
      document.documentElement.style.setProperty('--accent-dim', theme.accentDim);
      document.documentElement.style.setProperty('--accent-glow', theme.accentGlow);
      Store.set('active_theme', itemId);
    }
  },

  loadTheme() {
    const activeTheme = Store.get('active_theme');
    if (activeTheme) this.applyTheme(activeTheme);
  },

  getActiveTitle() {
    const inventory = this.getInventory();
    const active = inventory.find(i => i.type === 'title' && i.active);
    return active ? active.name.replace('Title: ', '') : null;
  },

  render() {
    const section = document.getElementById('section-shop');
    if (!section) return;

    const currency = this.getCurrency();
    const inventory = this.getInventory();

    section.innerHTML = `
      <div class="section-header">
        <h2 class="section-title glow-text">Shop</h2>
        <span class="badge badge-accent" style="font-size: 0.85rem; padding: 6px 14px;">${currency} Gold</span>
      </div>
      <div class="section-sub">Spend gold earned from XP gains</div>

      <div class="panel">
        <div class="corner-bl"></div>
        <div class="corner-br"></div>
        <h3 class="profile-section-title">Available Items</h3>
        <div class="shop-grid">
          ${this.shopItems.map(item => {
            const owned = item.type !== 'consumable' && this.owns(item.id);
            return `
              <div class="shop-item ${owned ? 'owned' : ''}">
                <div class="shop-item-type">${this.typeIcon(item.type)}</div>
                <div class="shop-item-name">${item.name}</div>
                <div class="shop-item-desc">${item.desc}</div>
                <div class="shop-item-price">
                  ${owned ? '<span style="color: var(--accent);">Owned</span>' : `
                    <button class="btn btn-sm btn-primary" onclick="Shop.purchase('${item.id}')" ${currency < item.price ? 'disabled' : ''}>${item.price} Gold</button>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      ${inventory.length > 0 ? `
        <div class="panel" style="margin-top: 20px;">
          <div class="corner-bl"></div>
          <div class="corner-br"></div>
          <h3 class="profile-section-title">Inventory (${inventory.length})</h3>
          ${inventory.map(item => `
            <div class="card" style="margin-bottom: 8px; padding: 12px;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <div style="font-size: 0.85rem; font-weight: 600;">${item.name}</div>
                  <div style="font-size: 0.7rem; color: var(--muted);">${item.type}${item.active ? ' · Active' : ''}</div>
                </div>
                <button class="btn btn-sm ${item.active ? 'btn-ghost' : 'btn-primary'}" onclick="Shop.activate('${item.id}')">
                  ${item.active ? 'Active' : 'Use'}
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;
  },

  typeIcon(type) {
    const icons = { consumable: '&#9889;', theme: '&#127912;', title: '&#128081;' };
    return icons[type] || '&#9670;';
  }
};
