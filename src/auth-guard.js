export function initAuthGuard() {
    const isAuthenticated = sessionStorage.getItem('auth') === 'true';
    
    const protectedPaths = ['/admin'];
    const currentPath = window.location.pathname;
    
    if (protectedPaths.includes(currentPath) && !isAuthenticated) {
        window.location.href = '/login';
    }
    
    console.log('🔒 Auth Guard activo');
}

export function requireAuth() {
    const isAuthenticated = sessionStorage.getItem('auth') === 'true';
    if (!isAuthenticated) {
        window.location.href = '/login';
        return false;
    }
    return true;
}
