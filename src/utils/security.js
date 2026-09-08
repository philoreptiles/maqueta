/**
 * Escapa caracteres especiales de HTML para prevenir ataques XSS (Cross-Site Scripting).
 */
export function escapeHTML(value) {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Valida y asegura que la URL de la imagen sea segura, previniendo inyecciones.
 */
export function safeImageUrl(url, defaultUrl = '') {
    if (!url || typeof url !== 'string') return defaultUrl;
    const trimmed = url.trim();
    // Validación básica: asegura que empiece con http, https, o sea una ruta relativa
    if (/^(https?:\/\/|\/|\.\/)/i.test(trimmed)) {
        return escapeHTML(trimmed);
    }
    return defaultUrl;
}