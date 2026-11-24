// frontend/JS/script.js
// Partida de SigmaMatriz: 5 preguntas, retroalimentación inmediata y cierre con el servidor.

const N_PREGUNTAS = 5;

// Estado de la partida
let jugador = null;
let banco = [];
let pesos = [];
let partida = [];      // preguntas elegidas al azar para esta partida
let indice = 0;        // posición de la pregunta actual (0 a 4)
let seleccion = null;  // alternativa elegida (1 a 4)
let confirmada = false;
let r = [];            // vector de respuestas del jugador
let correctas = 0;
let puntajeParcial = 0; // S acumulado de la partida

// Elementos del DOM
const bienvenida = document.getElementById('bienvenida');
const enunciado = document.getElementById('enunciado');
const figura = document.getElementById('figura');
const opciones = document.getElementById('opciones');
const puntajeEl = document.getElementById('puntaje');
const correctasEl = document.getElementById('correctas');
const numeroEl = document.getElementById('numero');
const progressBar = document.getElementById('progress-bar');
const retroalimentacion = document.getElementById('retroalimentacion');
const icono = document.getElementById('icono');
const titulo = document.getElementById('titulo');
const explicacion = document.getElementById('explicacion');
const detalle = document.getElementById('detalle');
const confirmarBtn = document.getElementById('confirmar');
const siguienteBtn = document.getElementById('siguiente');
const panelPregunta = document.getElementById('panel-pregunta');
const panelResultado = document.getElementById('panel-resultado');
const detalleResultado = document.getElementById('detalle-resultado');
const jugarOtraBtn = document.getElementById('jugar-otra');
const controles = document.getElementById('controles');
const notificacion = document.getElementById('notificacion');
const notificacionTexto = document.getElementById('notificacion-texto');
const pistaBtn = document.getElementById('btn-pista');
const pistaEl = document.getElementById('pista');

// Notificación temporal
function notificar(mensaje, esCorrecta) {
    notificacionTexto.textContent = mensaje;
    notificacion.className = esCorrecta ? 'notification correct show' : 'notification incorrect show';
    setTimeout(() => {
        notificacion.className = 'notification';
    }, 2500);
}

// Elige n preguntas distintas al azar (mezcla y toma las primeras n)
function elegirPartida() {
    const mezcladas = [...banco];
    for (let i = mezcladas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mezcladas[i], mezcladas[j]] = [mezcladas[j], mezcladas[i]];
    }
    return mezcladas.slice(0, N_PREGUNTAS);
}

// Reinicia todo el estado para una nueva partida
function iniciarPartida() {
    partida = elegirPartida();
    indice = 0;
    r = [];
    correctas = 0;
    puntajeParcial = 0;

    panelResultado.classList.add('oculto');
    panelPregunta.classList.remove('oculto');
    controles.classList.remove('oculto');

    actualizarMarcador();
    mostrarPregunta();
}

function actualizarMarcador() {
    puntajeEl.textContent = puntajeParcial;
    correctasEl.textContent = `${correctas}/${r.length}`;
    numeroEl.textContent = `${Math.min(indice + 1, N_PREGUNTAS)}/${N_PREGUNTAS}`;
    const porcentaje = r.length > 0 ? (correctas / r.length) * 100 : 0;
    progressBar.style.width = `${porcentaje}%`;
}

// Muestra la pregunta actual con sus cuatro alternativas
function mostrarPregunta() {
    const pregunta = partida[indice];
    seleccion = null;
    confirmada = false;

    enunciado.textContent = pregunta.enunciado;

    // Pista: se oculta al cambiar de pregunta y no afecta el puntaje
    pistaEl.classList.add('oculto');
    pistaEl.textContent = '';
    pistaBtn.style.display = pregunta.pista ? '' : 'none';

    // Imagen de la pregunta (si tiene)
    figura.innerHTML = '';
    if (pregunta.imagen) {
        const img = document.createElement('img');
        img.src = pregunta.imagen;
        img.alt = pregunta.imagen_alt || '';
        img.style.maxWidth = '100%';
        figura.appendChild(img);
        figura.classList.remove('oculto');
    } else {
        figura.classList.add('oculto');
    }

    opciones.innerHTML = '';
    opciones.classList.remove('disabled');
    retroalimentacion.style.display = 'none';

    pregunta.alternativas.forEach((texto, i) => {
        const opcion = document.createElement('div');
        opcion.className = 'option';
        opcion.innerHTML = `<div class="option-number">${i + 1}</div><div class="option-text"></div>`;
        opcion.querySelector('.option-text').textContent = texto;

        opcion.addEventListener('click', () => {
            if (confirmada) return;
            document.querySelectorAll('.option').forEach((o) => o.classList.remove('selected'));
            opcion.classList.add('selected');
            seleccion = i + 1;
            confirmarBtn.disabled = false;
        });

        opciones.appendChild(opcion);
    });

    confirmarBtn.style.display = '';
    confirmarBtn.disabled = false;
    siguienteBtn.classList.add('oculto');
    siguienteBtn.innerHTML = indice === N_PREGUNTAS - 1
        ? '<i class="fas fa-flag-checkered"></i> Ver resultado'
        : '<i class="fas fa-arrow-right"></i> Siguiente';

    actualizarMarcador();
}

// Confirma la alternativa, marca aciertos y muestra la explicación
function confirmar() {
    if (confirmada) return;
    if (seleccion === null) {
        notificar('Selecciona una alternativa', false);
        return;
    }

    confirmada = true;
    const pregunta = partida[indice];
    const esCorrecta = seleccion === pregunta.correcta;

    r.push(seleccion);
    if (esCorrecta) {
        correctas++;
        puntajeParcial += pesos[indice];
    }

    // Marca la clave y, si falló, la alternativa elegida
    opciones.classList.add('disabled');
    const opcionesDOM = document.querySelectorAll('.option');
    opcionesDOM[pregunta.correcta - 1].classList.add('correct');
    if (!esCorrecta) {
        opcionesDOM[seleccion - 1].classList.add('incorrect');
    }

    // Retroalimentación
    retroalimentacion.style.display = 'block';
    if (esCorrecta) {
        icono.className = 'feedback-icon correct';
        icono.innerHTML = '<i class="fas fa-check"></i>';
        titulo.textContent = `¡Correcto! +${pesos[indice]}`;
        titulo.style.color = '#2ecc71';
    } else {
        icono.className = 'feedback-icon incorrect';
        icono.innerHTML = '<i class="fas fa-times"></i>';
        titulo.textContent = `Incorrecto. +0`;
        titulo.style.color = '#e74c3c';
    }
    explicacion.textContent = pregunta.explicacion;
    detalle.textContent = `La clave es la alternativa ${pregunta.correcta}. Puntaje de la pregunta: ${pesos[indice]}.`;

    confirmarBtn.style.display = 'none';
    siguienteBtn.classList.remove('oculto');
    actualizarMarcador();
}

// Avanza a la siguiente pregunta o cierra la partida
function siguiente() {
    if (!confirmada) return;
    if (indice < N_PREGUNTAS - 1) {
        indice++;
        mostrarPregunta();
    } else {
        finalizarPartida();
    }
}

// Envía la partida al servidor, que calcula c, P y S
async function finalizarPartida() {
    siguienteBtn.disabled = true;
    panelPregunta.classList.add('oculto');
    controles.classList.add('oculto');
    panelResultado.classList.remove('oculto');
    detalleResultado.textContent = 'Guardando partida...';

    const ids = partida.map((p) => p.id);
    try {
        const respuesta = await fetch(`/jugadores/${jugador.id}/puntaje`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ preguntas: ids, respuestas: r })
        });
        const datos = await respuesta.json();
        if (!respuesta.ok) {
            throw new Error(datos.error || 'Error desconocido');
        }

        jugador.mejor_puntaje = datos.mejor_puntaje;
        localStorage.setItem('sigmaJugador', JSON.stringify(jugador));
        mostrarResultado(datos, ids);
    } catch (error) {
        console.error('Error al guardar la partida:', error);
        detalleResultado.textContent = 'No se pudo guardar la partida. Revisa que el servidor esté funcionando.';
    }
}

// Resumen: puntaje final y lista de aciertos y errores
function mostrarResultado(datos) {
    const mejora = datos.mejora === null
        ? 'Primera partida registrada.'
        : `Comparado con tu intento anterior: ${datos.mejora >= 0 ? '+' : ''}${datos.mejora} puntos.`;

    const lista = datos.c.map((ci, i) => `
        <li class="${ci === 1 ? 'acierto' : 'error'}">
            Pregunta ${i + 1}: ${ci === 1 ? 'acertaste' : 'fallaste'}
        </li>`).join('');

    detalleResultado.innerHTML = `
        <p><strong>Puntaje final: ${datos.P}</strong> (${datos.correctas} de ${N_PREGUNTAS} correctas)</p>
        <p>${mejora}</p>
        <p>Mejor puntaje registrado: <strong>${datos.mejor_puntaje}</strong></p>
        <ul class="lista-resultados">${lista}</ul>
        <details class="notacion">
            <summary>Ver notación vectorial</summary>
            ${notacionVectorial(datos)}
        </details>`;
}

// Notación vectorial completa: vectores r, k, c, w y la tabla con el acumulado S
function notacionVectorial(datos) {
    const vec = (v) => `(${v.join(', ')})`;
    const mejora = datos.mejora === null
        ? 'Primera partida registrada.'
        : `Comparado con tu intento anterior: ${datos.mejora >= 0 ? '+' : ''}${datos.mejora} puntos.`;

    const filas = datos.r.map((ri, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${ri}</td>
            <td>${datos.k[i]}</td>
            <td>${datos.c[i]}</td>
            <td>${datos.w[i]}</td>
            <td>${datos.S[i]}</td>
        </tr>`).join('');

    return `
        <p class="vector"><strong>r</strong> = ${vec(datos.r)} (tus alternativas)</p>
        <p class="vector"><strong>k</strong> = ${vec(datos.k)} (clave)</p>
        <p class="vector"><strong>c</strong> = ${vec(datos.c)} (1 = acierto, 0 = error)</p>
        <p class="vector"><strong>w</strong> = ${vec(datos.w)} (peso de cada pregunta)</p>
        <p><strong>Puntaje P = c · w = Σ cᵢ·wᵢ = ${datos.P}</strong> (${datos.correctas} de ${N_PREGUNTAS} correctas)</p>
        <p>${mejora}</p>
        <p>Mejor puntaje registrado: <strong>${datos.mejor_puntaje}</strong></p>
        <table>
            <thead><tr><th>i</th><th>rᵢ</th><th>kᵢ</th><th>cᵢ</th><th>wᵢ</th><th>Sᵢ acumulado</th></tr></thead>
            <tbody>${filas}</tbody>
        </table>`;
}

// Carga inicial
document.addEventListener('DOMContentLoaded', async () => {
    jugador = JSON.parse(localStorage.getItem('sigmaJugador') || 'null');
    if (!jugador) {
        window.location.href = 'inicio.html';
        return;
    }
    bienvenida.textContent = `Jugador: ${jugador.nombre}`;

    // Panel de conceptos (se abre y cierra sin salir de la partida)
    const panelConceptos = document.getElementById('panel-conceptos');
    document.getElementById('btn-conceptos').addEventListener('click', () => {
        panelConceptos.classList.toggle('oculto');
    });
    document.getElementById('cerrar-conceptos').addEventListener('click', () => {
        panelConceptos.classList.add('oculto');
    });

    confirmarBtn.addEventListener('click', confirmar);
    siguienteBtn.addEventListener('click', siguiente);
    pistaBtn.addEventListener('click', () => {
        pistaEl.textContent = `Pista: ${partida[indice].pista}`;
        pistaEl.classList.remove('oculto');
    });
    jugarOtraBtn.addEventListener('click', () => {
        siguienteBtn.disabled = false;
        iniciarPartida();
    });

    try {
        const respuesta = await fetch('/preguntas');
        const datos = await respuesta.json();
        banco = datos.preguntas;
        pesos = datos.pesos;
        iniciarPartida();
    } catch (error) {
        console.error('Error al cargar preguntas:', error);
        enunciado.textContent = 'Error al cargar las preguntas. Revisa que el servidor esté funcionando.';
    }
});
