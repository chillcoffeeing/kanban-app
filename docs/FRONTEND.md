# Frontend Architecture — Kanban Platform

## Stack Tecnológico

| Área | Tecnología |
|------|------------|
| Framework | React 19 (`^19.2.4`) |
| Lenguaje | TypeScript 6 (`^6.0.2`) |
| Bundler | Vite 8 (`^8.0.4`) |
| Routing | React Router v7 (`^7.0.0`) |
| Estado global | Zustand 5 (`^5.0.12`) + Immer (`^11.1.8`) |
| Drag & Drop | dnd-kit (core `^6.3.1`, sortable `^10.0.0`, utilities `^3.2.2`) |
| Estilos | Tailwind CSS 4 (`^4.2.2`) |
| Iconos | Phosphor Icons React (`@phosphor-icons/react ^2.1.10`) |
| Tiempo real | Socket.IO Client (`^4.8.3`) |
| Animaciones | GSAP (`^3.15.0`) |
| Fechas | date-fns (`^4.1.0`) |
| Linting | ESLint 9 flat config (`^9.39.4`) |

## Estructura del Proyecto

```
src/
├── main.tsx                              # Entry point: BrowserRouter + StrictMode
├── App.tsx                               # Root: auth guard, routing, socket, settings
├── index.css                             # Tailwind imports + global styles
├── pages/                                # Route-level components
│   ├── AuthPage.tsx                      # /login
│   ├── RegisterPage.tsx                  # /register
│   ├── LandingPage.tsx                   # /
│   ├── PublicLayout.tsx                  # Layout para páginas públicas
│   ├── BoardsPage.tsx                    # /boards
│   ├── BoardRoute.tsx                    # /boards/:boardId param extraction
│   ├── BoardView.tsx                     # Tablero kanban (stages, cards, DnD, modals)
│   ├── BoardConfigPage.tsx               # /boards/:boardId/config/*
│   ├── UserConfigPage.tsx                # /config/*
│   ├── InvitationsPage.tsx               # /invitations
│   └── config/                           # Config layouts & tabs
│       ├── BoardConfigLayout.tsx
│       ├── BoardGeneralPage.tsx
│       ├── BoardMembersPage.tsx
│       ├── BoardPreferencesPage.tsx
│       ├── UserConfigLayout.tsx
│       ├── UserProfilePage.tsx
│       ├── UserAppearancePage.tsx
│       ├── UserNotificationsPage.tsx
│       └── UserPrivacyPage.tsx
├── features/                             # Feature-scoped modules
│   ├── activity/
│   │   └── activityIntegration.ts        # Integración de logging de actividad
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   └── utils/
│   │       └── constants.ts
│   ├── boards/
│   │   ├── components/
│   │   │   ├── ActivityFeed.tsx          # Feed de actividad en tablero
│   │   │   ├── BoardCard.tsx             # Card en lista de tableros
│   │   │   ├── BoardHeader.tsx           # Header del tablero
│   │   │   ├── BoardLoading.tsx          # Skeleton loading
│   │   │   ├── BoardSettingsModal.tsx    # Modal de configuración
│   │   │   ├── CreateBoardModal.tsx      # Crear tablero
│   │   │   ├── GeneralTab.tsx            # Pestaña general de settings
│   │   │   ├── MemberCard.tsx            # Card de miembro
│   │   │   ├── MembersTab.tsx            # Pestaña de miembros
│   │   │   ├── PendingInvitationCard.tsx # Invitación pendiente
│   │   │   ├── PreferencesTab.tsx        # Pestaña de preferencias
│   │   │   ├── PrefRow.tsx               # Fila de preferencia
│   │   │   └── Select.tsx               # Select personalizado
│   │   ├── hooks/
│   │   │   ├── useBoardDrag.ts           # Lógica de drag & drop
│   │   │   ├── useCardNavigation.ts      # Navegación por teclado
│   │   │   └── useHorizontalScroll.ts    # Scroll horizontal
│   │   └── utils/
│   │       ├── activityConfig.ts         # Config de eventos de actividad
│   │       └── boardPreferences.ts       # Lógica de preferencias
│   ├── cards/
│   │   └── components/
│   │       ├── CardDetailModal.tsx       # Editor completo de card
│   │       ├── CardItem.tsx              # Card sortable en columna
│   │       ├── CardPreview.tsx           # Drag overlay
│   │       ├── CardSearch.tsx            # Búsqueda global
│   │       └── LabelEditor.tsx           # Editor de etiquetas
│   └── stages/
│       └── components/
│           ├── StageColumn.tsx           # Columna droppable
│           └── AddStageColumn.tsx        # Botón para agregar columna
├── shared/
│   ├── components/                       # UI reutilizable
│   │   ├── AnimatedBg.tsx                # Fondo animado
│   │   ├── Button.tsx
│   │   ├── DropdownMenu.tsx
│   │   ├── ErrorBoundary.tsx             # React error boundary
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── Input.tsx
│   │   ├── MemberAvatar.tsx
│   │   ├── MemberProfileModal.tsx
│   │   ├── Modal.tsx
│   │   ├── PermissionDeniedModal.tsx
│   │   ├── PublicHeader.tsx
│   │   ├── Toast.tsx
│   │   ├── ToastContainer.tsx
│   │   └── Toggle.tsx
│   ├── hooks/
│   │   ├── useActivity.ts                # Integración de actividad
│   │   ├── useApplySettings.ts           # Tema/densidad al DOM
│   │   ├── useFormatDate.ts
│   │   ├── useGsapAnimation.ts           # Animaciones GSAP
│   │   ├── usePermissionDenied.ts        # Modal de permiso denegado
│   │   ├── usePersistSettings.ts         # localStorage persistence
│   │   └── useSocket.ts                  # WebSocket events
│   ├── types/
│   │   ├── index.ts                      # Re-exports
│   │   ├── api.ts                        # Backend DTOs
│   │   └── domain.ts                     # Domain models
│   └── utils/
│       ├── constants.ts                  # Backgrounds, colors, permissions
│       ├── errorHandler.ts               # Manejo de errores global
│       ├── eventBus.ts                   # Event bus/pub-sub
│       └── helpers.ts                    # Date, classNames, generateId
├── services/                             # API client layer
│   ├── api.ts                            # Fetch wrapper (token, refresh, error handling)
│   ├── activity.ts                       # Activity endpoints
│   ├── auth.ts                           # Auth endpoints
│   ├── boards.ts                         # Boards, stages, members
│   ├── cards.ts                          # Cards, checklist, labels
│   ├── socket.ts                         # Socket.IO singleton
│   └── users.ts                          # Profile & preferences
├── stores/                               # Zustand stores
│   ├── index.ts                          # Barrel exports
│   ├── authStore/
│   │   ├── index.ts                      # Store (devtools + subscribeWithSelector)
│   │   ├── types.d.ts
│   │   ├── authActions.ts                # login, register, hydrate, logout
│   │   └── userActions.ts                # updateProfile, updatePreferences
│   ├── boardStore/
│   │   ├── index.ts                      # Store (devtools + immer)
│   │   ├── types.d.ts
│   │   ├── boardActions.ts
│   │   ├── stageActions.ts
│   │   ├── cardActions.ts
│   │   ├── cardMemberActions.ts
│   │   ├── cardChecklistActions.ts
│   │   ├── cardLabelActions.ts
│   │   ├── memberActions.ts
│   │   ├── realtimeActions.ts
│   │   └── helpers/
│   │       ├── normalizers.ts            # Backend -> frontend transform
│   │       └── boardHelpers.ts           # Inmutabilidad optimista
│   ├── settingsStore/
│   │   ├── index.ts
│   │   └── constants.ts
│   ├── activityStore/
│   │   ├── index.ts                      # Store (local-only, localStorage)
│   │   ├── types.d.ts
│   │   ├── constants.ts
│   │   ├── activityActions.ts
│   │   └── utils.ts
│   └── toastStore/
│       ├── index.ts                      # Store de notificaciones toast
│       └── types.d.ts
├── components/
│   └── membersPage/
│       ├── MembersItem.tsx
│       └── MembersList.tsx
```

## Routing

| Path | Component | Auth | Descripción |
|------|-----------|------|-------------|
| `/` | `LandingPage` | No | Landing pública |
| `/login` | `AuthPage` | No | Login |
| `/register` | `RegisterPage` | No | Registro |
| `/boards` | `BoardsPage` | Sí | Lista de tableros |
| `/boards/:boardId` | `BoardRoute` -> `BoardView` | Sí | Vista kanban |
| `/boards/:boardId/config/*` | `BoardConfigPage` | Sí (owner) | Config del tablero |
| `/config/*` | `UserConfigPage` | Sí | Config del usuario |
| `/invitations` | `InvitationsPage` | Sí | Invitaciones pendientes |

## State Management (Zustand)

5 stores independientes:

| Store | Middleware | Persistencia | Propósito |
|-------|-----------|-------------|-----------|
| `authStore` | devtools + subscribeWithSelector | localStorage (token, user) | Autenticación |
| `boardStore` | devtools + immer | No persiste (API fetch) | CRUD boards, stages, cards, labels, members |
| `settingsStore` | devtools | localStorage (apariencia) | Tema, densidad, idioma |
| `activityStore` | devtools | localStorage por boardId | Feed de actividad local |
| `toastStore` | — | No persiste | Notificaciones toast |

### Patrones de mutación (boardStore)

| Patrón | Descripción | Uso |
|--------|------------|-----|
| **API -> Store + log** | Call API -> update store + log activity | Create/delete board, stage, card, label |
| **Store -> API (error silencioso)** | Update inmediato, try API silently | Update board, stage, member permissions |
| **Optimistic -> API -> Rollback** | Snapshot, update UI, call API, rollback on fail | Move card, members, checklist, labels |
| **API -> Store (profile/prefs)** | Call API -> on success update store | Profile, preferences |

## Data Flow

```
User Action (click, drag, type)
  -> Component (BoardView, StageColumn, CardDetailModal)
    -> Store Action (boardStore.addCard)
      -> API call (services/boards.ts)
        -> fetch() via services/api.ts (Bearer token)
          -> NestJS Backend
            -> Controller -> Service -> Repository -> PostgreSQL
            -> WebSocket emission (RealtimeService)
      <- Response
      -> Zustand state update (immer)
      -> Activity log (activityStore)
  -> React re-render
```

### Tiempo real (Socket.IO)

```
Backend mutación -> RealtimeService.emitToBoard(boardId, event, payload)
  -> Socket.IO room "board:{boardId}"
    -> Frontend socket.on(event, handler) [useSocket.ts]
      -> boardStore.realtime* actions (realtimeUpdateCard, realtimeAddStage)
        -> Zustand state update -> React re-render
```

## Flujo de autenticación

1. `authStore.hydrate()` en `App.tsx` -> lee token de `localStorage`
2. `services/api.ts` adjunta `Authorization: Bearer <token>` en cada request
3. Si 401, se intenta refresh automático vía `POST /auth/refresh` (con cola de requests pendientes)
4. Si refresh falla, `clearTokens()` -> redirección a `/login?expired=true`
5. Socket.IO conecta con token en `auth.token` del handshake

## Estilos y tema

- Tailwind CSS 4 con configuración vía Vite plugin
- Temas aplicados como `data-*` attributes en `<html>` (ej. `data-theme="dark"`)
- `useApplySettings` hook sincroniza el store de settings con el DOM
- `usePersistSettings` persiste en `localStorage` bajo `kanban-appearance`
- Soporte multi-idioma: español (default) e inglés
- Densidad compacta/normal y modo de movimiento reducido

## Tipos compartidos

- `shared/types/api.ts` — DTOs de respuesta del backend (UserResponse, CardResponse, etc.)
- `shared/types/domain.ts` — Modelos de dominio normalizados (Board, Card, Stage, Activity)
- Existe una capa de normalización en `stores/boardStore/helpers/normalizers.ts` que transforma las respuestas planas del backend al modelo anidado del frontend
