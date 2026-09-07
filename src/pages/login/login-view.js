import { renderHeader } from '@components/common/header/header.js';
import { renderFooter } from '@components/common/footer/footer.js';

export function renderLoginPage() {
    const app = document.getElementById('app');
    if (!app) return;
    
    app.innerHTML = '';
    
    // Header
    const header = createHeader();
    app.appendChild(header);
    
    // Main content
    const main = document.createElement('main');
    main.innerHTML = `
        <div class="login-container">
            <h1>Iniciar Sesión</h1>
            <form id="loginForm">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" required>
                </div>
                <div class="form-group">
                    <label for="password">Contraseña</label>
                    <input type="password" id="password" required>
                </div>
                <button type="submit" class="btn-primary">Ingresar</button>
            </form>
            <div id="login-error" class="error-message" style="display:none;"></div>
        </div>
    `;
    app.appendChild(main);
    
    // Footer
    const footer = createFooter();
    app.appendChild(footer);
    
    // Event listener
    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            console.log('Login intentado:', { email, password });
            
            if (email && password) {
                sessionStorage.setItem('auth', 'true');
                sessionStorage.setItem('user', email);
                window.location.href = '/admin';
            } else {
                const error = document.getElementById('login-error');
                error.textContent = 'Por favor, completa todos los campos';
                error.style.display = 'block';
            }
        });
    }
}

// Auto-ejecución
if (window.location.pathname === '/login' || window.location.pathname === '/login/') {
    document.addEventListener('DOMContentLoaded', renderLoginPage);
}