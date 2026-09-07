export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function formatDate(date) {
    return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

export function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

export function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast toast-';
    toast.textContent = message;
    toast.style.cssText = '
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        background: ' + (type === 'error' ? '#e74c3c' : '#2ecc71') + ';
        color: white;
        border-radius: 4px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
    ';
    
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
