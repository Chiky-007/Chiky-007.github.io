document.addEventListener('DOMContentLoaded', function() {
    // 🎯 DATOS ESTÁTICOS - Actualiza estos valores manualmente desde tu perfil
    const TRAILHEAD_DATA = {
        points: 13000,           // Tus puntos totales
        badges: 12,              // Tus insignias totales
        rank: 'Ranger'           // Tu rango actual
    };
    
    // Elementos del DOM
    const totalPointsEl = document.getElementById('total-points');
    const totalBadgesEl = document.getElementById('total-badges');
    const currentRankEl = document.getElementById('current-rank');

    /**
     * Actualiza la interfaz del Tracker
     */
    function updateTrackerUI(points, badges, rank) {
        if (totalPointsEl) totalPointsEl.textContent = points.toLocaleString();
        if (totalBadgesEl) totalBadgesEl.textContent = badges;
        if (currentRankEl) currentRankEl.textContent = rank;
    }

    // Cargar datos estáticos inmediatamente
    console.log('📊 Cargando datos de Trailhead...');
    updateTrackerUI(
        TRAILHEAD_DATA.points,
        TRAILHEAD_DATA.badges,
        TRAILHEAD_DATA.rank
    );
    console.log('✅ Datos de Trailhead cargados exitosamente');
});