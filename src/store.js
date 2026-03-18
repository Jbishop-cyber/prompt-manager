/* ============================================
   AI Prompt Manager — Store (Supabase API)
   ============================================ */

import { supabase } from './supabase.js';

class Store {
    constructor() {
        this._listeners = {};
        this._data = { prompts: [], categories: [] };
        this._initialized = false;
        this._user = null;
    }

    async init() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        this._user = session.user;

        try {
            const [promptsRes, categoriesRes] = await Promise.all([
                supabase.from('prompts').select('*').order('updated_at', { ascending: false }),
                supabase.from('categories').select('*').order('name')
            ]);

            if (promptsRes.error) throw promptsRes.error;
            if (categoriesRes.error) throw categoriesRes.error;

            this._data.prompts = promptsRes.data || [];
            this._data.categories = categoriesRes.data || [];

            this._initialized = true;
            this._emit('prompts:change', this._data.prompts);
            this._emit('categories:change', this._data.categories);
        } catch (e) {
            console.error('Failed to initialize store from Supabase', e);
        }
    }

    _emit(event, payload) {
        (this._listeners[event] || []).forEach(fn => fn(payload));
    }

    on(event, fn) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(fn);
        return () => {
            this._listeners[event] = this._listeners[event].filter(f => f !== fn);
        };
    }

    /* ---- Prompts ---- */
    async getPrompts() {
        if (!this._initialized) await this.init();
        return this._data.prompts.map(this._mapPromptData);
    }

    async getPrompt(id) {
        const prompts = await this.getPrompts();
        return prompts.find(p => p.id === id) || null;
    }

    async createPrompt(data) {
        if (!this._user) return;

        const newPrompt = {
            user_id: this._user.id,
            title: data.title || 'Untitled',
            content: data.content || '',
            category: data.category || 'cat-general',
            tags: data.tags || [],
            rating: data.rating || 0,
            favorite: false,
            versions: []
        };

        const { data: prompt, error } = await supabase
            .from('prompts')
            .insert(newPrompt)
            .select()
            .single();

        if (error) throw error;

        this._data.prompts.unshift(prompt);
        this._emit('prompts:change', this._data.prompts);
        return this._mapPromptData(prompt);
    }

    async updatePrompt(id, updates) {
        const payload = { ...updates };

        if ('isFavorite' in payload) {
            payload.favorite = payload.isFavorite;
            delete payload.isFavorite;
        }

        payload.updated_at = new Date().toISOString();

        const { data: updated, error } = await supabase
            .from('prompts')
            .update(payload)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        const idx = this._data.prompts.findIndex(p => p.id === id);
        if (idx !== -1) {
            this._data.prompts[idx] = updated;
        }
        this._emit('prompts:change', this._data.prompts);
        return this._mapPromptData(updated);
    }

    async deletePrompt(id) {
        const { error } = await supabase.from('prompts').delete().eq('id', id);
        if (error) throw error;

        this._data.prompts = this._data.prompts.filter(p => p.id !== id);
        this._emit('prompts:change', this._data.prompts);
    }

    async toggleFavorite(id) {
        const prompt = await this.getPrompt(id);
        if (!prompt) return;
        return this.updatePrompt(id, { favorite: !prompt.isFavorite });
    }

    async addVersion(promptId, note) {
        const prompt = this._data.prompts.find(p => p.id === promptId);
        if (!prompt) return;

        const version = {
            id: 'v-' + Date.now().toString(36),
            content: prompt.content,
            notes: note || `Version ${(prompt.versions?.length || 0) + 1}`,
            createdAt: new Date().toISOString()
        };

        const newVersions = [...(prompt.versions || []), version];

        const { data: updated, error } = await supabase
            .from('prompts')
            .update({ versions: newVersions, updated_at: new Date().toISOString() })
            .eq('id', promptId)
            .select()
            .single();

        if (error) throw error;

        prompt.versions = updated.versions;
        prompt.updated_at = updated.updated_at;

        this._emit('prompts:change', this._data.prompts);
        return version;
    }

    /* ---- Categories ---- */
    async getCategories() {
        if (!this._initialized) await this.init();
        return [...this._data.categories];
    }

    async getCategory(id) {
        if (!this._initialized) await this.init();
        return this._data.categories.find(c => c.id === id) || null;
    }

    async createCategory(data) {
        if (!this._user) return;
        const newCat = {
            user_id: this._user.id,
            name: data.name,
            color: data.color || '#6c63ff',
            icon: data.icon || '📁'
        };
        const { data: cat, error } = await supabase.from('categories').insert(newCat).select().single();
        if (error) throw error;

        this._data.categories.push(cat);
        this._emit('categories:change', this._data.categories);
        return cat;
    }

    async updateCategory(id, updates) {
        const { data: cat, error } = await supabase.from('categories').update(updates).eq('id', id).select().single();
        if (error) throw error;

        const idx = this._data.categories.findIndex(c => c.id === id);
        if (idx !== -1) this._data.categories[idx] = cat;
        this._emit('categories:change', this._data.categories);
        return cat;
    }

    async deleteCategory(id) {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) throw error;

        this._data.categories = this._data.categories.filter(c => c.id !== id);

        // Move related prompts to General
        const generalCatId = this._data.categories.find(c => c.name === 'General')?.id || 'cat-general';
        await supabase.from('prompts').update({ category: generalCatId }).eq('category', id);

        this._data.prompts.forEach(p => {
            if (p.category === id) p.category = generalCatId;
        });

        this._emit('categories:change', this._data.categories);
        this._emit('prompts:change', this._data.prompts);
    }

    /* ---- Stats ---- */
    async getStats() {
        const prompts = await this.getPrompts();
        const categories = await this.getCategories();
        return {
            total: prompts.length,
            categories: categories.length,
            favorites: prompts.filter(p => p.isFavorite).length,
            recentEdits: prompts.filter(p => (Date.now() - p.updatedAt) < 86400000 * 7).length,
        };
    }

    async getPromptsCountByCategory(catId) {
        const prompts = await this.getPrompts();
        return prompts.filter(p => p.category === catId).length;
    }

    /* ---- Helpers ---- */
    _mapPromptData(p) {
        return {
            ...p,
            isFavorite: !!p.favorite,
            tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : (p.tags || []),
            versions: typeof p.versions === 'string' ? JSON.parse(p.versions) : (p.versions || []),
            createdAt: new Date(p.created_at).getTime(),
            updatedAt: new Date(p.updated_at).getTime()
        };
    }
}

const store = new Store();
export default store;
