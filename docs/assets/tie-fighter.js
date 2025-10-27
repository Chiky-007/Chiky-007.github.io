document.addEventListener('DOMContentLoaded', function() {
    // NOTA: Esta variable 'sonidoActivado' es global y debe ser definida 
    // en assets/audio-toggle.js, cargado previamente en el index.html.
    if (typeof sonidoActivado === 'undefined') {
        console.warn("La variable 'sonidoActivado' no está definida. Los sonidos de la nave estarán desactivados por defecto.");
        window.sonidoActivado = false; // Definir como fallback si el script de audio no carga.
    }

    const tieFighter = document.getElementById('tie-fighter');
    const tieContainer = document.getElementById('tie-fighter-container');
    const flybySound = document.getElementById('flyby-sound');
    
    // Posición inicial y del cursor
    let tieX = window.innerWidth / 2;
    let tieY = window.innerHeight / 2;
    let targetX = tieX;
    let targetY = tieY;
    let isMoving = false;
    
    // Variables para detectar movimiento rápido
    let lastMouseX = 0;
    let lastMouseY = 0;
    let lastMoveTime = Date.now();
    let flybyTimeout = null;
    let movementTimeout = null;
    let canPlayFlybySound = true;
    let currentlyPlayingFlyby = null;
    let isMouseMoving = false;
    
    // Distancia y velocidad de seguimiento
    const distanciaMantenida = 50; 
    const velocidadSeguimiento = 0.07; 
    
    document.addEventListener('mousemove', function(e) {
        // Marcar que el ratón está en movimiento
        isMouseMoving = true;
        
        // Configurar un temporizador para detectar cuando el ratón se detiene
        clearTimeout(movementTimeout);
        movementTimeout = setTimeout(() => {
            isMouseMoving = false;
            
            // Detener cualquier sonido cuando el ratón se detiene
            if (currentlyPlayingFlyby && !currentlyPlayingFlyby.ended) {
                currentlyPlayingFlyby.pause();
                currentlyPlayingFlyby.currentTime = 0;
                currentlyPlayingFlyby = null;
                canPlayFlybySound = true;
                console.log("Sonido detenido: ratón quieto");
            }
        }, 100); // Detectar quietud después de 100ms sin movimiento
        
        // Calcular velocidad del movimiento del cursor
        const currentTime = Date.now();
        const timeElapsed = currentTime - lastMoveTime;
        
        if (timeElapsed > 0) {
            const distX = e.clientX - lastMouseX;
            const distY = e.clientY - lastMouseY;
            const distance = Math.sqrt(distX * distX + distY * distY);
            const speed = distance / timeElapsed; // píxeles por milisegundo
            
            // Umbral de velocidad aumentado a 1.2
            // Si el movimiento es rápido, reproducir sonido de flyby
            if (speed > 1.2 && canPlayFlybySound && sonidoActivado && 
                (!currentlyPlayingFlyby || currentlyPlayingFlyby.ended)) {
                
                canPlayFlybySound = false; // Evitar reproducción continua
                
                try {
                    // Asegurarnos que no haya un sonido reproduciéndose actualmente
                    if (currentlyPlayingFlyby && !currentlyPlayingFlyby.ended) {
                        return; // No reproducir si ya hay uno en curso
                    }
                    
                    // Crear nuevo sonido
                    const flybyClone = flybySound.cloneNode(true);
                    flybyClone.volume = 0.4; // Volumen más bajo para no ser molesto
                    
                    // Guardar referencia al sonido actual
                    currentlyPlayingFlyby = flybyClone;
                    
                    // Reproducir y manejar la finalización
                    const playPromise = flybyClone.play().catch(err => {
                        console.log("Error al reproducir sonido flyby:", err);
                        currentlyPlayingFlyby = null;
                        canPlayFlybySound = true;
                    });
                    
                    // Cuando el sonido termine naturalmente, permitir otro
                    flybyClone.onended = function() {
                        currentlyPlayingFlyby = null;
                        canPlayFlybySound = true;
                    };
                    
                    // Backup: permitir otro sonido después de la duración del audio + margen
                    clearTimeout(flybyTimeout);
                    flybyTimeout = setTimeout(() => {
                        if (!isMouseMoving && currentlyPlayingFlyby) {
                            // Si el ratón ya no se está moviendo, detener el sonido inmediatamente
                            currentlyPlayingFlyby.pause();
                            currentlyPlayingFlyby.currentTime = 0;
                        }
                        canPlayFlybySound = true;
                        currentlyPlayingFlyby = null;
                    }, 2000); // Esperar 2 segundos antes de resetear
                } catch(e) {
                    console.error("Error al reproducir sonido de flyby:", e);
                    canPlayFlybySound = true;
                    currentlyPlayingFlyby = null;
                }
            }
        }
        
        // Actualizar posiciones para el siguiente cálculo
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        lastMoveTime = currentTime;
        
        // Guardar posición del cursor como objetivo
        targetX = e.clientX;
        targetY = e.clientY;
        
        // Iniciar animación si no está activa
        if (!isMoving) {
            isMoving = true;
            updatePosition();
        }
    });
    // Detener el sonido cuando el usuario suelte el botón del ratón
    document.addEventListener('mouseup', function() {
        if (currentlyPlayingFlyby && !currentlyPlayingFlyby.ended) {
            currentlyPlayingFlyby.pause();
            currentlyPlayingFlyby.currentTime = 0;
            currentlyPlayingFlyby = null;
            canPlayFlybySound = true;
        }
    });
    
    // Función para detener el audio activo (mantenida por si acaso, aunque está en mouseup/mousemove)
    function stopActiveAudio() {
        if (currentlyPlayingFlyby && !currentlyPlayingFlyby.ended) {
            currentlyPlayingFlyby.pause();
            currentlyPlayingFlyby.currentTime = 0;
            currentlyPlayingFlyby = null;
            canPlayFlybySound = true;
        }
    }
    
    // Variables para suavizado de rotación
    let currentAngulo = 0;
    let targetAngulo = 0;
    
    // Función para normalizar ángulo entre -180 y 180 grados
    function normalizarAngulo(angulo) {
        let result = angulo;
        while (result > 180) result -= 360;
        while (result < -180) result += 360;
        return result;
    }
    
    // Función para actualizar posición con suavizado y distancia
    function updatePosition() {
        if (tieFighter && tieContainer) {
            // Calcular vector desde nave a cursor
            const dx = targetX - tieX;
            const dy = targetY - tieY;
            
            // Calcular distancia actual
            const distancia = Math.sqrt(dx * dx + dy * dy);
            
            // Solo mover si está más lejos que la distancia a mantener
            if (distancia > distanciaMantenida) {
                // Calcular punto objetivo respetando la distancia
                const factor = 1 - (distanciaMantenida / distancia);
                
                // Calcular velocidad de seguimiento adaptativa basada en distancia
                const velocidadAdaptativa = velocidadSeguimiento * Math.min(1.5, Math.max(0.5, distancia / 300));
                
                // Aplicar suavizado con interpolación
                tieX += dx * velocidadAdaptativa * factor;
                tieY += dy * velocidadAdaptativa * factor;
                
                // Actualizar posición
                tieContainer.style.left = tieX + 'px';
                tieContainer.style.top = tieY + 'px';
            }
            
            // Calcular ángulo objetivo para orientar hacia el cursor
            targetAngulo = Math.atan2(dy, dx) * 180 / Math.PI;
            
            // Calculamos la diferencia entre el ángulo actual y el objetivo
            let deltaAngulo = normalizarAngulo(targetAngulo - currentAngulo);
            
            // Suavizado de rotación con velocidad adaptativa
            const velocidadRotacion = 0.1 + (Math.abs(deltaAngulo) / 180) * 0.2;
            currentAngulo += deltaAngulo * velocidadRotacion;
            
            // Normalizamos el ángulo resultante
            currentAngulo = normalizarAngulo(currentAngulo);
            
            // Construimos la transformación completa en una sola operación
            let transformacion = `translate(-50%, -50%) rotate(${currentAngulo - 90}deg)`;
            
            // Añadir un poco de inclinación según el movimiento
            const inclinacion = Math.min(15, Math.abs(deltaAngulo) / 5);
            if (Math.abs(deltaAngulo) > 5) {
                // Inclinar en la dirección del giro
                const direccionGiro = deltaAngulo > 0 ? -1 : 1;
                transformacion += ` rotateY(${inclinacion * direccionGiro}deg)`;
            }
            
            // Aplicamos la transformación de una sola vez
            tieFighter.style.transform = transformacion;
        }
        
        // Continuar animación
        if (isMoving) {
            requestAnimationFrame(updatePosition);
        } else {
            isMoving = false;
        }
    }
    
    // Detector de clic mejorado para disparar
    document.addEventListener('click', function(e) {
        // Añadir clase de disparo a la nave para animación
        if (tieFighter) {
            // Forzar un 'reflow' para reiniciar la animación CSS
            tieFighter.classList.remove('shooting');
            void tieFighter.offsetWidth; 
            tieFighter.classList.add('shooting');
            
            // Quitar la clase de disparo después de la duración de la animación
            setTimeout(() => {
                tieFighter.classList.remove('shooting');
            }, 200);
        }
        
        // Usar el ángulo actual de la nave para el disparo
        const anguloRadianes = (currentAngulo) * Math.PI / 180;
        const velocidadLaser = 15;
        
        // Calcular la posición inicial del láser justo delante de la nave
        const offsetDisparo = 30; // Distancia desde el centro de la nave
        let laserX = tieX + Math.cos(anguloRadianes) * offsetDisparo;
        let laserY = tieY + Math.sin(anguloRadianes) * offsetDisparo;
        
        // Crear láser
        const laser = document.createElement('div');
        laser.className = 'laser';
        laser.style.position = 'fixed';
        laser.style.left = laserX + 'px';
        laser.style.top = laserY + 'px';
        laser.style.transform = `rotate(${currentAngulo}deg)`;
        
        document.body.appendChild(laser);
        
        // Animar láser
        let duracionLaser = 0;
        const animarLaser = () => {
            laserX += Math.cos(anguloRadianes) * velocidadLaser;
            laserY += Math.sin(anguloRadianes) * velocidadLaser;
            
            laser.style.left = laserX + 'px';
            laser.style.top = laserY + 'px';
            
            duracionLaser += 16; // aprox 16ms por frame
            
            // Comprobar si el láser está fuera de la ventana visible
            const fueraDeVentana = 
                laserX < 0 || 
                laserX > window.innerWidth || 
                laserY < 0 || 
                laserY > window.innerHeight;
            
            if (duracionLaser < 1000 && !fueraDeVentana) {
                requestAnimationFrame(animarLaser);
            } else {
                if (document.body.contains(laser)) {
                    document.body.removeChild(laser);
                }
            }
        };
        
        animarLaser();
        
        // Reproducir sonido si está activado
        if (sonidoActivado) {
            const laserSound = document.getElementById('laser-sound');
            if (laserSound) {
                try {
                    const laserSoundClone = laserSound.cloneNode(true);
                    laserSoundClone.volume = 0.6;
                    laserSoundClone.play().catch(error => {
                        console.log("No se pudo reproducir el sonido: interacción requerida");
                    });
                } catch(e) {
                    console.error("Error al reproducir sonido:", e);
                }
            }
        }
    });
    
    console.log("🚀 TIE Fighter con seguimiento a distancia listo");
});