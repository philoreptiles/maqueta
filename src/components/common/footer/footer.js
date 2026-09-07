export async function renderFooter(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <footer class="site-footer">
            <div class="footer-container">
                <nav class="footer-nav">
                    <a href="/index.html" class="footer-link">Ejemplares</a>
                    <a href="/nosotros.html" class="footer-link">Nosotros</a>
                    <a href="/src/pages/admin/admin.html" class="footer-link">Admin</a>
                </nav>
                <p class="footer-copyright">
                    &copy; 2026 Escama y Colmillo - Guadalajara, Jalisco, México
                </p>
            </div>
        </footer>
    `;
}