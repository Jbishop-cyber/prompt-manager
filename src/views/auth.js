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

          <div class="auth-divider">
            <span>or</span>
          </div>

          <button type="button" class="btn btn-google btn-block" id="google-signin">
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 2.58 9 2.58Z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

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

    // Google Sign-In
    container.querySelector('#google-signin').addEventListener('click', async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/#/'
        }
      });
      if (error) showToast(error.message, 'error');
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
