# Leumas Mindmap Notebook

A lightweight local-first mindmap creation and management tool built with Node.js, Vite, and React JSX. The frontend is a dark sci-fi HUD workspace where the canvas fills the screen and controls float as translucent overlays.

## What This App Does

- Creates and manages named local mindmaps.
- Stores each mindmap as readable JSON in `mindmaps/`.
- Provides a router-backed API for CRUD operations.
- Uses a small SDK/adapters layer so the UI does not call `fetch` directly.
- Offers an editor, library, and preview mode for long-lived mindmap notebooks.

## Install

```bash
npm install
```

## Development

Run server and Vite together:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev:server
npm run dev:frontend
```

- API/server: <http://localhost:4173>
- Vite frontend: <http://localhost:5173>

## Build

```bash
npm run build
```

## Production Start

Build first, then start the Node server:

```bash
npm run build
npm start
```

The server serves `/api/*` and the production frontend from `frontend/dist`.

## Mindmap Storage

Mindmaps are stored as one JSON file per map in:

```txt
mindmaps/<slug>.leumas-mindmap.json
```

The included starter map is:

```txt
mindmaps/example.leumas-mindmap.json
```

## API Endpoints

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

## Mindmap JSON Shape

```json
{
  "version": 1,
  "slug": "example",
  "name": "Leumas Project",
  "description": "Starter long-term project mindmap",
  "createdAt": "2026-05-30T00:00:00.000Z",
  "updatedAt": "2026-05-30T00:00:00.000Z",
  "viewport": { "scale": 1, "panX": 420, "panY": 220 },
  "nodes": [],
  "links": []
}
```

## Controls

- Drag empty canvas: pan.
- Mouse wheel: zoom toward cursor.
- Double-click empty canvas: add a new branch node.
- Drag a node: move it.
- Select a node: edit it in the right HUD inspector.
- Connect mode: click one node, then another node to create a curved link.
- Save: manually persist the current mindmap.
- Autosave: edits are saved after a short debounce.
- Preview: locks editing while keeping pan/zoom enabled.

## Current MVP Limitations

- File-backed JSON only; no database.
- No auth or collaboration.
- Images are stored inline as base64 for the MVP.
- DOM/SVG rendering is intended for hundreds of nodes; very large maps should later add viewport culling or a canvas/WebGL renderer.

## Roadmap

- Viewport culling for huge maps.
- Minimap and command palette.
- Asset folder for images and attachments.
- Git snapshot adapter.
- SQLite adapter.
- Search indexing and AI-assisted organization.
