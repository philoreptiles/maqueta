export function createCardElement(ejemplar) {
    const card = document.createElement('article');
    card.className = 'card';
    card.dataset.id = ejemplar.id;

    const precioFormat = new Intl.NumberFormat('es-MX', { 
        style: 'currency', 
        currency: 'MXN',
        minimumFractionDigits: 2 
    }).format(ejemplar.precio || 0);

    const anio = ejemplar.nacimiento ? String(ejemplar.nacimiento).substring(0, 4) : 'N/A';
    const estatus = ejemplar.estatus || 'Disponible';
    const statusClass = `status-${estatus.toLowerCase()}`;

    card.innerHTML = `
        <div class="card-image-wrapper">
            <span class="status-badge ${statusClass}">${estatus}</span>
            <img src="${ejemplar.imagen_url || 'https://via.placeholder.com/400x300?text=Sin+Imagen'}" alt="${ejemplar.especie || 'Crotalus'}" class="card-image" loading="lazy" />
        </div>
        <div class="card-content">
            <span class="card-species">${ejemplar.especie || 'Crotalus'}</span>
            <h3 class="card-genetics">${ejemplar.genetica || 'Nominal'}</h3>
            <p class="card-details">${ejemplar.sexo || 'Sin sexar'} • ${anio}</p>
            <p class="card-price">${precioFormat}</p>
        </div>
    `;

    return card;
}