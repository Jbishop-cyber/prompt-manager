/* ============================================
   AI Prompt Manager — Toast Utility
   ============================================ */

let container = null;

function ensureContainer() {
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
}

export function showToast(message, type = 'info', duration = 3000) {
    ensureContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
    <span>${getIcon(type)}</span>
    <span>${message}</span>
  `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('toast-out');
        toast.addEventListener('animationend', () => toast.remove());
    }, duration);
}

function getIcon(type) {
    switch (type) {
        case 'success': return '✓';
        case 'error': return '✕';
        default: return 'ℹ';
    }
}
