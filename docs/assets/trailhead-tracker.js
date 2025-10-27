document.addEventListener('DOMContentLoaded', function() {
    // 🎯 DATOS ESTÁTICOS - Actualiza estos valores manualmente desde tu perfil
    const TRAILHEAD_DATA = {
        points: 13000,           // Tus puntos totales
        badges: 12,              // Tus insignias totales
        rank: 'Ranger',          // Tu rango actual
        certifications: [
            // Agrega tus certificaciones aquí
            // { title: 'Nombre de la Certificación', dateCompleted: '2024-01-15' }
        ]
    };
    
    const TRAILBLAZER_ID = 'gdigdw25bv4y3uw2z2';
    
    // Elementos del DOM
    const totalPointsEl = document.getElementById('total-points');
    const totalBadgesEl = document.getElementById('total-badges');
    const currentRankEl = document.getElementById('current-rank');
    const certListEl = document.getElementById('certifications-list');
    const certTitleEl = certListEl ? certListEl.previousElementSibling : null;

    /**
     * Actualiza la interfaz del Tracker
     */
    function updateTrackerUI(points, badges, rank, certifications) {
        if (totalPointsEl) totalPointsEl.textContent = points.toLocaleString();
        if (totalBadgesEl) totalBadgesEl.textContent = badges;
        if (currentRankEl) currentRankEl.textContent = rank;

        if (certListEl) {
            certListEl.innerHTML = '';
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
                certListEl.innerHTML = '<li>🎯 Actualmente trabajando en nuevas certificaciones</li>';
            }
        }
    }

    // Cargar datos estáticos inmediatamente
    console.log('📊 Cargando datos de Trailhead...');
    updateTrackerUI(
        TRAILHEAD_DATA.points,
        TRAILHEAD_DATA.badges,
        TRAILHEAD_DATA.rank,
        TRAILHEAD_DATA.certifications
    );
    console.log('✅ Datos de Trailhead cargados exitosamente');
});