# OpenClaw Dashboard

Ein zentrales Project Management Dashboard als Steuerzentrale für den KI-Agenten Nova und Softwareprojekte im **GitHub Dark Mode Design**.

---

## 🎯 Features

### 1. Status-Anzeige
- **Verfügbar/Beschäftigt**-Indikator mit Farbcodierung
- Letzte Aktivitätszeit
- Modell-Information (ollama/kimi-k2.5:cloud)
- Versions-Information

### 2. Aktivitäts-Log
- Chronologische Übersicht aller Aktionen
- Gruppierung nach Datum
- Farbige Badges für Aktivitätstypen (edit, create, integration, delete)
- Timeline mit Zeitstempeln

### 3. Kontext-Editor
- **Direkte Bearbeitung** aller zentralen Markdown-Dateien:
  - `MEMORY.md` - Langzeitgedächtnis
  - `AGENTS.md` - Agent-Konfiguration
  - `SOUL.md` - Persönlichkeit & Verhalten
  - `USER.md` - Benutzer-Informationen
  - `TOOLS.md` - Tool-Konfiguration
  - `IDENTITY.md` - Identität des Agenten
  - `HEARTBEAT.md` - Periodische Aufgaben
  - `memory/YYYY-MM-DD.md` - Tägliche Logs
- **Syntax-Highlighting** für Markdown
- **Vorschau-Modus** mit gerendertem HTML
- Auto-Save Indikator
- Zeichen-/Zeilen-Zähler

### 4. Projekt-Verwaltung
- **Kanban-Board** mit 4 Spalten:
  - 📋 To Do
  - 🔨 In Progress
  - 👀 Review
  - ✅ Done
- **Drag-and-Drop** Funktionalität
- Prioritäts-Marker (Hoch/Mittel/Niedrig)
- Tags für Kategorisierung
- Schnelles Hinzufügen neuer Tasks

---

## 🚀 Technischer Stack

### Frontend
- **React** 18.2.0
- **Vite** 5.4.21 (Build-Tool)
- **Tailwind CSS** (via CDN)
- System-Fonts (GitHub-Style)

### Backend
- **Node.js** + **Express** 4.18.2
- **CORS** für Cross-Origin Requests
- Dateisystem-API für Workspace-Zugriff

### Design
- **GitHub Dark Mode** Farbpalette:
  - Hintergrund: `#0d1117`
  - Surface: `#161b22`
  - Border: `#30363d`
  - Text: `#c9d1d9`
  - Accent: `#58a6ff`
  - Success: `#238636`
  - Warning: `#f0883e`
  - Danger: `#f85149`

---

## 📁 Projektstruktur

```
dashboard/
├── server/
│   └── index.js              # Express API
├── client/
│   ├── index.html            # HTML Template + Tailwind Config
│   ├── vite.config.js        # Vite Konfiguration
│   ├── package.json          # React Dependencies
│   └── src/
│       ├── main.jsx          # Entry Point
│       ├── App.jsx           # Hauptkomponente
│       ├── utils/
│       │   └── api.js        # API-Helper
│       └── components/
│           ├── Sidebar.jsx       # Navigation
│           ├── StatusBar.jsx     # Status-Anzeige
│           ├── FileEditor.jsx    # Markdown Editor
│           ├── ActivityLog.jsx   # Aktivitäts-History
│           └── ProjectBoard.jsx  # Kanban Board
├── package.json              # Root Dependencies
└── README.md                 # Diese Datei
```

---

## ⚙️ Installation

### Voraussetzungen
- Node.js v18+
- npm oder yarn

### Schritte

```bash
# In das Dashboard-Verzeichnis wechseln
cd dashboard

# Server-Dependencies installieren
npm install

# Client-Dependencies installieren
cd client && npm install && cd ..
```

---

## 🖥️ Entwicklung

```bash
# Server + Client gleichzeitig starten
npm run dev
```

Öffnet:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001

### Einzelne Services

```bash
# Nur Backend
npm run server

# Nur Frontend (im client/ Verzeichnis)
cd client && npm start
```

---

## 🔌 API-Endpunkte

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | `/api/status` | Agent-Status abrufen |
| GET | `/api/files` | Liste der Core-Dateien |
| GET | `/api/files/:filename` | Dateiinhalt lesen |
| POST | `/api/files/:filename` | Datei speichern |
| GET | `/api/memory` | Memory-Log-Dateien |
| GET | `/api/memory/:filename` | Memory-Datei lesen |

---

## 🎨 Design-System

### Buttons
- **Primary:** Grün (`#238636`), für Hauptaktionen (Speichern)
- **Secondary:** Grau (`#21262d`), für sekundäre Aktionen
- **Hover:** Farbe heller, Border sichtbarer

### Karten
- Hintergrund: `#161b22`
- Border: `1px solid #30363d`
- Border-Radius: `6px`

### Formulare
- Input-Hintergrund: `#0d1117`
- Input-Border: `#30363d`
- Focus-Border: `#58a6ff`

---

## 📝 Markdown-Support

Der Editor unterstützt:
- Headers (`# ## ###`)
- Bold/Italic (`**bold** *italic*`)
- Inline-Code (`` `code` ``)
- Checkboxes (`- [x] task`)
- Listen (`- item`)

---

## 🔒 Sicherheit

- **Path Traversal Protection:** Alle Dateipfade werden mit `path.basename()` bereinigt
- **CORS:** Aktiviert für localhost-Entwicklung
- **Workspace-Isolation:** Zugriff nur auf `/Users/donmeusi/.openclaw/workspace`

---

## 🛣️ Roadmap

### Geplant
- [ ] File Browser für gesamten Workspace
- [ ] Echtzeit-Synchronisation via WebSocket
- [ ] Dark/Light Mode Toggle
- [ ] Suche in allen Markdown-Dateien
- [ ] Git-Integration (Status, Diff, Commit)
- [ ] Task-Filter und -Suche im Kanban
- [ ] Export/Import von Projektdaten

---

## 🐛 Fehlerbehebung

### Port bereits belegt
```bash
# Prozesse auf Port 3000/3001 beenden
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### 404 beim Öffnen des Editors
Überprüfe, ob die Datei im Workspace existiert:
```bash
ls ~/.openclaw/workspace/*.md
```

---

## 📄 Lizenz

MIT License - Für persönliche Nutzung im OpenClaw-Workspace.

---

## 👤 Autor

Erstellt von Nova (KI-Agent) für Christian (@Donmeusi)
Datum: 2026-02-07
Version: 1.0.0
