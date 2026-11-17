# SigmaMatriz

Trivia web de matrices, vectores y sumatorias (Unidad 4). Cada partida tiene 5 preguntas con pesos w = (100, 100, 150, 150, 200).
El puntaje se calcula en el servidor como P = c · w = Σ cᵢ·wᵢ, donde cᵢ = 1 si la respuesta es correcta y 0 si no.

## Cómo ejecutarlo

1. Entra a la carpeta `backend` y ejecuta `npm install` (solo la primera vez).
2. Ejecuta `npm start`.
3. Abre http://localhost:4000 en el navegador.

## API REST

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/jugadores` | Registra un jugador (`{"nombre": "..."}`). Si ya existe, devuelve su perfil. |
| GET | `/preguntas` | Banco de preguntas y pesos. |
| PUT | `/jugadores/:id/puntaje` | Cierra la partida con `{"preguntas": [ids], "respuestas": [r1..r5]}`. Devuelve r, k, c, w, S, P y la mejora. |
| GET | `/jugadores/:id/intentos` | Historial de intentos del jugador. |
| GET | `/ranking?limite=10` | Mejores puntajes. |

La base de datos es `backend/sigmamatriz.db` (SQLite) y se crea sola al primer arranque.

## Publicar en Render (para usarla desde el celular)

1. Sube la carpeta `sigmamatriz` a un repositorio de GitHub. No subas `node_modules`.
2. En Render, crea un **Web Service** desde ese repositorio.
3. Configura:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Render te entrega una URL pública (por ejemplo `https://sigmamatriz.onrender.com`). Ábrela en el celular.

Advertencia: en el plan gratuito, el disco se borra cada vez que el servicio se reinicia o se vuelve a publicar, así que los jugadores y los puntajes pueden perderse. Para guardarlos de forma permanente hace falta un disco persistente (plan pago) o una base de datos externa.
