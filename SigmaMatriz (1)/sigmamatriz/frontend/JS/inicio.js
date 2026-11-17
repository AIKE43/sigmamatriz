// frontend/JS/inicio.js
// Registra al jugador en el backend y guarda su perfil para la partida.

document.addEventListener('DOMContentLoaded', () => {
    const nameForm = document.getElementById('nameForm');

    nameForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = document.getElementById('userName').value.trim();
        if (nombre === '') {
            alert('Por favor, ingresa tu nombre');
            return;
        }

        try {
            const respuesta = await fetch('/jugadores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre })
            });
            const datos = await respuesta.json();
            if (!respuesta.ok) {
                throw new Error(datos.error || 'Error desconocido');
            }

            localStorage.setItem('sigmaJugador', JSON.stringify(datos.jugador));
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error al registrar jugador:', error);
            alert('No se pudo conectar con el servidor. Revisa que esté funcionando.');
        }
    });
});
