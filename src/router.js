/* ============================================
   AI Prompt Manager — Hash-Based SPA Router
   ============================================ */

class Router {
    constructor(containerSelector) {
        this._container = document.querySelector(containerSelector);
        this._routes = {};
        this._current = null;
        this._beforeGuard = null;
        window.addEventListener('hashchange', (e) => this._resolve(e));
    }

    on(pattern, handler) {
        this._routes[pattern] = handler;
        return this;
    }

    /**
     * Register a navigation guard. Return false from the callback to cancel navigation.
     * Call with null to remove the guard.
     */
    setBeforeNavigate(fn) {
        this._beforeGuard = fn;
    }

    start() {
        if (!location.hash) location.hash = '#/';
        this._resolve();
    }

    navigate(hash) {
        location.hash = hash;
    }

    _resolve(event) {
        const rawHash = location.hash.slice(1) || '/';
        const hash = rawHash.split('?')[0]; // strip query params

        // Run guard — if it returns false, revert the hash
        if (this._beforeGuard && this._current) {
            const allowed = this._beforeGuard(hash, this._current.hash);
            if (allowed === false) {
                // Revert hash without triggering another resolve
                history.replaceState(null, '', '#' + this._current.hash);
                return;
            }
        }

        let matched = false;

        for (const [pattern, handler] of Object.entries(this._routes)) {
            const params = this._match(pattern, hash);
            if (params !== null) {
                this._current = { pattern, hash, params };
                this._container.innerHTML = '';
                handler(this._container, params);
                matched = true;
                break;
            }
        }

        if (!matched && this._routes['*']) {
            this._routes['*'](this._container, {});
        }

        // Update sidebar active state
        document.querySelectorAll('.nav-item[data-route]').forEach(el => {
            el.classList.toggle('active', el.dataset.route === hash || hash.startsWith(el.dataset.route + '/'));
        });
    }

    _match(pattern, hash) {
        const patternParts = pattern.split('/');
        const hashParts = hash.split('/');

        if (patternParts.length !== hashParts.length) return null;

        const params = {};
        for (let i = 0; i < patternParts.length; i++) {
            if (patternParts[i].startsWith(':')) {
                params[patternParts[i].slice(1)] = decodeURIComponent(hashParts[i]);
            } else if (patternParts[i] !== hashParts[i]) {
                return null;
            }
        }
        return params;
    }
}

export default Router;

