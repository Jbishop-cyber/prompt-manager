/* ============================================
   AI Prompt Manager — Sidebar Component
   ============================================ */

import store from '../store.js';
import { supabase } from '../supabase.js';
import { showToast } from '../toast.js';

const PRESET_COLORS = [
  '#6c63ff', '#a78bfa', '#38bdf8', '#34d399', '#fbbf24',
  '#f87171', '#fb923c', '#e879f9', '#22d3ee', '#4ade80',
];

const PRESET_ICONS = [
  '📝', '💻', '✍️', '📊', '🎨', '💼', '🧪', '🎯',
  '🔧', '📁', '🚀', '💡', '🎮', '📚', '🔒', '🌍',
];

export async function renderSidebar(appEl) {
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  sidebar.id = 'sidebar';
  sidebar.innerHTML = await buildSidebarHTML();
  appEl.prepend(sidebar);

  // Mobile menu button
  const mobileBtn = document.createElement('button');
  mobileBtn.className = 'mobile-menu-btn';
  mobileBtn.id = 'mobile-menu-btn';
  mobileBtn.innerHTML = '☰';
  mobileBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
  document.body.appendChild(mobileBtn);

  // Sidebar toggle
  sidebar.querySelector('#sidebar-toggle').addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });

  // Navigation clicks
  sidebar.addEventListener('click', (e) => {
    const navItem = e.target.closest('.nav-item[data-route]');
    if (navItem) {
      location.hash = '#' + navItem.dataset.route;
      sidebar.classList.remove('open');
    }
  });

  // Search — auto-navigate to library if not already there
  const searchInput = sidebar.querySelector('#sidebar-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      // If not on library page, navigate there first
      const currentHash = (location.hash.slice(1) || '/').split('?')[0];
      if (currentHash !== '/library' && q.length > 0) {
        location.hash = '#/library';
        // Wait for route change, then fire search
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('sidebar:search', { detail: q }));
        }, 50);
      } else {
        window.dispatchEvent(new CustomEvent('sidebar:search', { detail: q }));
      }
    });
  }

  // Category action buttons (edit/delete)
  sidebar.addEventListener('click', async (e) => {
    const editBtn = e.target.closest('.cat-edit-btn');
    const deleteBtn = e.target.closest('.cat-delete-btn');
    if (editBtn) {
      e.stopPropagation();
      const catId = editBtn.dataset.catId;
      const cat = await store.getCategory(catId);
      if (cat) showCategoryModal(sidebar, cat);
    }
    if (deleteBtn) {
      e.stopPropagation();
      const catId = deleteBtn.dataset.catId;
      const cat = await store.getCategory(catId);
      if (cat && confirm(`Delete category "${cat.name}"? Prompts will be moved to General.`)) {
        await store.deleteCategory(catId);
        showToast(`Category "${cat.name}" deleted`, 'success');
      }
    }
  });

  // Logout button
  const logoutBtn = sidebar.querySelector('#sidebar-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await supabase.auth.signOut();
      store._user = null;
      showToast('Logged out successfully', 'success');
      window.location.hash = '/login';
    });
  }

  // Add Category button
  sidebar.addEventListener('click', (e) => {
    if (e.target.closest('#sidebar-add-category')) {
      e.stopPropagation();
      showCategoryModal(sidebar, null);
    }
  });

  // Listen for store changes to update counts
  store.on('prompts:change', async () => await updateCategoryCounts(sidebar));
  store.on('categories:change', async () => await rebuildCategoryList(sidebar));

  // Close sidebar on backdrop click (mobile)
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 1024 && sidebar.classList.contains('open')) {
      if (!sidebar.contains(e.target) && e.target !== mobileBtn) {
        sidebar.classList.remove('open');
      }
    }
  });

  return sidebar;
}

async function buildSidebarHTML() {
  const categories = await store.getCategories();
  const prompts = await store.getPrompts();
  const user = store._user?.user_metadata || { username: store._user?.email?.split('@')[0] || 'User', email: store._user?.email || '' };

  return `
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <div class="sidebar-logo-icon">⚡</div>
        <span class="sidebar-logo-text">PromptLab</span>
      </div>
      <button class="sidebar-toggle" id="sidebar-toggle" title="Toggle sidebar">◀</button>
    </div>

    <div class="sidebar-search">
      <div class="sidebar-search-wrap">
        <span class="sidebar-search-icon">🔍</span>
        <input type="text" class="sidebar-search-input" id="sidebar-search" placeholder="Search prompts…" />
      </div>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-section-title">Main</div>
      <div class="nav-item active" data-route="/">
        <span class="nav-item-icon">🏠</span>
        <span class="nav-item-text">Dashboard</span>
      </div>
      <div class="nav-item" data-route="/library">
        <span class="nav-item-icon">📚</span>
        <span class="nav-item-text">Library</span>
        <span class="nav-item-count" id="nav-count-total">${prompts.length}</span>
      </div>
      <div class="nav-item" data-route="/editor/new">
        <span class="nav-item-icon">✨</span>
        <span class="nav-item-text">New Prompt</span>
      </div>
      <div class="nav-item" data-route="/templates">
        <span class="nav-item-icon">📋</span>
        <span class="nav-item-text">Templates</span>
      </div>

      <div class="nav-section-title" style="margin-top: var(--space-4)">
        Categories
        <button class="cat-add-btn" id="sidebar-add-category" title="Add category">+</button>
      </div>
      <div id="sidebar-categories">
        ${await renderCategoryItems(categories)}
      </div>
    </nav>

    <div class="sidebar-user">
       <div class="user-avatar">${(user?.username || 'U').charAt(0).toUpperCase()}</div>
       <div class="user-info">
         <div class="user-name">${user?.username || 'User'}</div>
         <div class="user-email">${user?.email || ''}</div>
       </div>
       <button class="logout-btn" id="sidebar-logout" title="Logout">🚪</button>
    </div>

    <div class="sidebar-footer">
      <div class="nav-item" id="sidebar-export">
        <span class="nav-item-icon">📤</span>
        <span class="nav-item-text">Export Data</span>
      </div>
      <div class="nav-item" id="sidebar-import">
        <span class="nav-item-icon">📥</span>
        <span class="nav-item-text">Import Data</span>
      </div>
    </div>
  `;
}

async function renderCategoryItems(categories) {
  const items = await Promise.all(categories.map(async (c) => {
    const count = await store.getPromptsCountByCategory(c.id);
    return `
      <div class="nav-item cat-nav-item" data-route="/library?cat=${c.id}" data-category="${c.id}">
        <span class="category-dot" style="background:${c.color}"></span>
        <span class="nav-item-text">${c.name}</span>
        <span class="nav-item-count" data-count-cat="${c.id}">${count}</span>
        <div class="cat-actions">
          <button class="cat-edit-btn" data-cat-id="${c.id}" title="Edit">✎</button>
          <button class="cat-delete-btn" data-cat-id="${c.id}" title="Delete">✕</button>
        </div>
      </div>
    `;
  }));
  return items.join('');
}

async function updateCategoryCounts(sidebar) {
  const totalEl = sidebar.querySelector('#nav-count-total');
  if (totalEl) {
    const prompts = await store.getPrompts();
    totalEl.textContent = prompts.length;
  }

  const categories = await store.getCategories();
  for (const c of categories) {
    const el = sidebar.querySelector(`[data-count-cat="${c.id}"]`);
    if (el) el.textContent = await store.getPromptsCountByCategory(c.id);
  }
}

async function rebuildCategoryList(sidebar) {
  const container = sidebar.querySelector('#sidebar-categories');
  if (!container) return;
  const categories = await store.getCategories();
  container.innerHTML = await renderCategoryItems(categories);
}

/* ---- Category Modal ---- */
function showCategoryModal(sidebar, existingCat) {
  const isEdit = !!existingCat;
  let name = existingCat ? existingCat.name : '';
  let color = existingCat ? existingCat.color : PRESET_COLORS[0];
  let icon = existingCat ? existingCat.icon : PRESET_ICONS[0];

  // Remove any existing modal
  const old = document.querySelector('.cat-modal-overlay');
  if (old) old.remove();

  const overlay = document.createElement('div');
  overlay.className = 'cat-modal-overlay';
  overlay.innerHTML = `
    <div class="cat-modal">
      <div class="cat-modal-header">
        <h3>${isEdit ? 'Edit Category' : 'New Category'}</h3>
        <button class="btn btn-icon btn-ghost" id="cat-modal-close" title="Close">✕</button>
      </div>
      <div class="cat-modal-body">
        <div class="input-group">
          <label class="input-label">Name</label>
          <input type="text" class="input" id="cat-modal-name" placeholder="Category name…" value="${name}" maxlength="30" />
        </div>
        <div class="input-group">
          <label class="input-label">Icon</label>
          <div class="cat-icon-grid" id="cat-icon-grid">
            ${PRESET_ICONS.map(i => `<button class="cat-icon-btn ${i === icon ? 'active' : ''}" data-icon="${i}">${i}</button>`).join('')}
          </div>
        </div>
        <div class="input-group">
          <label class="input-label">Color</label>
          <div class="cat-color-grid" id="cat-color-grid">
            ${PRESET_COLORS.map(c => `<button class="cat-color-btn ${c === color ? 'active' : ''}" data-color="${c}" style="background:${c}"></button>`).join('')}
          </div>
        </div>
        <div class="cat-preview">
          <span class="category-dot" style="background:${color}" id="cat-preview-dot"></span>
          <span id="cat-preview-icon">${icon}</span>
          <span id="cat-preview-name">${name || 'Category Name'}</span>
        </div>
      </div>
      <div class="cat-modal-footer">
        ${isEdit ? `<button class="btn btn-danger" id="cat-modal-delete">🗑 Delete</button>` : '<div></div>'}
        <div style="display:flex;gap:var(--space-3)">
          <button class="btn btn-secondary" id="cat-modal-cancel">Cancel</button>
          <button class="btn btn-primary" id="cat-modal-save">${isEdit ? 'Save Changes' : 'Create Category'}</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const nameInput = overlay.querySelector('#cat-modal-name');
  const previewDot = overlay.querySelector('#cat-preview-dot');
  const previewIcon = overlay.querySelector('#cat-preview-icon');
  const previewName = overlay.querySelector('#cat-preview-name');

  // Live preview
  nameInput.addEventListener('input', () => {
    name = nameInput.value;
    previewName.textContent = name || 'Category Name';
  });
  nameInput.focus();

  // Color selection
  overlay.querySelector('#cat-color-grid').addEventListener('click', (e) => {
    const btn = e.target.closest('.cat-color-btn');
    if (!btn) return;
    color = btn.dataset.color;
    overlay.querySelectorAll('.cat-color-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    previewDot.style.background = color;
  });

  // Icon selection
  overlay.querySelector('#cat-icon-grid').addEventListener('click', (e) => {
    const btn = e.target.closest('.cat-icon-btn');
    if (!btn) return;
    icon = btn.dataset.icon;
    overlay.querySelectorAll('.cat-icon-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    previewIcon.textContent = icon;
  });

  // Close
  function close() { overlay.remove(); }
  overlay.querySelector('#cat-modal-close').addEventListener('click', close);
  overlay.querySelector('#cat-modal-cancel').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  // Save
  overlay.querySelector('#cat-modal-save').addEventListener('click', () => {
    if (!name.trim()) {
      showToast('Please enter a name', 'error');
      nameInput.focus();
      return;
    }
    if (isEdit) {
      store.updateCategory(existingCat.id, { name: name.trim(), color, icon });
      showToast('Category updated!', 'success');
    } else {
      store.createCategory({ name: name.trim(), color, icon });
      showToast('Category created!', 'success');
    }
    close();
  });

  // Delete (edit mode only)
  const deleteBtn = overlay.querySelector('#cat-modal-delete');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (confirm(`Delete "${existingCat.name}"? Prompts will move to General.`)) {
        store.deleteCategory(existingCat.id);
        showToast('Category deleted', 'success');
        close();
      }
    });
  }

  // Escape to close
  function keyHandler(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', keyHandler); }
  }
  document.addEventListener('keydown', keyHandler);
}

