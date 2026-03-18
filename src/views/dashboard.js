/* ============================================
   AI Prompt Manager — Dashboard View
   ============================================ */

import store from '../store.js';
import { escapeHtml, timeAgo, stripMarkdown } from '../utils.js';

export async function renderDashboard(container) {
  const stats = await store.getStats();
  const promptsData = await store.getPrompts();
  const prompts = promptsData
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 6);
  const categories = await store.getCategories();

  container.innerHTML = `
    <div class="main-content animate-fade-in">
      <!-- Hero -->
      <div class="dashboard-hero">
        <h1 class="dashboard-hero-title">Welcome to <span style="background:var(--gradient-brand);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">PromptLab</span></h1>
        <p class="dashboard-hero-text">
          Your intelligent workspace for crafting, organizing, and refining LLM prompts.
          Create powerful prompts that consistently deliver the results you need.
        </p>
        <div style="margin-top:var(--space-6);display:flex;gap:var(--space-3);position:relative;">
          <a href="#/editor/new" class="btn btn-primary btn-lg">✨ Create New Prompt</a>
          <a href="#/library" class="btn btn-secondary btn-lg">📚 Browse Library</a>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-grid stagger">
        <div class="stat-card">
          <div class="stat-card-icon" style="background:rgba(108,99,255,0.15);color:#6c63ff;">📝</div>
          <div class="stat-card-value">${stats.total}</div>
          <div class="stat-card-label">Total Prompts</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-icon" style="background:rgba(167,139,250,0.15);color:#a78bfa;">📂</div>
          <div class="stat-card-value">${stats.categories}</div>
          <div class="stat-card-label">Categories</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-icon" style="background:rgba(251,191,36,0.15);color:#fbbf24;">⭐</div>
          <div class="stat-card-value">${stats.favorites}</div>
          <div class="stat-card-label">Favorites</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-icon" style="background:rgba(52,211,153,0.15);color:#34d399;">🔄</div>
          <div class="stat-card-value">${stats.recentEdits}</div>
          <div class="stat-card-label">Edited This Week</div>
        </div>
      </div>

      <!-- Recent Prompts -->
      <div class="section-header">
        <h2 class="section-title">Recent Prompts</h2>
        <a href="#/library" class="btn btn-ghost">View All →</a>
      </div>

      ${prompts.length > 0 ? `
        <div class="recent-prompts-list stagger">
          ${prompts.map(p => {
    const cat = categories.find(c => c.id === p.category);
    return `
              <div class="recent-prompt-item" data-id="${p.id}">
                <div style="font-size:24px;">${cat ? cat.icon : '📝'}</div>
                <div class="recent-prompt-content">
                  <div class="recent-prompt-title">${escapeHtml(p.title)}</div>
                  <div class="recent-prompt-preview">${escapeHtml(stripMarkdown(p.content).slice(0, 100))}</div>
                </div>
                <div class="recent-prompt-meta">
                  ${cat ? `<span class="badge" style="background:${cat.color}22;color:${cat.color}">${cat.name}</span>` : ''}
                  <span class="recent-prompt-time">${timeAgo(p.updatedAt)}</span>
                </div>
              </div>
            `;
  }).join('')}
        </div>
      ` : `
        <div class="empty-state">
          <div class="empty-state-icon">📝</div>
          <div class="empty-state-title">No prompts yet</div>
          <div class="empty-state-text">Create your first prompt to get started!</div>
          <a href="#/editor/new" class="btn btn-primary btn-lg">✨ Create Prompt</a>
        </div>
      `}

      <!-- Quick Tips -->
      <div style="margin-top:var(--space-8)">
        <div class="section-header">
          <h2 class="section-title">Prompt Crafting Tips</h2>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:var(--space-4);" class="stagger">
          <div class="card-flat" style="padding:var(--space-5)">
            <div style="font-size:24px;margin-bottom:var(--space-3)">🎯</div>
            <div style="font-weight:var(--weight-semibold);margin-bottom:var(--space-2)">Be Specific</div>
            <div style="font-size:var(--text-sm);color:var(--text-secondary);line-height:var(--leading-loose)">
              Instead of "Write about dogs", try "Write a 500-word informative article about the health benefits of owning a dog, targeting first-time pet owners."
            </div>
          </div>
          <div class="card-flat" style="padding:var(--space-5)">
            <div style="font-size:24px;margin-bottom:var(--space-3)">🎭</div>
            <div style="font-weight:var(--weight-semibold);margin-bottom:var(--space-2)">Assign a Role</div>
            <div style="font-size:var(--text-sm);color:var(--text-secondary);line-height:var(--leading-loose)">
              Start with "You are a [role]" to set the context. Roles like "senior developer", "marketing expert", or "friendly teacher" shape the response style.
            </div>
          </div>
          <div class="card-flat" style="padding:var(--space-5)">
            <div style="font-size:24px;margin-bottom:var(--space-3)">📊</div>
            <div style="font-weight:var(--weight-semibold);margin-bottom:var(--space-2)">Define Output Format</div>
            <div style="font-size:var(--text-sm);color:var(--text-secondary);line-height:var(--leading-loose)">
              Tell the model exactly how to format the response: bullet points, numbered lists, JSON, markdown tables, or specific section headers.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FAB -->
    <a href="#/editor/new" class="fab" title="Create new prompt">+</a>
  `;

  // Click handlers for recent prompts
  container.querySelectorAll('.recent-prompt-item').forEach(el => {
    el.addEventListener('click', () => {
      location.hash = `#/editor/${el.dataset.id}`;
    });
  });
}

