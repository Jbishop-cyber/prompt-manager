import { supabase } from '../supabase.js';
import { showToast } from '../toast.js';

export function renderAuth(container) {
  let isLogin = true;

  const render = () => {
    container.innerHTML = `
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-header">
            <div class="auth-logo">
              <i class="fas fa-bolt"></i>
            </div>
            <h1>${isLogin ? 'Welcome Back' : 'Create Account'}</h1>
            <p>${isLogin ? 'Login to access your prompts' : 'Join PromptLab to start organizing'}</p>
          </div>

          <form id="auth-form" class="auth-form">
            ${!isLogin ? `
              <div class="form-group">
                <label>Username</label>
                <input type="text" id="username" placeholder="johndoe" required>
              </div>
            ` : ''}
            <div class="form-group">
              <label>Email Address</label>
              <input type="email" id="email" placeholder="name@example.com" required>
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" id="password" placeholder="••••••••" required>
            </div>
            
            <button type="submit" class="btn btn-primary btn-block" id="auth-submit">
              ${isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>

          <div class="auth-footer">
            <p>
              ${isLogin ? "Don't have an account?" : "Already have an account?"}
              <a href="#" id="toggle-auth">${isLogin ? 'Sign Up' : 'Login'}</a>
            </p>
          </div>
        </div>
      </div>
    `;

    // Event Listeners
    container.querySelector('#toggle-auth').addEventListener('click', (e) => {
      e.preventDefault();
      isLogin = !isLogin;
      render();
    });

    container.querySelector('#auth-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = container.querySelector('#auth-submit');
      const email = container.querySelector('#email').value;
      const password = container.querySelector('#password').value;
      const username = !isLogin ? container.querySelector('#username').value : null;

      submitBtn.disabled = true;
      submitBtn.innerText = isLogin ? 'Logging in...' : 'Creating...';

      try {
        if (isLogin) {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          showToast('Welcome back!', 'success');
        } else {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { username } }
          });
          if (error) throw error;
          showToast('Account created! You can now log in.', 'success');
        }
        window.location.hash = '/';
      } catch (err) {
        showToast(err.message, 'error');
        submitBtn.disabled = false;
        submitBtn.innerText = isLogin ? 'Login' : 'Sign Up';
      }
    });
  };

  render();
}
