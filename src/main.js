/* ============================================
   AI Prompt Manager — Main Entry Point
   ============================================ */

import Router from './router.js';
import { renderSidebar } from './components/sidebar.js';
import { renderDashboard } from './views/dashboard.js';
import { renderLibrary } from './views/library.js';
import { renderEditor } from './views/editor.js';
import { renderEditor } from './views/editor.js';
import { renderAuth } from './views/auth.js';
import { supabase } from './supabase.js';
import store from './store.js';
import { showToast } from './toast.js';

async function init() {
    const app = document.getElementById('app');

    // Render sidebar
    // Render sidebar
    const sidebar = await renderSidebar(app);

    // Setup router
    const router = new Router('#main-content');
    window.__router = router; // expose for navigation guards
    router
        .on('/', async (container) => await authGuard(container, () => renderDashboard(container)))
        .on('/library', async (container) => await authGuard(container, () => renderLibrary(container)))
        .on('/editor/:id', async (container, params) => await authGuard(container, (p) => renderEditor(container, p), params))
        .on('/login', (container) => renderAuth(container))
        .on('*', (container) => {
            container.innerHTML = `
        <div class="main-content">
          <div class="empty-state">
            <div class="empty-state-icon">🤷</div>
            <div class="empty-state-title">Page not found</div>
            <div class="empty-state-text">The page you're looking for doesn't exist.</div>
            <a href="#/" class="btn btn-primary">← Go Home</a>
          </div>
        </div>
      `;
        });

    router.start();
}

async function authGuard(container, next, params = null) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        if (!store._initialized) await store.init();
        await next(params);
    } else {
        window.location.hash = '/login';
    }
}

// Boot
document.addEventListener('DOMContentLoaded', init);
