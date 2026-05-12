# Frontend Architecture — Kanban Platform

## Stack Tecnológico

| Área | Tecnología |
|------|------------|
| Framework | React 19 + TypeScript 6 |
| Bundler | Vite 8 |
| Routing | React Router v7 |
| Estado global | Zustand 5 + Immer |
| Drag & Drop | dnd-kit (core, sortable, utilities) |
| Estilos | Tailwind CSS 4 |
| Iconos | Phosphor Icons React |
| Tiempo real | Socket.IO Client |
| Linting | ESLint 9 flat config |

## Estructura del Proyecto

```
src/
├── main.tsx                          # Entry point: BrowserRouter + StrictMode
├── App.tsx                           # Root: auth guard, routing, socket, settings
├── index.css                         # Tailwind imports + global styles
├── pages/                            # Route-level components
│   ├── AuthPage.tsx                  # /login
│   ├── BoardsPage.tsx                # /boards
│   ├── BoardRoute.tsx                # /boards/:boardId param extraction
│   ├── BoardView.tsx                 # Tablero kanban (stages, cards, DnD, modals)
│   ├── BoardConfigPage.tsx           # /boards/:boardId/config/*
│   ├── UserConfigPage.tsx            # /config/*
│   ├── InvitationsPage.tsx           # /invitations
│   └── config/                       # Config layouts & tabs
│       ├── BoardConfigLayout.tsx
│       ├── BoardGeneralPage.tsx
│       ├── BoardMembersPage.tsx
│       ├── BoardPreferencesPage.tsx
│       ├── UserConfigLayout.tsx
│       ├── UserProfilePage.tsx
│       ├── UserAppearancePage.tsx
│       ├── UserNotificationsPage.tsx
│       └── UserPrivacyPage.tsx
├── features/                         # Feature-scoped modules
│   ├── auth/components/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── boards/components/
│   │   ├── BoardHeader.tsx
│   │   ├── BoardCard.tsx
│   │   ├── CreateBoardModal.tsx
│   │   ├── BoardSettingsModal.tsx
│   │   └── ActivityFeed.tsx
│   ├── boards/utils/
│   │   └── boardPreferences.ts
│   ├── cards/components/
│   │   ├── CardItem.tsx              # Sortable card
│   │   ├── CardPreview.tsx           # Drag overlay
│   │   ├── CardDetailModal.tsx       # Editor completo
│   │   ├── CardSearch.tsx            # Búsqueda global
│   │   └── LabelEditor.tsx
│   └── stages/components/
│       └── StageColumn.tsx           # Droppable column
├── shared/
│   ├── components/                   # UI reutilizable
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Toggle.tsx
│   │   ├── DropdownMenu.tsx
│   │   ├── MemberAvatar.tsx
│   │   └── MemberProfileModal.tsx
│   ├── hooks/
│   │   ├── useSocket.ts              # WebSocket events
│   │   ├── useActivity.ts            # Activity logging
│   │   ├── useFormatDate.ts
│   │   ├── useApplySettings.ts       # Theme/density al DOM
│   │   └── usePersistSettings.ts     # localStorage persistence
│   ├── types/
│   │   ├── index.ts                  # Re-exports
│   │   ├── api.ts                    # Backend DTOs
│   │   └── domain.ts                 # Domain models
│   └── utils/
│       ├── constants.ts              # Backgrounds, colors, permissions
│       └── helpers.ts                # Date, classNames, generateId
├── services/                         # API client layer
│   ├── api.ts                        # Fetch wrapper (token, error handling)
│   ├── auth.ts                       # Auth endpoints
│   ├── boards.ts                     # Boards, stages, members
│   ├── cards.ts                      # Cards, checklist, labels
│   ├── users.ts                      # Profile & preferences
│   └── socket.ts                     # Socket.IO singleton
├── stores/                           # Zustand stores
│   ├── index.ts                      # Barrel exports
│   ├── authStore/
│   │   ├── index.ts                  # Store (devtools + subscribeWithSelector)
│   │   ├── types.d.ts
│   │   ├── authActions.ts            # login, register, hydrate, logout
│   │   └── userActions.ts            # updateProfile, updatePreferences
│   ├── boardStore/
│   │   ├── index.ts                  # Store (devtools + immer)
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
│   │       ├── normalizers.ts        # Backend -> frontend transform
│   │       └── boardHelpers.ts       # Inmutabilidad optimista
│   ├── settingsStore/
│   │   ├── index.ts
│   │   └── constants.ts
│   └── activityStore/
│       ├── index.ts                  # Store (local-only, localStorage)
│       ├── types.d.ts
│       ├── constants.ts
│       ├── activityActions.ts
│       └── utils.ts
└── components/
    └── membersPage/
        └── MembersList.tsx
```

## Routing

| Path | Component | Auth | Descripción |
|------|-----------|------|-------------|
| `/login` | `AuthPage` | No | Login/registro |
| `/boards` | `BoardsPage` | Sí | Lista de tableros |
| `/boards/:boardId` | `BoardRoute` -> `BoardView` | Sí | Vista kanban |
| `/boards/:boardId/config/*` | `BoardConfigPage` | Sí (owner) | Config del tablero |
| `/config/*` | `UserConfigPage` | Sí | Config del usuario |
| `/invitations` | `InvitationsPage` | Sí | Invitaciones pendientes |
| `/` | Redirect -> `/boards` | — | — |

## State Management (Zustand)

4 stores independientes:

| Store | Middleware | Persistencia | Propósito |
|-------|-----------|-------------|-----------|
| `authStore` | devtools + subscribeWithSelector | localStorage (token, user) | Autenticación |
| `boardStore` | devtools + immer | No persiste (API fetch) | CRUD boards, stages, cards, labels, members |
| `settingsStore` | devtools | localStorage (apariencia) | Tema, densidad, idioma |
| `activityStore` | devtools | localStorage por boardId | Feed de actividad local |

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
3. Si 401, se intenta refresh automático vía `POST /auth/refresh`
4. Si refresh falla, `clearTokens()` -> redirección a `/login`
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
