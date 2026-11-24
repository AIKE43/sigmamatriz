// backend/server.js
// API REST de SigmaMatriz. Sirve también el frontend.

const express = require('express');
const path = require('path');
const { run, get, all, listo, PESOS } = require('./database.js');

const app = express();
// En hosting (Render, Railway, etc.) el puerto lo asigna el servicio con la variable PORT
const PORT = process.env.PORT || 4000;
const N_PREGUNTAS = PESOS.length; // 5 preguntas por partida

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.get('/', (req, res) => res.redirect('/html/inicio.html'));

// Envuelve rutas async para que los errores lleguen al manejador
const ruta = (fn) => (req, res) => fn(req, res).catch((err) => {
    console.error(err);
    res.status(500).json({ error: err.message });
});

// GET /preguntas -> banco completo (el frontend lo usa para armar la partida y mostrar retroalimentación)
app.get('/preguntas', ruta(async (req, res) => {
    await listo;
    const filas = await all('SELECT id, enunciado, alternativas, correcta, explicacion, imagen, imagen_alt, pista FROM preguntas ORDER BY id');
    const preguntas = filas.map((p) => ({ ...p, alternativas: JSON.parse(p.alternativas) }));
    res.json({ preguntas, pesos: PESOS });
}));

// POST /jugadores -> registra un jugador (si ya existe, devuelve su perfil)
app.post('/jugadores', ruta(async (req, res) => {
    await listo;
    const nombre = (req.body.nombre || '').trim();
    if (!nombre) {
        return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const existente = await get('SELECT * FROM jugadores WHERE nombre = ?', [nombre]);
    if (existente) {
        return res.json({ jugador: existente, mensaje: 'Jugador encontrado' });
    }

    const nuevo = await run('INSERT INTO jugadores (nombre) VALUES (?)', [nombre]);
    const jugador = await get('SELECT * FROM jugadores WHERE id = ?', [nuevo.lastID]);
    res.status(201).json({ jugador, mensaje: 'Jugador creado' });
}));

// PUT /jugadores/:id/puntaje -> cierra una partida.
// El servidor calcula el vector de aciertos c y el puntaje P = Σ cᵢ·wᵢ con la clave guardada.
app.put('/jugadores/:id/puntaje', ruta(async (req, res) => {
    await listo;
    const jugadorId = Number(req.params.id);
    const { preguntas, respuestas } = req.body;

    const jugador = await get('SELECT * FROM jugadores WHERE id = ?', [jugadorId]);
    if (!jugador) {
        return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    if (!Array.isArray(preguntas) || !Array.isArray(respuestas) ||
        preguntas.length !== N_PREGUNTAS || respuestas.length !== N_PREGUNTAS) {
        return res.status(400).json({ error: `Se requieren ${N_PREGUNTAS} preguntas y ${N_PREGUNTAS} respuestas` });
    }
    if (!respuestas.every((r) => Number.isInteger(r) && r >= 1 && r <= 4)) {
        return res.status(400).json({ error: 'Cada respuesta debe ser un entero entre 1 y 4' });
    }

    // Vectores: r (respuestas), k (clave), c (aciertos), w (pesos)
    const r = respuestas;
    const k = [];
    for (const id of preguntas) {
        const fila = await get('SELECT correcta FROM preguntas WHERE id = ?', [id]);
        if (!fila) {
            return res.status(400).json({ error: `La pregunta ${id} no existe` });
        }
        k.push(fila.correcta);
    }
    const c = r.map((ri, i) => (ri === k[i] ? 1 : 0));
    const w = PESOS;

    // P = Σ cᵢ·wᵢ (producto punto de c y w) y S acumulado
    let P = 0;
    const S = [];
    for (let i = 0; i < N_PREGUNTAS; i++) {
        P += c[i] * w[i];
        S.push(P);
    }
    const correctas = c.reduce((total, ci) => total + ci, 0);

    // Puntaje del intento anterior, para mostrar la mejora
    const anterior = await get(
        'SELECT puntaje FROM intentos WHERE jugador_id = ? ORDER BY id DESC LIMIT 1', [jugadorId]
    );

    await run(
        'INSERT INTO intentos (jugador_id, preguntas, respuestas, correctas, puntaje) VALUES (?, ?, ?, ?, ?)',
        [jugadorId, JSON.stringify(preguntas), JSON.stringify(r), correctas, P]
    );
    await run('UPDATE jugadores SET mejor_puntaje = MAX(mejor_puntaje, ?) WHERE id = ?', [P, jugadorId]);

    const actualizado = await get('SELECT mejor_puntaje FROM jugadores WHERE id = ?', [jugadorId]);
    res.json({
        r, k, c, w, S, P, correctas,
        mejor_puntaje: actualizado.mejor_puntaje,
        mejora: anterior ? P - anterior.puntaje : null
    });
}));

// GET /jugadores/:id/intentos -> historial para comparar la mejora entre intentos
app.get('/jugadores/:id/intentos', ruta(async (req, res) => {
    await listo;
    const intentos = await all(
        'SELECT id, puntaje, correctas, creado FROM intentos WHERE jugador_id = ? ORDER BY id',
        [Number(req.params.id)]
    );
    res.json({ intentos });
}));

// GET /ranking?limite=10 -> mejores puntajes
app.get('/ranking', ruta(async (req, res) => {
    await listo;
    const limite = Math.min(Number(req.query.limite) || 10, 50);
    const ranking = await all(
        'SELECT nombre, mejor_puntaje FROM jugadores ORDER BY mejor_puntaje DESC, nombre ASC LIMIT ?',
        [limite]
    );
    res.json({ ranking });
}));

app.listen(PORT, () => {
    console.log(`SigmaMatriz en http://localhost:${PORT}`);
});
