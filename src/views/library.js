/* ============================================
   AI Prompt Manager — Library View
   ============================================ */

import store from '../store.js';
import { showToast } from '../toast.js';
import { escapeHtml, timeAgo, stripMarkdown } from '../utils.js';

let viewMode = 'grid';
let searchQuery = '';
let filterCategory = '';
let filterFavorites = false;
let sortBy = 'updatedAt';

export async function renderLibrary(container, params) {
  // Parse query params from hash
  const hashParts = location.hash.split('?');
  if (hashParts[1]) {
    const urlParams = new URLSearchParams(hashParts[1]);
    if (urlParams.has('cat')) filterCategory = urlParams.get('cat');
  }

  const categories = await store.getCategories();

  container.innerHTML = `
    <div class="main-content animate-fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-title">Prompt Library</h1>
          <p class="page-subtitle">Browse, search, and manage your prompt collection</p>
        </div>
        <div class="page-actions">
          <a href="#/editor/new" class="btn btn-primary">✨ New Prompt</a>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="library-toolbar">
        <div class="library-search">
          <span class="library-search-icon">🔍</span>
          <input type="text" class="input" id="library-search" placeholder="Search by title, content, or tags…" value="${escapeHtml(searchQuery)}" />
        </div>

        <div class="select-wrap">
          <select class="select" id="library-category-filter">
            <option value="">All Categories</option>
            ${categories.map(c => `<option value="${c.id}" ${filterCategory === c.id ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('')}
          </select>
        </div>

        <div class="select-wrap">
          <select class="select" id="library-sort">
            <option value="updatedAt" ${sortBy === 'updatedAt' ? 'selected' : ''}>Recently Updated</option>
            <option value="createdAt" ${sortBy === 'createdAt' ? 'selected' : ''}>Recently Created</option>
            <option value="title" ${sortBy === 'title' ? 'selected' : ''}>Alphabetical</option>
            <option value="rating" ${sortBy === 'rating' ? 'selected' : ''}>Highest Rated</option>
          </select>
        </div>

        <button class="btn btn-secondary ${filterFavorites ? 'active' : ''}" id="library-fav-filter" style="${filterFavorites ? 'border-color:var(--accent-warning);color:var(--accent-warning);' : ''}">
          ⭐ Favorites
        </button>

        <div class="view-toggle">
          <button class="view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}" data-view="grid" title="Grid view">▦</button>
          <button class="view-toggle-btn ${viewMode === 'list' ? 'active' : ''}" data-view="list" title="List view">≡</button>
        </div>
      </div>

      <!-- Prompts Container -->
      <div id="library-prompts"></div>
    </div>

    <a href="#/editor/new" class="fab" title="Create new prompt">+</a>
  `;

  // Render prompts
  await renderPrompts(container);

  // Event listeners
  container.querySelector('#library-search').addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderPrompts(container);
  });

  container.querySelector('#library-category-filter').addEventListener('change', (e) => {
    filterCategory = e.target.value;
    renderPrompts(container);
  });

  container.querySelector('#library-sort').addEventListener('change', (e) => {
    sortBy = e.target.value;
    renderPrompts(container);
  });

  container.querySelector('#library-fav-filter').addEventListener('click', (e) => {
    filterFavorites = !filterFavorites;
    const btn = e.currentTarget;
    btn.style.borderColor = filterFavorites ? 'var(--accent-warning)' : '';
    btn.style.color = filterFavorites ? 'var(--accent-warning)' : '';
    renderPrompts(container);
  });

  container.querySelectorAll('.view-toggle-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      viewMode = btn.dataset.view;
      container.querySelectorAll('.view-toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      await renderPrompts(container);
    });
  });

  // Sidebar search integration
  const sidebarSearchHandler = (e) => {
    searchQuery = e.detail;
    const input = container.querySelector('#library-search');
    if (input) input.value = searchQuery;
    renderPrompts(container);
  };
  window.addEventListener('sidebar:search', sidebarSearchHandler);

  // Listen for store changes
  const unsub = store.on('prompts:change', async () => await renderPrompts(container));

  // Cleanup on next navigation
  const observer = new MutationObserver(() => {
    if (!container.querySelector('#library-prompts')) {
      unsub();
      window.removeEventListener('sidebar:search', sidebarSearchHandler);
      observer.disconnect();
    }
  });
  observer.observe(container, { childList: true });
}

async function renderPrompts(container) {
  const promptsEl = container.querySelector('#library-prompts');
  if (!promptsEl) return;

  let prompts = await store.getPrompts();
  const categories = await store.getCategories();

  // Filter
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    prompts = prompts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }
  if (filterCategory) {
    prompts = prompts.filter(p => p.category === filterCategory);
  }
  if (filterFavorites) {
    prompts = prompts.filter(p => p.isFavorite);
  }

  // Sort
  switch (sortBy) {
    case 'updatedAt':
      prompts.sort((a, b) => b.updatedAt - a.updatedAt);
      break;
    case 'createdAt':
      prompts.sort((a, b) => b.createdAt - a.createdAt);
      break;
    case 'title':
      prompts.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'rating':
      prompts.sort((a, b) => b.rating - a.rating);
      break;
  }

  if (prompts.length === 0) {
    promptsEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-title">No prompts found</div>
        <div class="empty-state-text">${searchQuery || filterCategory || filterFavorites
        ? 'Try adjusting your filters or search query'
        : 'Create your first prompt to get started!'
      }</div>
        <a href="#/editor/new" class="btn btn-primary btn-lg">✨ Create Prompt</a>
      </div>
    `;
    return;
  }

  if (viewMode === 'grid') {
    promptsEl.innerHTML = `
      <div class="prompts-grid stagger">
        ${prompts.map(p => renderCardGrid(p, categories)).join('')}
      </div>
    `;
  } else {
    promptsEl.innerHTML = `
      <div class="prompts-list stagger">
        ${prompts.map(p => renderCardList(p, categories)).join('')}
      </div>
    `;
  }

  // Card click → open editor
  promptsEl.querySelectorAll('[data-prompt-id]').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.prompt-card-fav') || e.target.closest('.prompt-card-delete')) return;
      location.hash = `#/editor/${el.dataset.promptId}`;
    });
  });

  // Favorite toggle
  promptsEl.querySelectorAll('.prompt-card-fav').forEach(el => {
    el.addEventListener('click', async (e) => {
      e.stopPropagation();
      await store.toggleFavorite(el.dataset.id);
      showToast('Favorite updated', 'success');
    });
  });

  // Delete
  promptsEl.querySelectorAll('.prompt-card-delete').forEach(el => {
    el.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (confirm('Delete this prompt? This cannot be undone.')) {
        await store.deletePrompt(el.dataset.id);
        showToast('Prompt deleted', 'success');
      }
    });
  });
}

function renderCardGrid(prompt, categories) {
  const cat = categories.find(c => c.id === prompt.category);
  const stars = renderStars(prompt.rating);
  return `
    <div class="prompt-card" data-prompt-id="${prompt.id}">
      <div class="prompt-card-header">
        <div class="prompt-card-title">${escapeHtml(prompt.title)}</div>
        <button class="prompt-card-fav ${prompt.isFavorite ? 'active' : ''}" data-id="${prompt.id}" title="Toggle favorite">
          ${prompt.isFavorite ? '★' : '☆'}
        </button>
      </div>
      <div class="prompt-card-preview">${escapeHtml(stripMarkdown(prompt.content).slice(0, 180))}</div>
      <div class="prompt-card-footer">
        <div style="display:flex;align-items:center;gap:var(--space-2);flex-wrap:wrap;">
          ${cat ? `<span class="badge" style="background:${cat.color}22;color:${cat.color}">${cat.name}</span>` : ''}
          <span style="font-size:var(--text-xs);color:var(--text-tertiary)">${timeAgo(prompt.updatedAt)}</span>
        </div>
        <div class="prompt-card-actions">
          <button class="btn btn-icon btn-ghost prompt-card-delete" data-id="${prompt.id}" title="Delete">🗑</button>
        </div>
      </div>
      ${prompt.rating > 0 ? `<div style="margin-top:var(--space-2)">${stars}</div>` : ''}
    </div>
  `;
}

function renderCardList(prompt, categories) {
  const cat = categories.find(c => c.id === prompt.category);
  return `
    <div class="prompt-list-item" data-prompt-id="${prompt.id}">
      <button class="prompt-card-fav ${prompt.isFavorite ? 'active' : ''}" data-id="${prompt.id}" title="Toggle favorite">
        ${prompt.isFavorite ? '★' : '☆'}
      </button>
      <div style="flex:1;overflow:hidden;">
        <div style="font-weight:var(--weight-medium);margin-bottom:2px;" class="truncate">${escapeHtml(prompt.title)}</div>
        <div style="font-size:var(--text-sm);color:var(--text-tertiary);" class="truncate">${escapeHtml(stripMarkdown(prompt.content).slice(0, 120))}</div>
      </div>
      ${cat ? `<span class="badge" style="background:${cat.color}22;color:${cat.color}">${cat.name}</span>` : ''}
      <span style="font-size:var(--text-xs);color:var(--text-tertiary);flex-shrink:0">${timeAgo(prompt.updatedAt)}</span>
      <button class="btn btn-icon btn-ghost prompt-card-delete" data-id="${prompt.id}" title="Delete">🗑</button>
    </div>
  `;
}

function renderStars(rating) {
  let html = '<div class="star-rating" style="pointer-events:none;">';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star ${i <= rating ? 'active' : ''}">★</span>`;
  }
  html += '</div>';
  return html;
}
