# Documentación del Backend — Kanban Platform

> Especificación del backend necesario para reemplazar la capa mockeada descrita en [FRONTEND.md](./FRONTEND.md).

---

## 1. Stack propuesto

| Área | Tecnología | Razón |
|------|------------|-------|
| Runtime | Node.js 20+ | Mismo lenguaje que el frontend |
| Framework | NestJS | Modular, DI, validación, soporte WS |
| Lenguaje | TypeScript | Tipos compartidos con el front |
| ORM | Prisma | Migraciones y queries tipadas |
| DB | PostgreSQL | Relaciones, JSONB para preferencias |
| Cache / colas | Redis | Sesiones, rate-limit, pub/sub WS |
| Tiempo real | Socket.IO (Nest Gateway) | Drag&drop colaborativo, feed de actividad |
| Auth | JWT (access + refresh) + bcrypt | Sustituye el token mock |
| Storage | S3 / MinIO | Reemplaza adjuntos base64 |
| Validación | class-validator / Zod | DTOs |
| Docs API | OpenAPI (Swagger) | Contrato explícito |
| Testing | Vitest / Jest + Supertest | Unit + e2e |

Alternativa rápida: **Supabase** (Postgres + Auth + Realtime + Storage) si se prefiere entregar sin implementar auth/WS manualmente.

---

## 2. Modelo de datos (PostgreSQL)

```
User (id, email UNIQUE, name, password_hash,
      primary_provider, linked_providers JSONB,
      roles TEXT[], profile JSONB, preferences JSONB,
      created_at, last_login_at)

Board (id, name, background, owner_id → User,
       preferences JSONB, created_at)

BoardMember (board_id → Board, user_id → User,
             role ENUM('owner','admin','member'),
             permissions TEXT[],
             PRIMARY KEY(board_id, user_id))

Stage (id, board_id → Board, name,
       position NUMERIC,  -- orden (lexorank o float)
       created_at)

Card (id, stage_id → Stage, board_id → Board,
      title, description,
      position NUMERIC,
      start_date, due_date,
      created_at, updated_at)

CardLabel (card_id → Card, name, color)
CardMember (card_id → Card, user_id → User)
ChecklistItem (id, card_id → Card, text, done, position)

Comment (id, card_id → Card, author_id → User,
         body, created_at, updated_at)

Activity (id, board_id → Board, user_id → User,
          type, detail, meta JSONB, created_at)

RefreshToken (id, user_id → User, token_hash, expires_at, revoked_at)
Invitation (id, board_id, email, role, token, expires_at, accepted_at)
```

**Índices clave:** `Card(stage_id, position)`, `Stage(board_id, position)`, `Activity(board_id, created_at DESC)`, `BoardMember(user_id)`.

**Orden de tarjetas/etapas:** usar `position` tipo `DOUBLE PRECISION` o lexorank para insertar entre dos sin re-numerar.

---

## 3. API REST

Base URL: `/api/v1`. Autenticación: `Authorization: Bearer <JWT>`.

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/register` | Registro con email + password |
| POST | `/auth/login` | Devuelve access + refresh |
| POST | `/auth/refresh` | Rotación de refresh token |
| POST | `/auth/logout` | Revoca refresh token |
| GET  | `/auth/account` | Usuario autenticado |

### Users
| Método | Ruta |
|--------|------|
| GET | `/users/account` |
| PATCH | `/users/account` (perfil, preferencias) |
| PATCH | `/users/account/password` |
| GET | `/users?email=` (búsqueda para invitar) |

### Boards
| Método | Ruta |
|--------|------|
| GET | `/boards` (tableros del usuario) |
| POST | `/boards` |
| GET | `/boards/:id` (incluye stages + cards) |
| PATCH | `/boards/:id` |
| DELETE | `/boards/:id` |
| PATCH | `/boards/:id/preferences` |

### Members / Invitaciones
| Método | Ruta |
|--------|------|
| GET | `/boards/:id/members` |
| POST | `/boards/:id/invitations` (email, role) |
| POST | `/invitations/:token/accept` |
| PATCH | `/boards/:id/members/:userId` (rol, permisos) |
| DELETE | `/boards/:id/members/:userId` |

### Stages
| Método | Ruta |
|--------|------|
| POST | `/boards/:id/stages` |
| PATCH | `/stages/:id` (renombrar, reordenar → `position`) |
| DELETE | `/stages/:id` |

### Cards
| Método | Ruta |
|--------|------|
| POST | `/stages/:id/cards` |
| GET | `/cards/:id` |
| PATCH | `/cards/:id` (título, descripción, fechas, cover…) |
| PATCH | `/cards/:id/move` (`{stageId, position}`) |
| DELETE | `/cards/:id` |
| GET | `/boards/:id/cards/search?q=` |

### Sub-recursos de Card
| Método | Ruta |
|--------|------|
| POST/DELETE | `/cards/:id/labels` |
| POST/DELETE | `/cards/:id/members/:userId` |
| POST/PATCH/DELETE | `/cards/:id/checklist[/:itemId]` |
| GET/POST | `/cards/:id/comments` |
| PATCH/DELETE | `/comments/:id` |

### Actividad
| Método | Ruta |
|--------|------|
| GET | `/boards/:id/activity?limit=&before=` |

---

## 4. Tiempo real (WebSocket Gateway)

Namespace: `/ws`. El cliente se une a `board:<boardId>` tras validar permisos.

**Eventos servidor → cliente:**
- `board:updated`, `board:deleted`
- `stage:created | updated | deleted | reordered`
- `card:created | updated | moved | deleted`
- `card:member_added | member_removed`
- `checklist:changed`, `comment:created`
- `activity:new`
- `member:joined | left | role_changed`

**Eventos cliente → servidor:** `presence:ping`, `typing:card` (opcional).

El backend emite el evento tras cada mutación REST exitosa (patrón "REST + pub/sub").

---

## 5. Autorización

- Cada request a recursos de un tablero carga su `BoardMember` y aplica guard por `role` + `permissions[]` (los mismos 6 permisos del frontend).
- Operaciones destructivas (`delete board`, `remove owner`) restringidas al rol `owner`.
- Validación a nivel servicio, no solo controller, para evitar bypass vía relaciones.

---

## 6. Observabilidad y operación

- **Logs:** Pino estructurado (JSON).
- **Errores:** Sentry.
- **Métricas:** Prometheus (`/metrics`).
- **Healthcheck:** `/health` (DB, Redis, S3).
- **Rate limiting:** por IP y por usuario (Redis).
- **CORS:** allowlist del frontend.

---

## 8. Seguridad

- Passwords con bcrypt (cost ≥ 12).
- JWT access corto (15 min) + refresh rotatorio (7–30 d) en `httpOnly` cookie o almacenamiento seguro.
- Validación estricta de DTOs.
- Protección CSRF si se usan cookies.
- Sanitización de `description` y `comment.body` si se renderiza HTML.
- Auditoría: la tabla `Activity` actúa como log de cambios.

---

## 9. Migración desde el mock

1. Exponer endpoints de auth reales y sustituir `authStore`.
2. Añadir capa `services/api.ts` en el frontend (fetch + interceptor JWT).
3. Reemplazar lecturas/escrituras de `localStorage` por llamadas REST.
4. Conectar el `activityStore` al WebSocket (`activity:new`).
5. Sustituir adjuntos base64 por upload a S3.
6. Mantener `localStorage` solo para preferencias UI y caché offline opcional.

---

## 10. Roadmap sugerido

1. **MVP:** Auth + CRUD boards/stages/cards + miembros.
2. **v1.1:** Adjuntos en S3, comentarios, feed de actividad.
3. **v1.2:** WebSocket colaborativo.
4. **v1.3:** Invitaciones por email, búsqueda avanzada, notificaciones.
5. **v2:** OAuth (Google/GitHub), workspaces, automatizaciones.
