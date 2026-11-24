// backend/database.js
// Base de datos SigmaMatriz: banco de preguntas, jugadores e intentos (partidas).

const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(path.join(__dirname, 'sigmamatriz.db'));

// Pesos w de cada pregunta dentro de una partida de 5 preguntas (ver Tabla 2, pregunta 4)
const PESOS = [100, 100, 150, 150, 200];

// Banco de preguntas de la Unidad 4: sucesiones, sumatorias, vectores y matrices.
// correcta usa posición 1 a 4, igual que la fila Q[i][5] del documento.
const BANCO = [
    { enunciado: 'Calcula Σ (k = 1 hasta 4) k', alternativas: ['6', '10', '8', '12'], correcta: 2,
      explicacion: '1 + 2 + 3 + 4 = 10. La sumatoria suma los términos desde el límite inferior hasta el superior.' },
    { enunciado: 'Si A = [[1, 2], [3, 4]], ¿cuál es el elemento a₂₁?', alternativas: ['1', '2', '3', '4'], correcta: 3,
      explicacion: 'a₂₁ está en la fila 2 y la columna 1 de A, y ese valor es 3.' },
    { enunciado: 'En el plano se muestran los vectores A y B. Si R es el vector que resulta de la diferencia de B con A (B − A), ¿qué características tiene R?',
      alternativas: ['|R| = 1 u, dirigido al sur-este', '|R| = 7,07 u, dirigido al norte levemente al oeste', '|R| = 8 u, dirigido al sur-oeste', '|R| = 7,07 u, dirigido al sur levemente al este'], correcta: 4,
      explicacion: 'R = B − A = (−2 − (−3), −4 − 3) = (1, −7). |R| = √(1² + 7²) = √50 ≈ 7,07 u. Apunta hacia abajo (sur) con una pequeña componente hacia la derecha (este).',
      imagen: '/imagenes/vectores_a_b.svg', imagen_alt: 'Plano cartesiano con cuadrícula de −5 a 5. El vector A = (−3, 3) va desde el origen hacia el noroeste, en azul. El vector B = (−2, −4) va desde el origen hacia el suroeste, en bermellón.' },
    { enunciado: 'En la imagen, el vector u = (2, 1) (azul) y el vector v = (1, 3) (naranja) se suman. ¿Cuál es la magnitud del vector resultante u + v?',
      alternativas: ['3', '4', '5', '7'], correcta: 3,
      explicacion: 'u + v = (2 + 1, 1 + 3) = (3, 4). Su magnitud es √(3² + 4²) = √25 = 5.',
      imagen: '/imagenes/suma_vectores.svg', imagen_alt: 'Plano cartesiano con cuadrícula. El vector u = (2, 1) parte del origen en azul. El vector v = (1, 3) parte de la punta de u en naranja. El vector resultante va desde el origen hasta (3, 4) en verde.' },
    { enunciado: 'Cada barra del gráfico es un término de la sucesión aₙ. ¿Cuál es el valor de Σ (n = 1 hasta 5) aₙ?',
      alternativas: ['20', '25', '30', '36'], correcta: 3,
      explicacion: '2 + 4 + 6 + 8 + 10 = 30. Los términos siguen la fórmula aₙ = 2n.',
      imagen: '/imagenes/barras_sucesion.svg', imagen_alt: 'Gráfico de cinco barras azules con las alturas 2, 4, 6, 8 y 10, correspondientes a los términos a₁ hasta a₅.' },
    { enunciado: '¿Cuál es el elemento a₂₃ de la matriz mostrada?',
      alternativas: ['6', '7', '8', '11'], correcta: 2,
      explicacion: 'a₂₃ está en la fila 2 y la columna 3. Su valor es 7.',
      imagen: '/imagenes/matriz_3x4.svg', imagen_alt: 'Matriz de 3 filas y 4 columnas. Primera fila: 1, 2, 3, 4. Segunda fila: 5, 6, 7, 8. Tercera fila: 9, 10, 11, 12.' },
    { enunciado: 'Calcula Σ (k = 1 hasta 5) 2k', alternativas: ['20', '25', '30', '36'], correcta: 3,
      explicacion: '2 + 4 + 6 + 8 + 10 = 30.' },
    { enunciado: 'El producto punto de (1, 2) · (3, 4) es:', alternativas: ['10', '11', '14', '8'], correcta: 2,
      explicacion: '1·3 + 2·4 = 3 + 8 = 11. Se multiplican las componentes correspondientes y se suman.' },
    { enunciado: '¿Cuál es la dimensión de la matriz [[1, 2, 3], [4, 5, 6]]?', alternativas: ['2 × 2', '3 × 2', '2 × 3', '3 × 3'], correcta: 3,
      explicacion: '2 filas y 3 columnas: dimensión 2 × 3 (filas × columnas).' },
    { enunciado: 'Calcula la magnitud del vector v = (3, 4)', alternativas: ['5', '7', '12', '25'], correcta: 1,
      explicacion: '√(3² + 4²) = √25 = 5.' },
    { enunciado: 'Suma A = [[1, 2], [3, 4]] + B = [[2, 1], [0, 5]]. ¿Cuál es el elemento (2, 2) de A + B?', alternativas: ['7', '8', '9', '10'], correcta: 3,
      explicacion: '4 + 5 = 9. La suma de matrices se hace elemento a elemento.' },
    { enunciado: 'Encuentra el término a₅ de la sucesión aₙ = 3n + 1', alternativas: ['14', '15', '16', '18'], correcta: 3,
      explicacion: 'a₅ = 3(5) + 1 = 16.' },
    { enunciado: 'Calcula Σ (n = 1 hasta 4) n²', alternativas: ['30', '25', '20', '35'], correcta: 1,
      explicacion: '1 + 4 + 9 + 16 = 30.' },
    { enunciado: 'Calcula Σ (k = 1 hasta 3) (k + 1)', alternativas: ['6', '9', '12', '8'], correcta: 2,
      explicacion: '(1 + 1) + (2 + 1) + (3 + 1) = 2 + 3 + 4 = 9.' }
];

// Pistas por pregunta, en el mismo orden que BANCO. Una pista orienta el procedimiento
// sin revelar la alternativa correcta y no resta puntaje.
const PISTAS = [
    'Reemplaza k por 1, 2, 3 y 4, y suma esos cuatro números.',
    'El primer subíndice indica la fila y el segundo la columna. Busca la fila 2 y luego la columna 1.',
    'R = B − A se calcula restando componente a componente. Luego usa √(x² + y²) para el largo.',
    'Suma las componentes de u y v por separado. Después calcula el largo del vector resultante.',
    'Primero calcula cada término con aₙ = 2n y luego súmalos.',
    'Busca la fila 2 y cuenta tres columnas desde la izquierda.',
    'Calcula 2k para k = 1 hasta 5 y suma los cinco resultados.',
    'Multiplica la primera componente con la primera, la segunda con la segunda, y suma ambos productos.',
    'Cuenta primero las filas (horizontales) y luego las columnas (verticales). Se escribe filas × columnas.',
    'Usa √(x² + y²) con x = 3 e y = 4.',
    'Suma solo los elementos de la fila 2, columna 2 de cada matriz.',
    'Reemplaza n por 5 en la fórmula 3n + 1.',
    'Eleva cada n al cuadrado (1², 2², 3², 4²) y suma los resultados.',
    'Para cada k de 1 a 3, calcula k + 1 y suma esos tres valores.'
];

// Helpers con promesas para usar async/await
function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
    });
}

function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
    });
}

async function init() {
    await run(`CREATE TABLE IF NOT EXISTS preguntas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        enunciado TEXT NOT NULL,
        alternativas TEXT NOT NULL,
        correcta INTEGER NOT NULL,
        explicacion TEXT NOT NULL,
        imagen TEXT,
        imagen_alt TEXT,
        pista TEXT
    )`);

    // Migración: bases creadas antes de agregar imágenes o pistas
    const columnas = await all('PRAGMA table_info(preguntas)');
    if (!columnas.some((c) => c.name === 'imagen')) {
        await run('ALTER TABLE preguntas ADD COLUMN imagen TEXT');
        await run('ALTER TABLE preguntas ADD COLUMN imagen_alt TEXT');
    }
    if (!columnas.some((c) => c.name === 'pista')) {
        await run('ALTER TABLE preguntas ADD COLUMN pista TEXT');
    }

    await run(`CREATE TABLE IF NOT EXISTS jugadores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL UNIQUE,
        mejor_puntaje INTEGER NOT NULL DEFAULT 0,
        creado TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    await run(`CREATE TABLE IF NOT EXISTS intentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        jugador_id INTEGER NOT NULL REFERENCES jugadores(id),
        preguntas TEXT NOT NULL,
        respuestas TEXT NOT NULL,
        correctas INTEGER NOT NULL,
        puntaje INTEGER NOT NULL,
        creado TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    // Inserta solo las preguntas que aún no existen (así también agrega las nuevas en bases ya creadas)
    let nuevas = 0;
    for (const p of BANCO) {
        const existe = await get('SELECT id FROM preguntas WHERE enunciado = ?', [p.enunciado]);
        if (!existe) {
            await run(
                'INSERT INTO preguntas (enunciado, alternativas, correcta, explicacion, imagen, imagen_alt) VALUES (?, ?, ?, ?, ?, ?)',
                [p.enunciado, JSON.stringify(p.alternativas), p.correcta, p.explicacion, p.imagen || null, p.imagen_alt || null]
            );
            nuevas++;
        }
    }
    if (nuevas > 0) {
        console.log(`Preguntas agregadas al banco: ${nuevas}.`);
    }

    // Completa la pista de las preguntas que aún no la tienen (también en bases ya creadas)
    for (let i = 0; i < BANCO.length; i++) {
        await run('UPDATE preguntas SET pista = ? WHERE enunciado = ? AND pista IS NULL',
            [PISTAS[i], BANCO[i].enunciado]);
    }
}

const listo = init();

module.exports = { db, run, get, all, listo, PESOS };
