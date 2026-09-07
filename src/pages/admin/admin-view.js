import { supabase } from '../../supabase-config.js';

// DOM Elements
const loginSection = document.getElementById('login-section');
const adminDashboard = document.getElementById('admin-dashboard');
const loginForm = document.getElementById('login-form');
const loginErrorMsg = document.getElementById('login-error-msg');
const authHeaderAction = document.getElementById('auth-header-action');
const addForm = document.getElementById('add-ejemplar-form');
const filterForm = document.getElementById('filter-form');
const btnResetFilters = document.getElementById('btn-reset-filters');
const btnExportCsv = document.getElementById('btn-export-csv');
const statusAlert = document.getElementById('status-alert');

const latestTableBody = document.getElementById('latest-table-body');
const fullTableBody = document.getElementById('full-inventory-table-body');
const filterAnioSelect = document.getElementById('filter-anio');

// Almacenamiento local del inventario filtrado actual
let currentFilteredData = [];

document.addEventListener('DOMContentLoaded', () => {
    initAuthListener();
    setupDragAndDrop('drop-zone-1', 'imagen1', 'preview-1');
    setupDragAndDrop('drop-zone-2', 'imagen2', 'preview-2');

    if (btnExportCsv) {
        btnExportCsv.addEventListener('click', () => {
            const filename = getCSVFilename();
            downloadCSV(currentFilteredData, filename);
        });
    }
});

// ==========================================
// AUTENTICACIÓN
// ==========================================
async function initAuthListener() {
    const { data: { session } } = await supabase.auth.getSession();
    updateUI(session);

    supabase.auth.onAuthStateChange((_event, session) => {
        updateUI(session);
    });
}

function updateUI(session) {
    if (session) {
        loginSection.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
        authHeaderAction.innerHTML = `<button id="btn-logout" class="btn-secondary-premium">Cerrar sesión</button>`;
        document.getElementById('btn-logout').addEventListener('click', () => supabase.auth.signOut());
        loadDashboardData();
    } else {
        loginSection.classList.remove('hidden');
        adminDashboard.classList.add('hidden');
        authHeaderAction.innerHTML = '';
    }
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginErrorMsg.classList.add('hidden');
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btnLogin = document.getElementById('btn-login');

    btnLogin.disabled = true;
    btnLogin.textContent = 'Iniciando sesión...';

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        loginErrorMsg.textContent = 'Credenciales inválidas. Verifica tu correo y contraseña.';
        loginErrorMsg.classList.remove('hidden');
    }

    btnLogin.disabled = false;
    btnLogin.textContent = 'Iniciar Sesión';
});

// ==========================================
// ESTADÍSTICAS Y CSV
// ==========================================
async function getEstadisticas() {
    const { data, error } = await supabase
        .from('ejemplares')
        .select('estatus');
    
    if (error) throw error;
    
    const total = data.length;
    const disponibles = data.filter(e => e.estatus === 'Disponible').length;
    const apartados = data.filter(e => e.estatus === 'Apartado').length;
    const vendidos = data.filter(e => e.estatus === 'Vendido').length;
    const holdbacks = data.filter(e => e.estatus === 'Holdback').length;
    
    return { total, disponibles, apartados, vendidos, holdbacks };
}

async function renderEstadisticas() {
    try {
        const stats = await getEstadisticas();
        document.getElementById('stat-total').textContent = stats.total;
        document.getElementById('stat-disponibles').textContent = stats.disponibles;
        document.getElementById('stat-apartados').textContent = stats.apartados;
        document.getElementById('stat-vendidos').textContent = stats.vendidos;
        document.getElementById('stat-holdbacks').textContent = stats.holdbacks;
    } catch (error) {
        console.error('Error al actualizar estadísticas:', error);
    }
}

function downloadCSV(data, filename = 'inventario.csv') {
    const headers = ['ID', 'Especie', 'Genética', 'Sexo', 'Año', 'Precio', 'Estatus', 'Fecha Registro'];
    const rows = data.map(ejemplar => [
        ejemplar.id,
        `"${ejemplar.especie || ''}"`,
        `"${ejemplar.genetica || ''}"`,
        `"${ejemplar.sexo || ''}"`,
        ejemplar.nacimiento || '',
        ejemplar.precio || 0,
        `"${ejemplar.estatus || ''}"`,
        ejemplar.created_at ? new Date(ejemplar.created_at).toLocaleDateString() : ''
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

function getCSVFilename() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `inventario_${year}-${month}-${day}.csv`;
}

// ==========================================
// MANEJO DE DRAG & DROP E IMÁGENES
// ==========================================
function setupDragAndDrop(zoneId, inputId, previewId) {
    const dropZone = document.getElementById(zoneId);
    const fileInput = document.getElementById(inputId);
    const previewContainer = document.getElementById(previewId);

    dropZone.addEventListener('click', () => fileInput.click());

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
        });
    });

    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleFilePreview(files[0], previewContainer, dropZone);
        }
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            handleFilePreview(fileInput.files[0], previewContainer, dropZone);
        }
    });
}

function handleFilePreview(file, previewContainer, dropZone) {
    const reader = new FileReader();
    reader.onload = (e) => {
        previewContainer.innerHTML = `
            <img src="${e.target.result}" class="preview-thumb" alt="Vista previa">
            <button type="button" class="btn-change-img">Cambiar imagen</button>
        `;
        previewContainer.classList.remove('hidden');
        dropZone.style.display = 'none';

        previewContainer.querySelector('.btn-change-img').addEventListener('click', () => {
            previewContainer.classList.add('hidden');
            previewContainer.innerHTML = '';
            dropZone.style.display = 'flex';
            const input = dropZone.querySelector('input');
            if (input) input.value = '';
        });
    };
    reader.readAsDataURL(file);
}

async function uploadImage(file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `ejemplares/${fileName}`;

    const { error } = await supabase.storage.from('ejemplares').upload(filePath, file);
    if (error) throw error;

    const { data } = supabase.storage.from('ejemplares').getPublicUrl(filePath);
    return data.publicUrl;
}

// ==========================================
// OPERACIONES CRUD
// ==========================================
addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showAlert('Guardando ejemplar...', 'info');
    const btnSave = document.getElementById('btn-save');
    btnSave.disabled = true;

    try {
        const file1 = document.getElementById('imagen1').files[0];
        const file2 = document.getElementById('imagen2').files[0];

        if (!file1) throw new Error('La imagen 1 es obligatoria.');

        const url1 = await uploadImage(file1);
        const url2 = file2 ? await uploadImage(file2) : null;

        const nuevoEjemplar = {
            especie: document.getElementById('especie').value.trim(),
            genetica: document.getElementById('genetica').value.trim() || 'Nominal',
            sexo: document.getElementById('sexo').value,
            nacimiento: parseInt(document.getElementById('nacimiento').value, 10),
            precio: parseFloat(document.getElementById('precio').value),
            estatus: document.getElementById('estatus').value,
            imagen_url: url1,
            imagen_url_2: url2
        };

        const { error } = await supabase.from('ejemplares').insert([nuevoEjemplar]);
        if (error) throw error;

        showAlert('¡Ejemplar registrado exitosamente!', 'success');
        addForm.reset();
        resetPreviews();
        loadDashboardData();

    } catch (err) {
        showAlert(`Error: ${err.message}`, 'error');
    } finally {
        btnSave.disabled = false;
    }
});

function resetPreviews() {
    ['1', '2'].forEach(id => {
        const preview = document.getElementById(`preview-${id}`);
        const zone = document.getElementById(`drop-zone-${id}`);
        if (preview && zone) {
            preview.classList.add('hidden');
            preview.innerHTML = '';
            zone.style.display = 'flex';
        }
    });
}

async function deleteEjemplar(id, especie) {
    if (!confirm(`¿Eliminar el ejemplar "${especie}"?`)) return;

    showAlert('Eliminando...', 'info');
    const { error } = await supabase.from('ejemplares').delete().eq('id', id);

    if (error) {
        showAlert(`Error: ${error.message}`, 'error');
    } else {
        showAlert('Ejemplar eliminado correctamente.', 'success');
        loadDashboardData();
    }
}

// ==========================================
// RENDERING TABLAS Y FILTROS
// ==========================================
async function loadDashboardData() {
    await Promise.all([
        loadLatestEjemplares(),
        loadFullInventory(),
        populateYearFilter(),
        renderEstadisticas()
    ]);
}

async function loadLatestEjemplares() {
    const { data, error } = await supabase
        .from('ejemplares')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) return;
    renderTableRows(data, latestTableBody);
}

async function loadFullInventory(filtros = {}) {
    let query = supabase.from('ejemplares').select('*');

    if (filtros.estatus) query = query.eq('estatus', filtros.estatus);
    if (filtros.genetica) query = query.ilike('genetica', `%${filtros.genetica}%`);
    if (filtros.sexo) query = query.eq('sexo', filtros.sexo);
    if (filtros.anio) query = query.eq('nacimiento', parseInt(filtros.anio, 10));

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return;

    currentFilteredData = data || [];
    renderTableRows(data, fullTableBody);
}

async function populateYearFilter() {
    const { data } = await supabase.from('ejemplares').select('nacimiento');
    if (!data) return;

    const years = [...new Set(data.map(i => i.nacimiento).filter(Boolean))].sort((a, b) => b - a);
    filterAnioSelect.innerHTML = `<option value="">Todos los años</option>`;
    years.forEach(y => {
        filterAnioSelect.innerHTML += `<option value="${y}">${y}</option>`;
    });
}

function renderTableRows(ejemplares, targetTbody) {
    if (!ejemplares || ejemplares.length === 0) {
        targetTbody.innerHTML = `<tr><td colspan="8" style="text-align: center;">No se encontraron registros.</td></tr>`;
        return;
    }

    targetTbody.innerHTML = ejemplares.map(item => {
        const precioFormatted = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(item.precio || 0);
        const estatusLower = (item.estatus || 'disponible').toLowerCase();
        const imgSrc = item.imagen_url || 'https://via.placeholder.com/40?text=Sin+Foto';

        return `
            <tr>
                <td><img src="${imgSrc}" class="table-thumb" alt="${item.especie}"></td>
                <td><strong>${item.especie || 'N/A'}</strong></td>
                <td>${item.genetica || 'Nominal'}</td>
                <td>${item.sexo || 'No sexado'}</td>
                <td>${item.nacimiento || 'N/A'}</td>
                <td style="font-weight: 700; color: var(--color-orange);">${precioFormatted}</td>
                <td><span class="status-badge status-${estatusLower}">${item.estatus}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-edit-icon" title="Editar" data-id="${item.id}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button class="btn-icon btn-delete-icon" title="Eliminar" data-id="${item.id}" data-especie="${item.especie}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    targetTbody.querySelectorAll('.btn-delete-icon').forEach(btn => {
        btn.addEventListener('click', () => {
            deleteEjemplar(btn.getAttribute('data-id'), btn.getAttribute('data-especie'));
        });
    });
}

filterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loadFullInventory({
        estatus: document.getElementById('filter-estatus').value,
        genetica: document.getElementById('filter-genetica').value.trim(),
        sexo: document.getElementById('filter-sexo').value,
        anio: document.getElementById('filter-anio').value
    });
});

btnResetFilters.addEventListener('click', () => {
    filterForm.reset();
    loadFullInventory();
});

function showAlert(message, type = 'info') {
    statusAlert.className = `alert-premium alert-${type}`;
    statusAlert.textContent = message;
    statusAlert.classList.remove('hidden');
    if (type === 'success' || type === 'info') {
        setTimeout(() => statusAlert.classList.add('hidden'), 4000);
    }
}