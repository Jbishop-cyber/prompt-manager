/* ============================================
   AI Prompt Manager — Templates View
   ============================================ */

import TEMPLATES, { TEMPLATE_CATEGORIES } from '../templates-data.js';
import store from '../store.js';
import { showToast } from '../toast.js';
import { escapeHtml } from '../utils.js';

export async function renderTemplates(container) {
    let activeCategory = 'all';
    let searchQuery = '';

    async function render() {
        const filtered = TEMPLATES.filter(t => {
            const matchesCat = activeCategory === 'all' || t.category === activeCategory;
            const matchesSearch = !searchQuery ||
                t.title.toLowerCase().includes(searchQuery) ||
                t.description.toLowerCase().includes(searchQuery) ||
                t.tags.some(tag => tag.includes(searchQuery));
            return matchesCat && matchesSearch;
        });

        container.innerHTML = `
      <div class="main-content">
        <div class="page-header">
          <div>
            <h1 class="page-title">📋 Prompt Templates</h1>
            <p class="page-subtitle">Start with a proven template and customize it for your needs</p>
          </div>
        </div>

        <div class="templates-toolbar">
          <div class="templates-search-wrap">
            <span class="templates-search-icon">🔍</span>
            <input type="text" class="templates-search" id="templates-search"
              placeholder="Search templates…" value="${escapeHtml(searchQuery)}" />
          </div>
          <div class="templates-categories">
            ${TEMPLATE_CATEGORIES.map(cat => `
              <button class="templates-cat-btn ${activeCategory === cat.id ? 'active' : ''}"
                data-cat="${cat.id}" style="${activeCategory === cat.id ? '--cat-color: ' + cat.color : ''}">
                <span class="templates-cat-icon">${cat.icon}</span>
                <span>${cat.name}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="templates-count">${filtered.length} template${filtered.length !== 1 ? 's' : ''}</div>

        <div class="templates-grid">
          ${filtered.length ? filtered.map(t => `
            <div class="template-card" data-tpl-id="${t.id}">
              <div class="template-card-header">
                <div class="template-card-icon" style="background: ${t.color}20; color: ${t.color}">${t.icon}</div>
                <span class="template-card-category" style="color: ${t.color}">${t.category}</span>
              </div>
              <h3 class="template-card-title">${escapeHtml(t.title)}</h3>
              <p class="template-card-desc">${escapeHtml(t.description)}</p>
              <div class="template-card-tags">
                ${t.tags.map(tag => `<span class="template-tag">${tag}</span>`).join('')}
              </div>
              <div class="template-card-actions">
                <button class="btn btn-sm btn-secondary tpl-preview-btn" data-tpl-id="${t.id}">
                  👁 Preview
                </button>
                <button class="btn btn-sm btn-primary tpl-use-btn" data-tpl-id="${t.id}">
                  ✨ Use Template
                </button>
              </div>
            </div>
          `).join('') : `
            <div class="empty-state" style="grid-column: 1 / -1">
              <div class="empty-state-icon">🔍</div>
              <div class="empty-state-title">No templates found</div>
              <div class="empty-state-text">Try a different search or category</div>
            </div>
          `}
        </div>
      </div>
    `;

        // --- Event Listeners ---

        // Search
        container.querySelector('#templates-search').addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            render();
        });

        // Category filters
        container.querySelectorAll('.templates-cat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                activeCategory = btn.dataset.cat;
                render();
            });
        });

        // Preview buttons
        container.querySelectorAll('.tpl-preview-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const tpl = TEMPLATES.find(t => t.id === btn.dataset.tplId);
                if (tpl) showPreviewModal(tpl);
            });
        });

        // Use Template buttons
        container.querySelectorAll('.tpl-use-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const tpl = TEMPLATES.find(t => t.id === btn.dataset.tplId);
                if (tpl) await useTemplate(tpl);
            });
        });

        // Card click = preview
        container.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', () => {
                const tpl = TEMPLATES.find(t => t.id === card.dataset.tplId);
                if (tpl) showPreviewModal(tpl);
            });
        });
    }

    await render();
}

// --- Preview Modal ---
function showPreviewModal(tpl) {
    const old = document.querySelector('.tpl-modal-overlay');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.className = 'tpl-modal-overlay';
    overlay.innerHTML = `
    <div class="tpl-modal">
      <div class="tpl-modal-header">
        <div class="tpl-modal-title-wrap">
          <span class="tpl-modal-icon" style="background: ${tpl.color}20; color: ${tpl.color}">${tpl.icon}</span>
          <div>
            <h2>${tpl.title}</h2>
            <span class="tpl-modal-cat" style="color: ${tpl.color}">${tpl.category}</span>
          </div>
        </div>
        <button class="btn btn-icon btn-ghost tpl-modal-close" title="Close">✕</button>
      </div>
      <div class="tpl-modal-body">
        <p class="tpl-modal-desc">${tpl.description}</p>
        <div class="tpl-modal-content">
          <div class="tpl-modal-content-header">
            <span>Template Content</span>
            <button class="btn btn-sm btn-ghost tpl-copy-btn">📋 Copy</button>
          </div>
          <pre class="tpl-modal-pre">${escapeHtml(tpl.content)}</pre>
        </div>
        <div class="tpl-modal-tags">
          ${tpl.tags.map(tag => `<span class="template-tag">${tag}</span>`).join('')}
        </div>
      </div>
      <div class="tpl-modal-footer">
        <button class="btn btn-secondary tpl-modal-cancel">Close</button>
        <button class="btn btn-primary tpl-modal-use">✨ Use This Template</button>
      </div>
    </div>
  `;

    document.body.appendChild(overlay);

    // Close
    const close = () => overlay.remove();
    overlay.querySelector('.tpl-modal-close').addEventListener('click', close);
    overlay.querySelector('.tpl-modal-cancel').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function handler(e) {
        if (e.key === 'Escape') { close(); document.removeEventListener('keydown', handler); }
    });

    // Copy
    overlay.querySelector('.tpl-copy-btn').addEventListener('click', () => {
        navigator.clipboard.writeText(tpl.content);
        showToast('Template copied to clipboard!', 'success');
    });

    // Use
    overlay.querySelector('.tpl-modal-use').addEventListener('click', async () => {
        close();
        await useTemplate(tpl);
    });
}

// --- Use Template: create a new prompt from it ---
async function useTemplate(tpl) {
    try {
        const prompt = await store.createPrompt({
            title: tpl.title,
            content: tpl.content,
            category: 'cat-general',
            tags: [...tpl.tags],
            rating: 0,
        });
        showToast(`Created prompt from "${tpl.title}"!`, 'success');
        location.hash = `#/editor/${prompt.id}`;
    } catch (err) {
        showToast('Failed to create prompt: ' + err.message, 'error');
    }
}
