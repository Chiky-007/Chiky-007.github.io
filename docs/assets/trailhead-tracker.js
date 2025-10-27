document.addEventListener('DOMContentLoaded', function() {
    // ID de tu perfil de Trailhead
    const TRAILBLAZER_ID = 'gdigdw25bv4y3uw2z2'; 
    
    // Elementos del DOM donde inyectaremos los datos
    const totalPointsEl = document.getElementById('total-points');
    const totalBadgesEl = document.getElementById('total-badges');
    const currentRankEl = document.getElementById('current-rank');
    const certListEl = document.getElementById('certifications-list');
    const certTitleEl = certListEl ? certListEl.previousElementSibling : null;

    /**
     * Actualiza la interfaz del Tracker con los datos obtenidos.
     */
    function updateTrackerUI(points, badges, rank, certifications) {
        if (totalPointsEl) totalPointsEl.textContent = points.toLocaleString();
        if (totalBadgesEl) totalBadgesEl.textContent = badges;
        if (currentRankEl) currentRankEl.textContent = rank;

        if (certListEl) {
            certListEl.innerHTML = ''; // Limpiar lista
            if (certTitleEl) certTitleEl.textContent = `Certificaciones Activas (${certifications.length})`;

            if (certifications.length > 0) {
                certifications.forEach(cert => {
                    const li = document.createElement('li');
                    const formattedDate = new Date(cert.dateCompleted).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    });
                    
                    li.innerHTML = `
                        <span>${cert.title}</span>
                        <span class="date">Obtenida: ${formattedDate}</span>
                    `;
                    certListEl.appendChild(li);
                });
            } else {
                certListEl.innerHTML = '<li>¡Ninguna certificación activa registrada!</li>';
            }
        }
    }

    /**
     * Realiza la solicitud usando la API pública de Trailhead
     */
    async function fetchTrailheadData() {
        try {
            // Usamos la API pública de trailblazer.me que no requiere autenticación
            const profileUrl = `https://trailblazer.me/id/${TRAILBLAZER_ID}`;
            
            // Intentamos obtener los datos del perfil público
            // Nota: Esta es una solución temporal. Para producción, necesitarías un backend.
            const corsProxy = 'https://api.allorigins.win/raw?url=';
            const apiUrl = `https://profile.api.trailhead.com/v1/users/${TRAILBLAZER_ID}`;
            
            const response = await fetch(corsProxy + encodeURIComponent(apiUrl));
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();
            
            console.log('✅ Datos recibidos:', data);

            if (data) {
                // Extraer certificaciones activas
                const activeCerts = data.certifications ? 
                    data.certifications.filter(cert => cert.status === 'Active' || cert.status === 'ACTIVE') : 
                    [];
                
                updateTrackerUI(
                    data.earnedPointsSum || 0,
                    data.earnedBadgesCount || 0,
                    data.rank?.title || data.rank?.titleFormatted || 'Ranger',
                    activeCerts
                );
            } else {
                throw new Error('No se encontraron datos del usuario');
            }

        } catch (error) {
            console.error("❌ Error al cargar los datos de Trailhead:", error);
            
            // Mostrar datos de ejemplo para que veas el diseño funcionando
            if (totalPointsEl) totalPointsEl.textContent = 'No disponible';
            if (totalBadgesEl) totalBadgesEl.textContent = 'No disponible';
            if (currentRankEl) currentRankEl.textContent = 'No disponible';
            if (certListEl) {
                certListEl.innerHTML = `
                    <li style="color: #ff6b6b;">
                        ⚠️ No se pudieron cargar los datos. 
                        <a href="https://www.salesforce.com/trailblazer/${TRAILBLAZER_ID}" 
                           target="_blank" 
                           style="color: #00BFFF;">
                           Ver perfil completo
                        </a>
                    </li>
                `;
            }
        }
    }

    // Ejecutar la función al cargar la página
    fetchTrailheadData();
});