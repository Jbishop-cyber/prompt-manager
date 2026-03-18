/* ============================================
   AI Prompt Manager — Editor View (Enhanced)
   ============================================ */

import store from '../store.js';
import { showToast } from '../toast.js';
import { analyzePrompt, renderAnalyzerHTML } from '../analyzer.js';
import { escapeHtml as sharedEscapeHtml } from '../utils.js';

const TEMPLATES = [
  { label: 'Role Assignment', icon: '🎭', text: 'You are a [role] with expertise in [domain]. ' },
  { label: 'Step-by-Step', icon: '📋', text: 'Please follow these steps:\n1. \n2. \n3. \n' },
  { label: 'Output Format', icon: '📊', text: '\nFormat your response as:\n- **Section 1:** \n- **Section 2:** \n- **Section 3:** \n' },
  { label: 'Constraints', icon: '🚧', text: '\nConstraints:\n- Keep it under [X] words\n- Use [tone] language\n- Avoid [topic]\n' },
  { label: 'Examples', icon: '💡', text: '\nHere is an example of the desired output:\n\"\"\"\n[paste example here]\n\"\"\"\n' },
  { label: 'Context Setting', icon: '🌍', text: 'Context: [describe the situation or background]\n\nTask: ' },
];

const REFINEMENT_TIPS = [
  { icon: '🎯', title: 'Add Specificity', text: 'Replace vague terms with precise instructions. Instead of "make it good", specify what "good" looks like.' },
  { icon: '🎭', title: 'Assign a Role', text: 'Start with "You are a…" to give the model an expert persona and context.' },
  { icon: '📏', title: 'Set Boundaries', text: 'Define word count, format, tone, audience, and what to include or exclude.' },
  { icon: '💡', title: 'Provide Examples', text: 'Show the model what a good response looks like with 1-2 concrete examples.' },
  { icon: '🔄', title: 'Iterate & Version', text: 'Save versions of your prompt as you refine it, so you can compare what works best.' },
];

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export async function renderEditor(container, params) {
  const isNew = params.id === 'new';
  let prompt = isNew ? null : await store.getPrompt(params.id);

  if (!isNew && !prompt) {
    container.innerHTML = `
      <div class="main-content">
        <div class="empty-state">
          <div class="empty-state-icon">❌</div>
          <div class="empty-state-title">Prompt not found</div>
          <div class="empty-state-text">This prompt doesn't exist or has been deleted.</div>
          <a href="#/library" class="btn btn-primary">← Back to Library</a>
        </div>
      </div>
    `;
    return;
  }

  const categories = await store.getCategories();

  // Current state
  let title = prompt ? prompt.title : '';
  let content = prompt ? prompt.content : '';
  let category = prompt ? prompt.category : 'cat-general';
  let tags = prompt ? [...prompt.tags] : [];
  let rating = prompt ? prompt.rating : 0;

  // --- Dirty state tracking ---
  const saved = { title, content, category, tags: [...tags], rating };
  let isDirty = false;

  function checkDirty() {
    isDirty = title !== saved.title ||
      content !== saved.content ||
      category !== saved.category ||
      rating !== saved.rating ||
      JSON.stringify(tags) !== JSON.stringify(saved.tags);
  }

  function markClean() {
    saved.title = title;
    saved.content = content;
    saved.category = category;
    saved.tags = [...tags];
    saved.rating = rating;
    isDirty = false;
  }

  // Warn on browser close/refresh
  function beforeUnloadHandler(e) {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  }
  window.addEventListener('beforeunload', beforeUnloadHandler);

  // Warn on SPA navigation
  const router = window.__router;
  if (router) {
    router.setBeforeNavigate((toHash, fromHash) => {
      if (isDirty) {
        return confirm('You have unsaved changes. Leave without saving?');
      }
      return true;
    });
  }

  // Initial analysis
  const initialAnalysis = analyzePrompt(content);

  container.innerHTML = `
    <div class="main-content animate-fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-title">${isNew ? 'Create New Prompt' : 'Edit Prompt'}</h1>
          <p class="page-subtitle">${isNew ? 'Craft a new prompt with guidance' : 'Refine and iterate on your prompt'}</p>
        </div>
        <div class="page-actions">
          <a href="#${prompt ? '/library' : '/'}" class="btn btn-ghost">← Back</a>
        </div>
      </div>

      <div class="editor-layout">
        <!-- Left: Editor -->
        <div class="editor-main">
          <input type="text" class="editor-title-input" id="editor-title" placeholder="Give your prompt a descriptive title…" value="${escapeHtml(title)}" />

          <div class="editor-prompt-area">
            <textarea class="editor-textarea" id="editor-content" placeholder="Write your prompt here…&#10;&#10;Tip: Use {placeholders} for dynamic variables">${escapeHtml(content)}</textarea>
            <div class="editor-counter" id="editor-counter">0 words · 0 chars</div>
          </div>

          <div class="editor-meta-row">
            <div class="input-group">
              <label class="input-label">Category</label>
              <div class="select-wrap">
                <select class="select" id="editor-category">
                  ${categories.map(c => `<option value="${c.id}" ${category === c.id ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="input-group">
              <label class="input-label">Rating</label>
              <div class="star-rating" id="editor-rating">
                ${[1, 2, 3, 4, 5].map(i => `<span class="star ${i <= rating ? 'active' : ''}" data-value="${i}">★</span>`).join('')}
              </div>
            </div>
          </div>

          <div class="input-group">
            <label class="input-label">Tags</label>
            <div class="editor-tags-input-wrap" id="editor-tags-wrap">
              ${tags.map(t => `<span class="tag">${escapeHtml(t)}<span class="tag-remove" data-tag="${escapeHtml(t)}">✕</span></span>`).join('')}
              <input type="text" class="editor-tags-field" id="editor-tags-input" placeholder="Type a tag and press Enter…" />
            </div>
          </div>

          <div class="editor-actions">
            <button class="btn btn-primary btn-lg" id="editor-save">💾 ${isNew ? 'Create Prompt' : 'Save Changes'}</button>
            ${!isNew ? `<button class="btn btn-secondary btn-lg" id="editor-save-version">📌 Save as New Version</button>` : ''}
            <button class="btn btn-secondary" id="editor-copy" ${!content.trim() ? 'disabled style="opacity:0.4;pointer-events:none;"' : ''}>📋 Copy to Clipboard</button>
            <button class="btn btn-secondary" id="editor-test" ${!content.trim() ? 'disabled style="opacity:0.4;pointer-events:none;"' : ''}>🧪 Test Prompt</button>
            ${!isNew ? `<button class="btn btn-secondary" id="editor-duplicate">📄 Use as Template</button>` : ''}
            ${!isNew ? `<button class="btn btn-danger" id="editor-delete">🗑 Delete</button>` : ''}
          </div>
          <div class="kbd-hint">
            <kbd class="kbd">Ctrl+S</kbd> Save &nbsp;
            <kbd class="kbd">Ctrl+Shift+N</kbd> New Prompt
          </div>
        </div>

        <!-- Right: Refinement Panel -->
        <div class="refinement-panel">
          <!-- Prompt Analyzer -->
          <div id="analyzer-container">
            ${renderAnalyzerHTML(initialAnalysis)}
          </div>

          <!-- Templates -->
          <div class="refinement-section animate-slide-right" style="animation-delay:0.05s">
            <div class="refinement-section-title">🧩 Quick Templates</div>
            ${TEMPLATES.map(t => `
              <button class="template-btn" data-template="${escapeHtml(t.text)}">
                <span>${t.icon}</span>
                <span>${t.label}</span>
              </button>
            `).join('')}
          </div>

          <!-- Tips -->
          <div class="refinement-section animate-slide-right" style="animation-delay:0.1s">
            <div class="refinement-section-title">💡 Refinement Tips</div>
            ${REFINEMENT_TIPS.map(tip => `
              <div class="refinement-tip">
                <span class="refinement-tip-icon">${tip.icon}</span>
                <div class="refinement-tip-text">
                  <strong>${tip.title}</strong>
                  ${tip.text}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Version History -->
          ${!isNew && prompt.versions.length > 0 ? `
            <div class="refinement-section animate-slide-right" style="animation-delay:0.15s">
              <div class="refinement-section-title">🕐 Version History</div>
              <div class="version-timeline">
                <div class="version-item" style="cursor:default;">
                  <div class="version-dot"></div>
                  <div class="version-info">
                    <div class="version-label">Current Version</div>
                    <div class="version-date">Now</div>
                  </div>
                </div>
                ${[...prompt.versions].reverse().map(v => `
                  <div class="version-item" data-version-id="${v.id}" data-version-content="${escapeHtml(v.content)}">
                    <div class="version-dot"></div>
                    <div class="version-info">
                      <div class="version-label">${escapeHtml(v.notes)}</div>
                      <div class="version-date">${new Date(v.createdAt).toLocaleDateString()} ${new Date(v.createdAt).toLocaleTimeString()}</div>
                      <button class="btn btn-ghost" style="font-size:var(--text-xs);padding:2px 6px;margin-top:4px;" data-diff-id="${v.id}" data-diff-content="${escapeHtml(v.content)}" data-diff-label="${escapeHtml(v.notes)}">📊 View Diff</button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  // --- Wire up events ---
  const titleInput = container.querySelector('#editor-title');
  const contentArea = container.querySelector('#editor-content');
  const counterEl = container.querySelector('#editor-counter');
  const categorySelect = container.querySelector('#editor-category');
  const ratingEl = container.querySelector('#editor-rating');
  const tagsInput = container.querySelector('#editor-tags-input');
  const tagsWrap = container.querySelector('#editor-tags-wrap');
  const analyzerContainer = container.querySelector('#analyzer-container');
  const copyBtn = container.querySelector('#editor-copy');
  const testBtn = container.querySelector('#editor-test');

  // --- Analyzer live update ---
  let analyzerTimeout = null;
  function updateAnalyzer() {
    clearTimeout(analyzerTimeout);
    analyzerTimeout = setTimeout(() => {
      const analysis = analyzePrompt(contentArea.value);
      analyzerContainer.innerHTML = renderAnalyzerHTML(analysis);
    }, 300); // debounce 300ms
  }

  // --- Counter + Analyzer ---
  function updateCounter() {
    const text = contentArea.value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    counterEl.textContent = `${words} word${words !== 1 ? 's' : ''} · ${text.length} chars`;
    // Update copy/test button state
    const hasContent = text.trim().length > 0;
    copyBtn.disabled = !hasContent;
    copyBtn.style.opacity = hasContent ? '' : '0.4';
    copyBtn.style.pointerEvents = hasContent ? '' : 'none';
    testBtn.disabled = !hasContent;
    testBtn.style.opacity = hasContent ? '' : '0.4';
    testBtn.style.pointerEvents = hasContent ? '' : 'none';
  }

  contentArea.addEventListener('input', () => {
    content = contentArea.value;
    updateCounter();
    updateAnalyzer();
    checkDirty();
  });
  updateCounter();

  titleInput.addEventListener('input', () => { title = titleInput.value; checkDirty(); });
  categorySelect.addEventListener('change', () => { category = categorySelect.value; checkDirty(); });

  // Rating
  ratingEl.querySelectorAll('.star').forEach(star => {
    star.addEventListener('click', () => {
      rating = parseInt(star.dataset.value);
      ratingEl.querySelectorAll('.star').forEach(s => {
        s.classList.toggle('active', parseInt(s.dataset.value) <= rating);
      });
      checkDirty();
    });
  });

  // Tags
  tagsInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && tagsInput.value.trim()) {
      e.preventDefault();
      const tag = tagsInput.value.trim().toLowerCase();
      if (!tags.includes(tag)) {
        tags.push(tag);
        const tagEl = document.createElement('span');
        tagEl.className = 'tag';
        tagEl.innerHTML = `${escapeHtml(tag)}<span class="tag-remove" data-tag="${escapeHtml(tag)}">✕</span>`;
        tagsWrap.insertBefore(tagEl, tagsInput);
      }
      tagsInput.value = '';
      checkDirty();
    }
  });

  tagsWrap.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.tag-remove');
    if (removeBtn) {
      const tag = removeBtn.dataset.tag;
      tags = tags.filter(t => t !== tag);
      removeBtn.parentElement.remove();
      checkDirty();
    }
  });

  tagsWrap.addEventListener('click', () => tagsInput.focus());

  // Templates
  container.querySelectorAll('.template-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const template = btn.dataset.template;
      const textarea = contentArea;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = textarea.value.substring(0, start);
      const after = textarea.value.substring(end);
      textarea.value = before + template + after;
      content = textarea.value;
      textarea.focus();
      textarea.setSelectionRange(start + template.length, start + template.length);
      updateCounter();
      updateAnalyzer();
      showToast('Template inserted', 'info');
    });
  });

  // --- Version restore ---
  container.querySelectorAll('.version-item[data-version-id]').forEach(el => {
    // Click on version item to restore (but not on diff button)
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-diff-id]')) return; // handled separately
      if (confirm('Restore this version? Your current content will be replaced.')) {
        contentArea.value = el.dataset.versionContent;
        content = contentArea.value;
        updateCounter();
        updateAnalyzer();
        showToast('Version restored', 'success');
      }
    });
  });

  // --- Diff view ---
  container.querySelectorAll('[data-diff-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const oldContent = btn.dataset.diffContent;
      const label = btn.dataset.diffLabel;
      showDiffModal(oldContent, contentArea.value, label);
    });
  });

  // --- Save ---
  async function doSave() {
    if (!title.trim()) {
      showToast('Please add a title', 'error');
      titleInput.focus();
      return;
    }
    if (!content.trim()) {
      showToast('Please add prompt content', 'error');
      contentArea.focus();
      return;
    }

    if (isNew) {
      const created = await store.createPrompt({ title, content, category, tags, rating });
      markClean();
      showToast('Prompt created!', 'success');
      location.hash = `#/editor/${created.id}`;
    } else {
      await store.updatePrompt(params.id, { title, content, category, tags, rating });
      markClean();
      showToast('Changes saved!', 'success');
    }
  }

  container.querySelector('#editor-save').addEventListener('click', doSave);

  // Save as new version
  const saveVersionBtn = container.querySelector('#editor-save-version');
  if (saveVersionBtn) {
    saveVersionBtn.addEventListener('click', async () => {
      const notes = window.prompt('Version notes (optional):', `v${(prompt.versions.length + 1)}`);
      if (notes === null) return;
      await store.addVersion(params.id, notes || `Version ${prompt.versions.length + 1}`);
      await store.updatePrompt(params.id, { title, content, category, tags, rating });
      showToast('Version saved!', 'success');
      await renderEditor(container, params);
    });
  }

  // --- Copy ---
  container.querySelector('#editor-copy').addEventListener('click', () => {
    if (!content.trim()) return;
    navigator.clipboard.writeText(content).then(() => {
      showToast('Copied to clipboard!', 'success');
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = content;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Copied to clipboard!', 'success');
    });
  });

  // --- Test Prompt ---
  container.querySelector('#editor-test').addEventListener('click', () => {
    if (!content.trim()) return;
    const encoded = encodeURIComponent(content);
    window.open(`https://chatgpt.com/?q=${encoded}`, '_blank');
    showToast('Opening ChatGPT with your prompt…', 'success');
  });

  // --- Duplicate / Use as Template ---
  const dupBtn = container.querySelector('#editor-duplicate');
  if (dupBtn) {
    dupBtn.addEventListener('click', async () => {
      const created = await store.createPrompt({
        title: title + ' (copy)',
        content,
        category,
        tags: [...tags],
        rating: 0,
      });
      showToast('Prompt duplicated!', 'success');
      location.hash = `#/editor/${created.id}`;
    });
  }

  // --- Delete ---
  const deleteBtn = container.querySelector('#editor-delete');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      if (confirm('Delete this prompt? This cannot be undone.')) {
        await store.deletePrompt(params.id);
        showToast('Prompt deleted', 'success');
        location.hash = '#/library';
      }
    });
  }

  // --- Keyboard Shortcuts ---
  function keyboardHandler(e) {
    // Ctrl+S / Cmd+S → Save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      doSave();
    }
    // Ctrl+Shift+N → New Prompt
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
      e.preventDefault();
      location.hash = '#/editor/new';
    }
    // Escape → close diff modal if open
    if (e.key === 'Escape') {
      const overlay = document.querySelector('.diff-overlay');
      if (overlay) overlay.remove();
    }
  }

  document.addEventListener('keydown', keyboardHandler);

  // Cleanup on navigation
  const observer = new MutationObserver(() => {
    if (!container.querySelector('#editor-content')) {
      document.removeEventListener('keydown', keyboardHandler);
      window.removeEventListener('beforeunload', beforeUnloadHandler);
      if (router) router.setBeforeNavigate(null);
      clearTimeout(analyzerTimeout);
      observer.disconnect();
    }
  });
  observer.observe(container, { childList: true });
}

// --- Diff Modal ---
function showDiffModal(oldText, newText, versionLabel) {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');

  // Simple line-by-line diff
  const maxLen = Math.max(oldLines.length, newLines.length);
  let oldHtml = '';
  let newHtml = '';

  for (let i = 0; i < maxLen; i++) {
    const ol = oldLines[i] !== undefined ? oldLines[i] : null;
    const nl = newLines[i] !== undefined ? newLines[i] : null;

    if (ol === nl) {
      oldHtml += `<span class="diff-line-same">${escapeHtmlStatic(ol || '')}</span>\n`;
      newHtml += `<span class="diff-line-same">${escapeHtmlStatic(nl || '')}</span>\n`;
    } else {
      if (ol !== null) {
        oldHtml += `<span class="diff-line-removed">${escapeHtmlStatic(ol)}</span>\n`;
      }
      if (nl !== null) {
        newHtml += `<span class="diff-line-added">${escapeHtmlStatic(nl)}</span>\n`;
      }
    }
  }

  const overlay = document.createElement('div');
  overlay.className = 'diff-overlay';
  overlay.innerHTML = `
    <div class="diff-modal">
      <div class="diff-header">
        <h3>📊 Diff: ${escapeHtmlStatic(versionLabel)} → Current</h3>
        <button class="btn btn-icon btn-ghost" id="diff-close" title="Close">✕</button>
      </div>
      <div class="diff-body">
        <div class="diff-pane">
          <div class="diff-pane-title">📌 ${escapeHtmlStatic(versionLabel)}</div>
          <div class="diff-content">${oldHtml}</div>
        </div>
        <div class="diff-pane">
          <div class="diff-pane-title">✏️ Current Version</div>
          <div class="diff-content">${newHtml}</div>
        </div>
      </div>
      <div class="diff-footer">
        <button class="btn btn-secondary" id="diff-close-btn">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Close handlers
  overlay.querySelector('#diff-close').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#diff-close-btn').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

function escapeHtmlStatic(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
