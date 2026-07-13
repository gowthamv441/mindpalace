const Library = {
  currentTab: 'books',

  init() {
    this.render();
  },

  render() {
    const section = document.getElementById('section-library');
    if (!section) return;

    section.innerHTML = `
      <div class="section-header">
        <h2 class="section-title glow-text">Library</h2>
      </div>
      <div class="section-sub">Books · Knowledge · Resources</div>

      <div class="lib-tabs">
        <button class="lib-tab ${this.currentTab === 'books' ? 'active' : ''}" onclick="Library.switchTab('books')">Books</button>
        <button class="lib-tab ${this.currentTab === 'knowledge' ? 'active' : ''}" onclick="Library.switchTab('knowledge')">Knowledge</button>
        <button class="lib-tab ${this.currentTab === 'resources' ? 'active' : ''}" onclick="Library.switchTab('resources')">Resources</button>
      </div>

      <div id="lib-content">
        ${this.renderTab()}
      </div>
    `;
  },

  switchTab(tab) {
    this.currentTab = tab;
    this.render();
  },

  renderTab() {
    switch (this.currentTab) {
      case 'books': return this.renderBooks();
      case 'knowledge': return this.renderKnowledge();
      case 'resources': return this.renderResources();
      default: return '';
    }
  },

  // === BOOKS ===
  getBooks() { return Store.get('library_books') || []; },
  saveBooks(books) { Store.set('library_books', books); },

  renderBooks() {
    const books = this.getBooks();
    const reading = books.filter(b => b.status === 'reading');
    const want = books.filter(b => b.status === 'want');
    const completed = books.filter(b => b.status === 'completed');

    return `
      <div style="display: flex; justify-content: flex-end; margin-bottom: 14px;">
        <button class="btn btn-primary" onclick="Library.openBookEditor()">+ Add Book</button>
      </div>

      ${reading.length > 0 ? `
        <h3 class="profile-section-title">Currently Reading</h3>
        ${reading.map(b => this.renderBookCard(b)).join('')}
      ` : ''}

      ${want.length > 0 ? `
        <h3 class="profile-section-title" style="margin-top: 20px;">Want to Read</h3>
        ${want.map(b => this.renderBookCard(b)).join('')}
      ` : ''}

      ${completed.length > 0 ? `
        <h3 class="profile-section-title" style="margin-top: 20px;">Completed (${completed.length})</h3>
        ${completed.map(b => this.renderBookCard(b)).join('')}
      ` : ''}

      ${books.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">&#128214;</div>
          <div class="empty-state-text">No books yet. Start tracking your reading.</div>
        </div>
      ` : ''}
    `;
  },

  renderBookCard(book) {
    const progress = book.totalPages ? Math.round((book.currentPage / book.totalPages) * 100) : 0;
    const stars = book.rating ? '&#9733;'.repeat(book.rating) + '&#9734;'.repeat(5 - book.rating) : '';

    return `
      <div class="card" style="margin-bottom: 10px;">
        <div style="display: flex; gap: 12px;">
          <div class="book-cover">${book.title.charAt(0)}</div>
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 0.9rem;">${this.escapeHtml(book.title)}</div>
            <div style="font-size: 0.75rem; color: var(--muted);">${this.escapeHtml(book.author)}</div>
            ${book.status === 'reading' && book.totalPages ? `
              <div style="margin-top: 8px;">
                <div class="goal-meta">
                  <span>Page ${book.currentPage || 0} / ${book.totalPages}</span>
                  <span style="color: var(--accent);">${progress}%</span>
                </div>
                <div class="progress-bar" style="margin-bottom: 0;"><div class="progress-fill" style="width: ${progress}%"></div></div>
              </div>
            ` : ''}
            ${book.status === 'completed' && stars ? `<div style="color: #ffd700; font-size: 0.8rem; margin-top: 4px;">${stars}</div>` : ''}
          </div>
        </div>
        <div style="display: flex; gap: 6px; margin-top: 10px;">
          ${book.status === 'reading' ? `<button class="btn btn-sm btn-primary" onclick="Library.updateBookProgress('${book.id}')">Update</button>` : ''}
          ${book.status === 'reading' ? `<button class="btn btn-sm btn-ghost" onclick="Library.completeBook('${book.id}')">Finish</button>` : ''}
          ${book.status === 'want' ? `<button class="btn btn-sm btn-primary" onclick="Library.startBook('${book.id}')">Start</button>` : ''}
          <button class="btn btn-sm btn-ghost" onclick="Library.openBookEditor('${book.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="Library.deleteBook('${book.id}')">×</button>
        </div>
      </div>
    `;
  },

  openBookEditor(editId) {
    const books = this.getBooks();
    const existing = editId ? books.find(b => b.id === editId) : null;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'library-modal';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-title">${existing ? 'Edit Book' : 'Add Book'}</div>
        <div class="form-group">
          <label class="form-label">Title</label>
          <input class="form-input" id="book-title" value="${existing ? this.escapeHtml(existing.title) : ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Author</label>
          <input class="form-input" id="book-author" value="${existing ? this.escapeHtml(existing.author) : ''}">
        </div>
        <div style="display: flex; gap: 10px;">
          <div class="form-group" style="flex: 1;">
            <label class="form-label">Total Pages</label>
            <input class="form-input" id="book-pages" type="number" value="${existing ? existing.totalPages || '' : ''}">
          </div>
          <div class="form-group" style="flex: 1;">
            <label class="form-label">Status</label>
            <select class="form-select" id="book-status">
              <option value="want" ${existing && existing.status === 'want' ? 'selected' : ''}>Want to Read</option>
              <option value="reading" ${existing && existing.status === 'reading' ? 'selected' : ''}>Reading</option>
              <option value="completed" ${existing && existing.status === 'completed' ? 'selected' : ''}>Completed</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Notes</label>
          <textarea class="form-textarea" id="book-notes" style="min-height: 60px;">${existing && existing.notes ? this.escapeHtml(existing.notes) : ''}</textarea>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" onclick="Library.closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="Library.saveBook('${editId || ''}')">Save</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  saveBook(editId) {
    const title = document.getElementById('book-title').value.trim();
    if (!title) return;

    const books = this.getBooks();
    const data = {
      id: editId || Store.generateId(),
      title,
      author: document.getElementById('book-author').value.trim(),
      totalPages: parseInt(document.getElementById('book-pages').value) || 0,
      status: document.getElementById('book-status').value,
      currentPage: 0,
      rating: 0,
      notes: document.getElementById('book-notes').value.trim(),
      createdAt: new Date().toISOString()
    };

    if (editId) {
      const idx = books.findIndex(b => b.id === editId);
      if (idx >= 0) {
        data.currentPage = books[idx].currentPage || 0;
        data.rating = books[idx].rating || 0;
        data.createdAt = books[idx].createdAt;
        books[idx] = data;
      }
    } else {
      books.unshift(data);
    }

    this.saveBooks(books);
    this.closeModal();
    this.render();
  },

  updateBookProgress(id) {
    const books = this.getBooks();
    const book = books.find(b => b.id === id);
    if (!book) return;
    const val = prompt(`Current page (total: ${book.totalPages})`, book.currentPage || 0);
    if (val === null) return;
    book.currentPage = Math.min(parseInt(val) || 0, book.totalPages);
    this.saveBooks(books);
    this.render();
  },

  startBook(id) {
    const books = this.getBooks();
    const book = books.find(b => b.id === id);
    if (!book) return;
    book.status = 'reading';
    this.saveBooks(books);
    this.render();
  },

  completeBook(id) {
    const books = this.getBooks();
    const book = books.find(b => b.id === id);
    if (!book) return;
    const rating = prompt('Rate this book (1-5)', '5');
    book.status = 'completed';
    book.currentPage = book.totalPages;
    book.rating = Math.min(5, Math.max(1, parseInt(rating) || 5));
    book.completedAt = new Date().toISOString();
    this.saveBooks(books);

    const result = XP.award('book', book.title, XP.rewards.bookFinished);
    XP.showXPGain(result.amount, 'Book Finished');

    this.render();
  },

  deleteBook(id) {
    if (!confirm('Delete this book?')) return;
    this.saveBooks(this.getBooks().filter(b => b.id !== id));
    this.render();
  },

  // === KNOWLEDGE BASE ===
  getKnowledge() { return Store.get('library_knowledge') || []; },
  saveKnowledge(items) { Store.set('library_knowledge', items); },

  renderKnowledge() {
    const items = this.getKnowledge();
    const allTags = [...new Set(items.flatMap(i => i.tags || []))];

    return `
      <div style="display: flex; justify-content: flex-end; margin-bottom: 14px;">
        <button class="btn btn-primary" onclick="Library.openKnowledgeEditor()">+ Add</button>
      </div>

      ${allTags.length > 0 ? `
        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px;">
          ${allTags.map(t => `<span class="badge badge-success">${t}</span>`).join('')}
        </div>
      ` : ''}

      ${items.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">&#128161;</div>
          <div class="empty-state-text">Save learnings, quotes, and insights here.</div>
        </div>
      ` : items.map(item => `
        <div class="card" style="margin-bottom: 10px;">
          <div style="font-weight: 600; font-size: 0.9rem; margin-bottom: 4px;">${this.escapeHtml(item.title)}</div>
          <div style="font-size: 0.8rem; color: var(--text); line-height: 1.6; white-space: pre-wrap;">${this.escapeHtml(item.content).substring(0, 200)}${item.content.length > 200 ? '...' : ''}</div>
          ${item.source ? `<div style="font-size: 0.7rem; color: var(--muted); margin-top: 6px;">Source: ${this.escapeHtml(item.source)}</div>` : ''}
          ${item.tags && item.tags.length ? `<div style="margin-top: 6px; display: flex; gap: 4px; flex-wrap: wrap;">${item.tags.map(t => `<span class="badge badge-success">${t}</span>`).join('')}</div>` : ''}
          <div style="display: flex; gap: 6px; margin-top: 10px;">
            <button class="btn btn-sm btn-ghost" onclick="Library.openKnowledgeEditor('${item.id}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="Library.deleteKnowledge('${item.id}')">×</button>
          </div>
        </div>
      `).join('')}
    `;
  },

  openKnowledgeEditor(editId) {
    const items = this.getKnowledge();
    const existing = editId ? items.find(i => i.id === editId) : null;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'library-modal';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-title">${existing ? 'Edit Entry' : 'New Entry'}</div>
        <div class="form-group">
          <label class="form-label">Title</label>
          <input class="form-input" id="know-title" value="${existing ? this.escapeHtml(existing.title) : ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Content</label>
          <textarea class="form-textarea" id="know-content" style="min-height: 100px;">${existing ? this.escapeHtml(existing.content) : ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Source (optional)</label>
          <input class="form-input" id="know-source" value="${existing ? this.escapeHtml(existing.source || '') : ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Tags (comma separated)</label>
          <input class="form-input" id="know-tags" value="${existing && existing.tags ? existing.tags.join(', ') : ''}">
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" onclick="Library.closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="Library.saveKnowledge('${editId || ''}')">Save</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  saveKnowledge(editId) {
    const title = document.getElementById('know-title').value.trim();
    if (!title) return;

    const items = this.getKnowledge();
    const tagsRaw = document.getElementById('know-tags').value;
    const data = {
      id: editId || Store.generateId(),
      title,
      content: document.getElementById('know-content').value.trim(),
      source: document.getElementById('know-source').value.trim(),
      tags: tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [],
      createdAt: new Date().toISOString()
    };

    if (editId) {
      const idx = items.findIndex(i => i.id === editId);
      if (idx >= 0) { data.createdAt = items[idx].createdAt; items[idx] = data; }
    } else {
      items.unshift(data);
    }

    this.saveKnowledge(items);
    this.closeModal();
    this.render();
  },

  deleteKnowledge(id) {
    if (!confirm('Delete this entry?')) return;
    this.saveKnowledge(this.getKnowledge().filter(i => i.id !== id));
    this.render();
  },

  // === RESOURCES ===
  getResources() { return Store.get('library_resources') || []; },
  saveResources(items) { Store.set('library_resources', items); },

  renderResources() {
    const items = this.getResources();

    return `
      <div style="display: flex; justify-content: flex-end; margin-bottom: 14px;">
        <button class="btn btn-primary" onclick="Library.openResourceEditor()">+ Add</button>
      </div>

      ${items.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">&#128279;</div>
          <div class="empty-state-text">Save links, videos, and podcasts here.</div>
        </div>
      ` : items.map(item => `
        <div class="card" style="margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="resource-type-icon">${this.resourceIcon(item.type)}</div>
            <div style="flex: 1;">
              <div style="font-weight: 600; font-size: 0.85rem;">${item.url ? `<a href="${this.escapeHtml(item.url)}" target="_blank" style="color: var(--text); text-decoration: none;">${this.escapeHtml(item.title)}</a>` : this.escapeHtml(item.title)}</div>
              <div style="font-size: 0.7rem; color: var(--muted);">${item.type} ${item.tags && item.tags.length ? '· ' + item.tags.join(', ') : ''}</div>
            </div>
            ${item.pinned ? '<span class="badge badge-accent">Pinned</span>' : ''}
          </div>
          <div style="display: flex; gap: 6px; margin-top: 8px;">
            <button class="btn btn-sm btn-ghost" onclick="Library.togglePin('${item.id}')">${item.pinned ? 'Unpin' : 'Pin'}</button>
            <button class="btn btn-sm btn-ghost" onclick="Library.openResourceEditor('${item.id}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="Library.deleteResource('${item.id}')">×</button>
          </div>
        </div>
      `).join('')}
    `;
  },

  resourceIcon(type) {
    const icons = { article: '&#128196;', video: '&#127909;', podcast: '&#127911;', link: '&#128279;' };
    return icons[type] || '&#128279;';
  },

  openResourceEditor(editId) {
    const items = this.getResources();
    const existing = editId ? items.find(i => i.id === editId) : null;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'library-modal';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-title">${existing ? 'Edit Resource' : 'Add Resource'}</div>
        <div class="form-group">
          <label class="form-label">Title</label>
          <input class="form-input" id="res-title" value="${existing ? this.escapeHtml(existing.title) : ''}">
        </div>
        <div class="form-group">
          <label class="form-label">URL (optional)</label>
          <input class="form-input" id="res-url" value="${existing ? this.escapeHtml(existing.url || '') : ''}">
        </div>
        <div style="display: flex; gap: 10px;">
          <div class="form-group" style="flex: 1;">
            <label class="form-label">Type</label>
            <select class="form-select" id="res-type">
              <option value="article" ${existing && existing.type === 'article' ? 'selected' : ''}>Article</option>
              <option value="video" ${existing && existing.type === 'video' ? 'selected' : ''}>Video</option>
              <option value="podcast" ${existing && existing.type === 'podcast' ? 'selected' : ''}>Podcast</option>
              <option value="link" ${existing && existing.type === 'link' ? 'selected' : ''}>Link</option>
            </select>
          </div>
          <div class="form-group" style="flex: 1;">
            <label class="form-label">Tags (comma separated)</label>
            <input class="form-input" id="res-tags" value="${existing && existing.tags ? existing.tags.join(', ') : ''}">
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" onclick="Library.closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="Library.saveResource('${editId || ''}')">Save</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  saveResource(editId) {
    const title = document.getElementById('res-title').value.trim();
    if (!title) return;

    const items = this.getResources();
    const tagsRaw = document.getElementById('res-tags').value;
    const data = {
      id: editId || Store.generateId(),
      title,
      url: document.getElementById('res-url').value.trim(),
      type: document.getElementById('res-type').value,
      tags: tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [],
      pinned: false,
      createdAt: new Date().toISOString()
    };

    if (editId) {
      const idx = items.findIndex(i => i.id === editId);
      if (idx >= 0) { data.pinned = items[idx].pinned; data.createdAt = items[idx].createdAt; items[idx] = data; }
    } else {
      items.unshift(data);
    }

    this.saveResources(items);
    this.closeModal();
    this.render();
  },

  togglePin(id) {
    const items = this.getResources();
    const item = items.find(i => i.id === id);
    if (item) item.pinned = !item.pinned;
    items.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    this.saveResources(items);
    this.render();
  },

  deleteResource(id) {
    if (!confirm('Delete this resource?')) return;
    this.saveResources(this.getResources().filter(i => i.id !== id));
    this.render();
  },

  closeModal() {
    const modal = document.getElementById('library-modal');
    if (modal) modal.remove();
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }
};
