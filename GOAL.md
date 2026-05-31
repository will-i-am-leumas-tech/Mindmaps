# GOAL: Leumas Mindmap Notebook

## Product Goal

Build a lightweight local-first Node.js + Vite + React JSX application for creating, editing, previewing, and managing large long-lived mindmaps. The app should feel like a futuristic Hollywood IDE: the mindmap canvas is the full-screen background, while navigation, tools, inspectors, search, and status information appear as translucent HUD overlays.

This is a personal local mindmap creation and management tool. It must be fast, durable, clean, adapter-based, and simple enough to maintain for years.

## MVP Source

Start from the provided single-file HTML/CSS/JS canvas MVP and convert it into a maintainable app with:

- A Node.js server entrypoint.
- A Vite React JSX frontend.
- A small SDK for API calls and data adapters.
- A router layer for CRUD endpoints.
- A local `mindmaps/` folder for persisted map files.
- A clean README with run/build/use instructions.

## Required Top-Level File Tree

```txt
Mindmaps/
├── server.js
├── package.json
├── README.md
├── GOAL.md
├── scripts/
│   └── dev.js
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── styles.css
│       ├── components/
│       │   ├── HudButton.jsx
│       │   ├── HudPanel.jsx
│       │   ├── MindmapCanvas.jsx
│       │   ├── MindmapNode.jsx
│       │   ├── LinkLayer.jsx
│       │   ├── NodeInspector.jsx
│       │   ├── MindmapLibrary.jsx
│       │   ├── StatusHud.jsx
│       │   └── FooterNav.jsx
│       ├── hooks/
│       │   ├── useCanvasControls.js
│       │   ├── useMindmapState.js
│       │   └── useAutosave.js
│       ├── lib/
│       │   ├── constants.js
│       │   ├── ids.js
│       │   ├── geometry.js
│       │   └── mindmapSchema.js
│       └── pages/
│           ├── EditorPage.jsx
│           ├── LibraryPage.jsx
│           └── PreviewPage.jsx
├── sdk/
│   ├── index.js
│   ├── adapters/
│   │   ├── httpMindmapAdapter.js
│   │   └── localMemoryAdapter.js
│   └── mindmaps.js
├── router/
│   ├── index.js
│   ├── mindmaps.js
│   └── health.js
└── mindmaps/
    ├── .gitkeep
    └── example.leumas-mindmap.json
```

## Technology Requirements

### Runtime

- Use Node.js with native ECMAScript modules.
- Use Express or a similarly minimal HTTP server.
- Keep the backend intentionally small and readable.
- Use Vite for frontend development and bundling.
- Use React JSX only; TypeScript is optional but should not be required for the MVP.

### Package Scripts

`package.json` should include at minimum:

```json
{
  "scripts": {
    "dev": "node scripts/dev.js",
    "dev:server": "node --watch server.js",
    "dev:frontend": "vite --host 0.0.0.0 --config frontend/vite.config.js",
    "build": "vite build --config frontend/vite.config.js",
    "start": "node server.js",
    "check": "npm run build"
  }
}
```

Use the tiny `scripts/dev.js` process runner to avoid an extra dependency. README should also document the separate server/frontend commands.

## Backend Goal

The backend should act as a local file-backed API. It should not require a database for the MVP.

### Server Responsibilities

- Serve API routes from `/api`.
- In production/start mode, serve the Vite build output.
- Ensure the `mindmaps/` folder exists on startup.
- Store one JSON file per mindmap.
- Never write outside the repository mindmaps folder.
- Sanitize slugs and filenames.
- Return helpful JSON errors.

### API Routes

Implement a small router-based API:

```txt
GET    /api/health
GET    /api/mindmaps
POST   /api/mindmaps
GET    /api/mindmaps/:slug
PUT    /api/mindmaps/:slug
PATCH  /api/mindmaps/:slug
DELETE /api/mindmaps/:slug
POST   /api/mindmaps/:slug/duplicate
```

### Route Behavior

#### `GET /api/health`

Return:

```json
{
  "ok": true,
  "app": "leumas-mindmap-notebook"
}
```

#### `GET /api/mindmaps`

Return lightweight metadata for all mindmaps:

```json
{
  "mindmaps": [
    {
      "slug": "leumas-project",
      "name": "Leumas Project",
      "description": "Long-term project map",
      "nodeCount": 128,
      "linkCount": 240,
      "updatedAt": "2026-05-30T00:00:00.000Z"
    }
  ]
}
```

#### `POST /api/mindmaps`

Create a new named mindmap. Accept:

```json
{
  "name": "Leumas Project",
  "description": "Long-term project map"
}
```

Return the full created mindmap.

#### `GET /api/mindmaps/:slug`

Return the full mindmap JSON.

#### `PUT /api/mindmaps/:slug`

Replace the full mindmap file with a validated payload.

#### `PATCH /api/mindmaps/:slug`

Merge shallow metadata patches or full map content updates. Keep this simple for MVP.

#### `DELETE /api/mindmaps/:slug`

Delete the mindmap file.

#### `POST /api/mindmaps/:slug/duplicate`

Copy an existing map to a new slug and name.

## Mindmap File Format

Each mindmap in `mindmaps/` should be named with a stable slug:

```txt
mindmaps/leumas-project.leumas-mindmap.json
```

Use this schema shape:

```json
{
  "version": 1,
  "slug": "leumas-project",
  "name": "Leumas Project",
  "description": "Long-term project map",
  "createdAt": "2026-05-30T00:00:00.000Z",
  "updatedAt": "2026-05-30T00:00:00.000Z",
  "viewport": {
    "scale": 1,
    "panX": 420,
    "panY": 220
  },
  "nodes": [
    {
      "id": "node_1",
      "type": "text",
      "shape": "card",
      "title": "Leumas Project",
      "body": "Start with a main idea, then branch into product, API, UI, data, launch, and revenue.",
      "x": -260,
      "y": -60,
      "w": 220,
      "h": 130,
      "color": "#00aaff",
      "tags": [],
      "collapsed": false,
      "createdAt": "2026-05-30T00:00:00.000Z",
      "updatedAt": "2026-05-30T00:00:00.000Z"
    }
  ],
  "links": [
    {
      "id": "link_1",
      "from": "node_1",
      "to": "node_2",
      "label": "",
      "color": "#38ffb3",
      "direction": "none"
    }
  ]
}
```

### Data Rules

- Keep node IDs stable forever.
- Keep slug stable unless the user explicitly renames the file.
- Store viewport per mindmap so reopening a map restores the last working view.
- Keep all mindmap data human-readable JSON.
- The app should tolerate older files with missing fields and normalize them on load.
- Avoid storing large images inline long term unless needed. For MVP, base64 image nodes are acceptable, but future versions should use an assets folder.

## SDK Goal

Create a small SDK so frontend code does not call `fetch` directly everywhere.

### SDK Shape

```js
import { createMindmapSdk } from '../sdk/index.js';

const sdk = createMindmapSdk({
  adapter: 'http',
  baseUrl: '/api'
});
```

### Required SDK Methods

```js
sdk.health.check()
sdk.mindmaps.list()
sdk.mindmaps.create({ name, description })
sdk.mindmaps.get(slug)
sdk.mindmaps.save(slug, mindmap)
sdk.mindmaps.patch(slug, patch)
sdk.mindmaps.remove(slug)
sdk.mindmaps.duplicate(slug, { name })
```

### Adapter Requirements

- `httpMindmapAdapter` should call the backend routes.
- `localMemoryAdapter` should support tests, Storybook-like demos, and frontend-only experiments.
- The SDK should be easy to extend later for Git, SQLite, cloud sync, or encrypted local storage.

## Frontend Product Goal

The frontend is the primary focus. It should become a serious long-term visual notebook for massive mindmaps.

### Visual Direction

Create a dark sci-fi HUD interface:

- Full-screen canvas background.
- Neon blue, green, red, and violet accents.
- Glassmorphism panels with blur, thin borders, and subtle glow.
- Floating controls rather than heavy page chrome.
- A compact footer or bottom dock for primary navigation.
- A right or left inspector overlay for selected node details.
- A library overlay for switching between maps.
- Smooth transitions but no sluggish animations.
- The canvas should always feel like the main workspace.

### Primary Frontend Screens

#### Editor Page

Main workspace for building mindmaps.

Must include:

- Infinite-feeling canvas.
- Pan by dragging empty space.
- Zoom with wheel and buttons.
- Zoom toward cursor.
- Add text node.
- Add frame/section node.
- Add image node.
- Select node.
- Drag nodes.
- Edit node title/body.
- Change node shape.
- Change accent color.
- Duplicate node.
- Delete node.
- Connect two nodes.
- Render smooth curved SVG links.
- Save current mindmap.
- Autosave after edits with debounce.
- Display status: current map name, zoom, node count, link count, save state.

#### Library Page

Manage local mindmaps.

Must include:

- List all mindmaps from `mindmaps/`.
- Create a new mindmap.
- Open existing mindmap.
- Duplicate existing mindmap.
- Delete mindmap with confirmation.
- Show metadata: name, description, node count, link count, updated date.

#### Preview Page

Read-only preview mode.

Must include:

- Same canvas rendering as editor.
- No editing controls.
- Pan and zoom enabled.
- Good for presentation, review, and screenshots.

## Frontend Architecture

### Suggested State Shape

```js
const editorState = {
  mindmap: null,
  selectedNodeId: null,
  mode: 'select',
  connectFromId: null,
  saveState: 'idle',
  viewport: {
    scale: 1,
    panX: 420,
    panY: 220
  }
};
```

### Modes

Support these editor modes:

```txt
select
pan
connect
preview
```

### Components

#### `MindmapCanvas.jsx`

Owns the visual canvas area, input events, transform, grid, world layer, and composition of nodes and links.

#### `MindmapNode.jsx`

Renders one node. It should be reusable and receive props for node data, selection state, and event handlers.

#### `LinkLayer.jsx`

Renders SVG links between node centers. It should remain independent from node editing logic.

#### `NodeInspector.jsx`

HUD panel for editing selected node fields.

#### `MindmapLibrary.jsx`

HUD/library panel for listing, opening, creating, duplicating, and deleting maps.

#### `FooterNav.jsx`

Bottom dock for switching between Library, Editor, Preview, save, and settings-style actions.

#### `StatusHud.jsx`

Small HUD readout for zoom, node/link counts, selected node, and save status.

## Performance Requirements

Mindmaps may grow very large over years, so design the MVP with future scale in mind.

### MVP Performance

- Keep interactions smooth for hundreds of nodes.
- Avoid rerendering the entire app on every mousemove if possible.
- Use stable handlers and small components.
- Use CSS transforms for pan and zoom.
- Use SVG for links in MVP.
- Debounce autosave to avoid writing on every keystroke.

### Future Performance Upgrade Path

Document these as TODOs or comments where appropriate:

- Viewport culling for nodes outside the visible area.
- Spatial index for hit detection.
- Canvas/WebGL renderer adapter for extremely large maps.
- Worker-based layout and search indexing.
- Asset folder for images and attachments.
- Optional minimap.
- Optional command palette.

## Canvas Interaction Requirements

### Pan

- Drag empty canvas to pan.
- Do not pan while editing text fields.
- Preserve current viewport in mindmap file.

### Zoom

- Wheel zoom should zoom toward cursor.
- Buttons should zoom toward center.
- Allow a wide zoom range to feel almost indefinite.
- Suggested MVP clamp: `0.03` to `8`.
- Keep grid visually stable at different zoom levels.

### Nodes

Support these shapes for MVP:

```txt
card
circle
frame
diamond
```

Node fields:

```txt
id
type
shape
title
body
x
y
w
h
color
tags
collapsed
image
createdAt
updatedAt
```

### Links

- Links connect node centers in MVP.
- Render as curved paths.
- Store `from`, `to`, `color`, `label`, and `direction`.
- Prevent duplicate links between the same two nodes unless the design later supports multi-links.

## Persistence Requirements

### Manual Save

A Save button should write the current map to the local file via the API.

### Autosave

Autosave should run after changes with a debounce, for example 700-1500ms.

### Unsaved Indicator

The HUD should show:

```txt
Saved
Saving...
Unsaved
Error
```

### Import/Export

Keep MVP import/export JSON support:

- Export current mindmap to JSON download.
- Import JSON and normalize it into the current schema.
- Optionally save imported JSON as a new local mindmap.

## Styling Requirements

Use one global CSS file for MVP unless component CSS becomes necessary.

Carry forward the visual language from the prototype:

- `#05070d` / near-black base background.
- Neon cyan: `#00aaff`.
- Neon red/pink: `#ff315f`.
- Neon green: `#38ffb3`.
- Frosted panels using rgba backgrounds and backdrop blur.
- Rounded panels and cards.
- Thin glowing borders.
- Grid background.
- Status HUD in a corner.
- Responsive layout for smaller screens.

## README Requirements

README should explain:

- What the app is.
- How to install dependencies.
- How to run dev mode.
- How to build.
- How to start production mode.
- Where mindmaps are stored.
- The JSON file format.
- The API endpoints.
- Keyboard/mouse controls.
- MVP limitations and future roadmap.

## Acceptance Criteria

The implementation is ready when:

- `npm install` succeeds.
- `npm run dev` starts server and frontend, or README clearly documents the two commands if not using `concurrently`.
- `npm run build` succeeds.
- `npm start` serves the API and production frontend build.
- Opening the app shows a polished HUD-style mindmap editor.
- The user can create a mindmap and it appears in `mindmaps/`.
- The user can reopen the same mindmap later.
- The user can add, edit, move, duplicate, delete, and connect nodes.
- The user can zoom and pan smoothly.
- The user can save manually and autosave works.
- The user can manage maps from the library.
- Existing single-file MVP behavior is preserved or improved in React.

## Implementation Order for Codex

1. Create the Node/Vite project structure and package scripts.
2. Build `server.js` and `router/` with file-backed CRUD for `mindmaps/`.
3. Build `sdk/` with HTTP and memory adapters.
4. Seed `mindmaps/example.leumas-mindmap.json` from the prototype's three starter nodes.
5. Convert the prototype UI into React components.
6. Add library, editor, and preview page routing inside the frontend.
7. Add autosave and manual save.
8. Polish the HUD visual design.
9. Update README with exact commands and controls.
10. Run build/check and fix issues.

## Non-Goals for MVP

- No user authentication.
- No external database.
- No cloud sync.
- No collaborative editing.
- No paid services.
- No heavy framework unless absolutely necessary.
- No complex graph layout engine required for first pass.

## Long-Term Vision

This should become a durable personal knowledge canvas where the same few mindmaps can grow for years. The MVP should stay minimal, but the architecture should be ready for future adapters and renderers:

- File adapter now.
- SQLite adapter later.
- Git snapshot adapter later.
- Cloud sync adapter later.
- DOM/SVG renderer now.
- Canvas/WebGL renderer later.
- Local search index later.
- AI-assisted organization later.
