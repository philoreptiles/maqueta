export async function renderHeader(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <header class="site-header">
            <div class="header-container">
                <a href="/index.html" class="brand-info">
                    <span class="brand-title">Escama y Colmillo</span>
                    <span class="semarnat-tag">SEMARNAT-PIMVS-IN-0000-JAL</span>
                </a>
                <nav class="header-nav">
                    <a href="/index.html" class="nav-btn">Ejemplares</a>
                    <a href="/nosotros.html" class="nav-btn">Nosotros</a>
                    <a href="https://wa.me/5210000000000" target="_blank" rel="noopener noreferrer" class="whatsapp-btn">
                        <span>WhatsApp</span>
                    </a>
                </nav>
            </div>
        </header>
    `;
}