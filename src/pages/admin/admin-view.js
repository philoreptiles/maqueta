import { renderHeader } from '@components/common/header/header.js';
import { renderFooter } from '@components/common/footer/footer.js';

export function renderAdminPage() {
    const app = document.getElementById('app');
    if (!app) return;
    
    // Verificar autenticación
    const auth = sessionStorage.getItem('auth');
    if (auth !== 'true') {
        window.location.href = '/login';
        return;
    }
    
    app.innerHTML = '';
    
    // Header
    const header = createHeader();
    app.appendChild(header);
    
    // Main content
    const main = document.createElement('main');
    const user = sessionStorage.getItem('user') || 'Admin';
    main.innerHTML = `
        <div class="admin-container">
            <h1>Panel de Administración</h1>
            <p>Bienvenido, ${user}</p>
            <button id="logoutBtn" class="btn-secondary">Cerrar Sesión</button>
        </div>
    `;
    app.appendChild(main);
    
    // Footer
    const footer = createFooter();
    app.appendChild(footer);
    
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.clear();
            window.location.href = '/login';
        });
    }
}

// Auto-ejecución
if (window.location.pathname === '/admin' || window.location.pathname === '/admin/') {
    document.addEventListener('DOMContentLoaded', renderAdminPage);
}