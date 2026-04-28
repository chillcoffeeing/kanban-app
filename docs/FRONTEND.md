# Documentación del Frontend — Kanban Platform

> Alcance actual de la aplicación. Todos los datos están **mockeados** en el cliente mediante Zustand + `localStorage`. No existe aún integración con backend real.

---

## 1. Stack tecnológico

| Área | Tecnología |
|------|------------|
| Framework | React 19.2 + TypeScript |
| Bundler | Vite 8 |
| Estilos | TailwindCSS 4 |
| Estado global | Zustand 5 |
| Drag & Drop | dnd-kit (`core`, `sortable`, `utilities`) |
| Iconos | Phosphor Icons |
| Routing | Navegación SPA interna (sin router externo) |
| Persistencia | `localStorage` |

---

## 2. Estructura del proyecto

```
src/
├── stores/        # Zustand: auth, board, activity, settings
├── pages/         # AuthPage, BoardsPage, BoardView
├── features/
│   ├── auth/      # Login / Register mock
│   ├── boards/    # Tableros, miembros, preferencias
│   ├── cards/     # Detalle de tarjeta, búsqueda, adjuntos, etiquetas
│   ├── stages/    # Columnas (etapas)
│   └── members/   # Gestión de miembros
├── shared/
│   ├── components/  # UI reusable (modales, botones, inputs)
│   ├── hooks/       # useActivity, useApplySettings, useFormatDate
│   ├── types/       # domain.ts, user.ts
│   └── utils/       # helpers, constants
```

---

## 3. Modelo de dominio (tipos TypeScript)

### Board
```ts
{
  id, name, background, ownerId,
  members: BoardMember[],
  stages: Stage[],
  preferences: BoardPreferences,
  createdAt
}
```

### Stage (columna)
```ts
{ id, name, cards: Card[], createdAt }
```

### Card
```ts
{
  id, title, description,
  labels: Label[],            // {name, value(hex)}
  checklist: ChecklistItem[], // {id, text, done}
  members: string[],          // userIds
  startDate, dueDate,
  createdAt
}
```

### User
```ts
{
  id, email, name,
  primaryProvider, linkedProviders[],
  roles[], profile, preferences,
  createdAt, lastLoginAt
}
```

### BoardMember
```ts
{
  userId, email,
  role: 'owner' | 'admin' | 'member',
  permissions: Permission[]
}
```

Permisos disponibles: `create_stage`, `create_card`, `modify_card`, `delete_card`, `invite_member`, `modify_board`.

### BoardPreferences
`visibility`, `commentPermission`, `memberPermission`, `workspaceEdit`, `showCompletedOnCard`, `coversEnabled`.

### ActivityEntry
```ts
{ id, type, user, detail, meta, timestamp }
```
16 tipos: `board_created`, `stage_created/renamed/deleted`, `card_created/moved/updated/deleted`, `member_invited/removed`, `label_added`, `checklist_*`, etc.

---

## 4. Funcionalidades implementadas

### Autenticación (mock)
- Registro e inicio de sesión contra `localStorage`.
- Token simulado (`token_<userId>`).
- Preferencias de usuario: tema, idioma, notificaciones, privacidad.

### Tableros
- Crear / renombrar / eliminar.
- Backgrounds (gradientes predefinidos).
- Invitación de miembros por email.
- Gestión granular de permisos por miembro.
- Preferencias de visibilidad y colaboración.

### Etapas (columnas)
- CRUD completo.
- Reordenamiento drag & drop.

### Tarjetas
- CRUD completo.
- Drag & drop dentro de una etapa y entre etapas.
- Descripción, etiquetas (8 colores), checklist con progreso.
- Fechas de inicio y vencimiento.
- Adjuntos subidos como `dataUrl` (base64 local).
- Portada seleccionable desde adjuntos.
- Asignación/desasignación de miembros (join/leave).

### Búsqueda
- Búsqueda global de tarjetas por título, descripción, etiquetas, miembros y checklist.
- Dropdown de resultados en vivo.

### Actividad
- Feed por tablero persistido en `localStorage` (clave `canvan_activity_<boardId>`).
- Límite de 200 entradas; timestamps relativos.

---

## 5. Persistencia actual (localStorage)

| Clave | Contenido |
|-------|-----------|
| `canvan_users` | Lista de usuarios registrados |
| `canvan_user` | Usuario autenticado actual |
| `canvan_token` | Token mock |
| `canvan_boards` | Tableros del usuario |
| `canvan_activity_<boardId>` | Feed de actividad por tablero |

---

## 6. Rutas / vistas

| Ruta lógica | Vista |
|-------------|-------|
| `/` | AuthPage (login / registro) |
| `/boards` | BoardsPage (galería de tableros) |
| `/board/:id` | BoardView (tablero kanban) |
| modal | SettingsPanel |

---

## 7. Limitaciones del mock

- No hay colaboración en tiempo real.
- Los adjuntos viven en `localStorage` como base64 (riesgo de cuota).
- No hay validación de servidor ni control real de permisos.
- Los datos no son portables entre dispositivos.
- No hay recuperación de contraseña ni verificación de email.

Estas limitaciones motivan la especificación del backend descrita en [BACKEND.md](./BACKEND.md).
