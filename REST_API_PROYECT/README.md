# API de Jugadores y Rosters (eSports)

API REST para gestionar jugadores de eSports y armar rosters (equipos). Permite registrar jugadores, crear rosters, asignar jugadores a rosters como Titulares o Suplentes y consultar todo ello, aplicando las reglas de negocio del proyecto.

## Tabla de contenido

1. [Tecnologías](#tecnologías)
2. [Requisitos previos](#requisitos-previos)
3. [Instalación](#instalación)
4. [Configuración](#configuración)
5. [Base de datos y migraciones](#base-de-datos-y-migraciones)
6. [Ejecución](#ejecución)
7. [Documentación interactiva (OpenAPI / Swagger)](#documentación-interactiva-openapi--swagger)
8. [Endpoints](#endpoints)
9. [Reglas de negocio](#reglas-de-negocio)
10. [Códigos de estado HTTP](#códigos-de-estado-http)
11. [Ejemplos de uso](#ejemplos-de-uso)
12. [Estructura del proyecto](#estructura-del-proyecto)
13. [Alcance y limitaciones](#alcance-y-limitaciones)

## Tecnologías

| Capa | Tecnología |
|---|---|
| Backend | Node.js + Express |
| ORM y migraciones | Sequelize 6 + sequelize-cli |
| Base de datos | MySQL |
| Documentación | OpenAPI 3.0 + Swagger UI |
| Control de versiones | Git |

## Requisitos previos

- [Node.js](https://nodejs.org/) 18 o superior
- [MySQL](https://www.mysql.com/) en ejecución
- [Git](https://git-scm.com/)

## Instalación

```bash
git clone https://github.com/MissingNam/eSports-API-Homework
cd REST_API_PROYECT
npm install
```

## Configuración

1. Crea una base de datos vacía en MySQL:

```sql
CREATE DATABASE eSportDB;
```

2. Crea un archivo `.env` en la raíz del proyecto con tus datos (este archivo no se sube al repositorio):

```
DB_NAME=eSportDB
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_HOST=127.0.0.1
DB_PORT=3306
PORT=3000
```

| Variable | Descripción |
|---|---|
| `DB_NAME` | Nombre de la base de datos |
| `DB_USER` | Usuario de MySQL |
| `DB_PASSWORD` | Contraseña de MySQL |
| `DB_HOST` | Servidor de MySQL |
| `DB_PORT` | Puerto de MySQL |
| `PORT` | Puerto en el que escuchará la API (opcional, por defecto 3000) |

## Base de datos y migraciones

Las tablas se crean con migraciones de Sequelize. Con la base de datos creada y el `.env` configurado, ejecuta:

```bash
npx sequelize-cli db:migrate
```

Esto crea las tablas `jugadores`, `rosters` y `roster_jugadores` (la tabla intermedia de la relación muchos a muchos).

Comandos útiles:

```bash
npx sequelize-cli db:migrate:status      # Ver qué migraciones están aplicadas
npx sequelize-cli db:migrate:undo        # Deshacer la última migración
npx sequelize-cli db:migrate:undo:all    # Deshacer todas (reinicia la estructura)
```

### Modelo de datos

```
Jugador                      Roster                      Roster_Jugador
├── id (PK)                  ├── id (PK)                 ├── id (PK)
├── nickname (único)         ├── nombre                  ├── id_roster (FK)
├── nombre_real              ├── juego                   ├── id_jugador (FK)
├── pais                     ├── tipo                    └── rol_en_roster
├── rol                      └── temporada                   (Titular/Suplente)
└── estado
```

## Ejecución

```bash
node src/app.js
```

La API quedará disponible en `http://localhost:3000/api/v1`. Para verificar que funciona:

```
GET http://localhost:3000/api/v1/health
```

Respuesta esperada: `{"status":"ok","database":"connected"}`

Nota: el servidor no se recarga solo; si cambias el código o `docs/openapi.yaml`, detenlo (`Ctrl+C`) y vuelve a iniciarlo.

## Documentación interactiva (OpenAPI / Swagger)

La especificación OpenAPI 3.0 está en [`docs/openapi.yaml`](docs/openapi.yaml) y se muestra con Swagger UI en:

```
http://localhost:3000/api-docs
```

Desde esa página se puede ver cada endpoint con sus parámetros y respuestas, y probarlos con el botón **Try it out**.

## Endpoints

Base URL: `/api/v1` | Formato: JSON

### Jugadores

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/jugadores` | Listar jugadores. Filtros opcionales: `?rol=Mid&estado=activo&search=fak` |
| GET | `/jugadores/{id}` | Detalle de un jugador |
| POST | `/jugadores` | Crear un jugador |
| PUT | `/jugadores/{id}` | Actualizar un jugador |
| DELETE | `/jugadores/{id}` | Eliminar un jugador |

### Rosters

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/rosters` | Listar rosters con cantidad de jugadores. Filtros opcionales: `?tipo=Principal&temporada=2026` |
| GET | `/rosters/{id}` | Detalle de un roster con sus jugadores |
| POST | `/rosters` | Crear un roster |
| PUT | `/rosters/{id}` | Actualizar un roster |
| DELETE | `/rosters/{id}` | Eliminar un roster (los jugadores no se eliminan) |

### Asignación de jugadores a rosters

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/rosters/{id}/jugadores` | Listar los jugadores de un roster |
| POST | `/rosters/{id}/jugadores` | Asignar un jugador (`id_jugador`, `rol_en_roster`) |
| PUT | `/rosters/{id}/jugadores/{id_jugador}` | Cambiar el rol dentro del roster (Titular/Suplente) |
| DELETE | `/rosters/{id}/jugadores/{id_jugador}` | Quitar un jugador del roster |

### Auxiliares

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/roles` | Roles válidos: Top, Jungle, Mid, ADC, Support |
| GET | `/estados` | Estados válidos: activo, inactivo |
| GET | `/tipos-roster` | Tipos de roster: Principal, Academy |
| GET | `/health` | Verifica que el API y la base de datos están activos |

Total: 14 endpoints principales y 4 auxiliares.

## Reglas de negocio

- **RN-01:** el nickname de un jugador es único.
- **RN-02:** un roster puede tener como máximo 5 titulares.
- **RN-03:** no puede haber dos titulares con el mismo rol de juego en un roster.
- **RN-04:** un jugador puede estar en varios rosters.
- **RN-05:** al eliminar un roster, los jugadores permanecen en el sistema.

Adicionalmente, un jugador no puede asignarse dos veces al mismo roster. Como suplente no aplica la restricción de rol.

## Códigos de estado HTTP

| Código | Uso |
|---|---|
| 200 | OK (GET, PUT exitoso) |
| 201 | Creado (POST exitoso) |
| 204 | Sin contenido (DELETE exitoso) |
| 400 | Datos inválidos (campo obligatorio vacío, rol o tipo inválido, id no numérico, JSON mal formado) |
| 404 | Recurso no encontrado (jugador, roster o asignación) |
| 409 | Conflicto (nickname duplicado, jugador ya asignado, titular repetido por rol, sexto titular) |
| 500 | Error interno del servidor |

Los errores se devuelven con este formato:

```json
{ "error": "Jugador no encontrado" }
```

## Ejemplos de uso

Crear un jugador:

```bash
curl -X POST http://localhost:3000/api/v1/jugadores \
  -H "Content-Type: application/json" \
  -d '{"nickname":"Faker","nombre_real":"Lee Sang-hyeok","pais":"Corea del Sur","rol":"Mid","estado":"activo"}'
```

Crear un roster:

```bash
curl -X POST http://localhost:3000/api/v1/rosters \
  -H "Content-Type: application/json" \
  -d '{"nombre":"TL Principal","tipo":"Principal","temporada":"2026"}'
```

Asignar un jugador a un roster como titular:

```bash
curl -X POST http://localhost:3000/api/v1/rosters/1/jugadores \
  -H "Content-Type: application/json" \
  -d '{"id_jugador":1,"rol_en_roster":"Titular"}'
```

Ver el roster con sus jugadores:

```bash
curl http://localhost:3000/api/v1/rosters/1
```

Respuesta:

```json
{
  "id": 1,
  "nombre": "TL Principal",
  "juego": "League of Legends",
  "tipo": "Principal",
  "temporada": "2026",
  "jugadores": [
    { "id": 1, "nickname": "Faker", "rol": "Mid", "rol_en_roster": "Titular" }
  ]
}
```

Buscar jugadores activos con rol Mid cuyo nickname contenga "fak":

```bash
curl "http://localhost:3000/api/v1/jugadores?rol=Mid&estado=activo&search=fak"
```

## Estructura del proyecto

```
├── config/
│   └── config.js              # Configuración de la conexión (lee el .env)
├── docs/
│   └── openapi.yaml           # Especificación OpenAPI 3.0
├── migrations/                # Migraciones de Sequelize (estructura de la BD)
├── models/                    # Modelos de Sequelize y sus relaciones
│   ├── index.js
│   ├── jugador.js
│   ├── roster.js
│   └── rosterjugador.js
├── src/
│   ├── routes/                # Qué función atiende cada método y URL
│   ├── controllers/           # Manejo de HTTP (request / response)
│   ├── services/              # Lógica de negocio y acceso a la base de datos
│   ├── middlewares/
│   │   └── errorHandler.js    # Convierte errores en respuestas HTTP
│   ├── utils/                 # Errores propios, constantes, asyncHandler
│   └── app.js                 # Punto de entrada
├── .sequelizerc               # Ubicación de la configuración para sequelize-cli
└── README.md
```

La arquitectura separa responsabilidades por capas: la **ruta** decide qué función atiende la petición, el **controlador** habla HTTP y el **servicio** contiene la lógica y consulta la base de datos.

## Alcance y limitaciones

- Incluye: gestión de jugadores, rosters y asignaciones.
- No incluye: calendario, scrims, estadísticas, finanzas, notificaciones ni integraciones.
- No implementa autenticación. El documento de requerimientos menciona los roles Admin y Público, pero no define endpoints ni mecanismos de autenticación, por lo que todos los endpoints son de acceso abierto.