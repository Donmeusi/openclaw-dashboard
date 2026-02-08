# ✅ Kompatibilitäts-Analyse: Unsere Struktur vs. Alex Repo

**Datum:** 8. Februar 2026  
**Ergebnis:** ✅ **PASST ZU 95%** – leichte Anpassungen nötig

---

## 📁 Struktur-Vergleich

### AlexPEClub Repo
```
~/.openclaw/workspace/
├── kanban/                    # Dashboard Ordner
│   ├── app.js                 # Backend
│   ├── tasks.json             # Projekte + Tasks
│   └── ...
│
└── projects/                  # Projekt-Ordner
    └── mein-projekt/
        ├── README.md
        ├── features/          # ← Feature-Specs hier
        └── src/
```

### UNSERE Struktur
```
~/workspace/
├── dashboard/                 # ✅ Entspricht "kanban/"
│   ├── server/index.js        # ✅ Backend (statt app.js)
│   ├── projects.json          # ✅ Projekte (statt tasks.json)
│   └── ...
│
└── projects/                  # ✅ IDENTISCH
    └── gefahrstoffverzeichnis/  # ✅ Projekt-Ordner
        ├── README.md          # ✅ Vorhanden
        ├── PROJEKTPLAN.md     # 🆒 Extra (statt features/)
        ├── TODO.md            # 🆒 Extra
        ├── backend/           # ✅ Code
        └── frontend/          # ✅ Code
```

---

## ✅ Was passt perfekt

| Element | Alex Repo | Unsere Struktur | Status |
|---------|-----------|-----------------|--------|
| **Workspace** | `~/.openclaw/workspace/` | `~/workspace/` | ✅ Gleich |
| **Dashboard-Ordner** | `kanban/` | `dashboard/` | ✅ Analog |
| **Projekte-Ordner** | `projects/` | `projects/` | ✅ IDENTISCH |
| **Projekt-README** | `projects/*/README.md` | `projects/*/README.md` | ✅ IDENTISCH |
| **Backend** | `app.js` | `server/index.js` | ✅ Einfach mappen |
| **Projekt-Config** | `tasks.json` | `projects.json` | ✅ Einfach mappen |

---

## 🔧 Minimal-Anpassungen nötig

### 1. `projectPath` zu Projekten hinzufügen

**Alex Schema:**
```json
{
  "id": "proj-xxx",
  "name": "Projektname",
  "projectPath": "/home/node/clawd/projects/mein-projekt"  // ← PFLICHT
}
```

**Unser Schema aktuell:**
```json
{
  "id": "gefahrstoffverzeichnis",
  "name": "🧪 Gefahrstoffverzeichnis",
  // ❌ KEIN projectPath!
}
```

**Lösung:** Feld hinzufügen
```json
{
  "id": "gefahrstoffverzeichnis",
  "name": "🧪 Gefahrstoffverzeichnis",
  "projectPath": "/Users/donmeusi/.openclaw/workspace/projects/gefahrstoffverzeichnis",  // ← NEU
  "columns": {...}
}
```

**Migration:**
```javascript
// Einmalig ausführen
for (const project of projects) {
  project.projectPath = `${WORKSPACE_PATH}/projects/${project.id}`;
}
```

---

### 2. Feature-Specs Ordner

**Alex Konvention:**
```
projects/mein-projekt/features/
├── PROJ-1-user-auth.md
└── PROJ-2-database.md
```

**Unsere Variante:**
```
projects/gefahrstoffverzeichnis/
├── PROJEKTPLAN.md      ← = Feature-Spec
├── TODO.md              ← = Task-Liste
└── CHANGELOG.md         ← = Historie
```

**Entscheidung:** Flexibler sein als Alex
- `features/` Ordner unterstützen (für Alex-Kompatibilität)
- ODER: Alle `.md` Files erlauben als Feature-Specs
- Task-Feld `featureFile` optional machen

**Mapping:**
```javascript
// Wenn features/ existiert → Alex-Modus
// Wenn nur TODO.md → Unser Modus
// Beides erlaubt → Hybrid
```

---

### 3. API-Endpunkte mappen

| Alex Endpoint | Unser Endpoint | Aktion |
|--------------|----------------|--------|
| `GET /api/files/:projectId/*` | Neu | 🔴 Implementieren |
| `GET /api/context-files` | `GET /api/files` | 🟡 Umbenennen/Alias |
| `POST /api/projects` | `POST /api/projects/create` | 🟡 Anpassen |
| `PUT /api/tasks/:id` | `POST /api/projects/:id` | 🟡 Anpassen |
| `GET /api/activity` | `GET /api/activities` | 🟡 Umbenennen/Alias |

---

## 🎯 Empfohlene Architektur (Hybrid)

```
┌─────────────────────────────────────────────────────┐
│                 Alex-Kompatibel                     │
│  (passt zu Doku + Community-Standard)               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  projects/                                          │
│  └── gefahrstoffverzeichnis/                        │
│      ├── README.md          → Name/Beschreibung     │
│      ├── features/          → (optional)           │
│      │   └── PROJ-1-xxx.md  → Feature-Spec         │
│      ├── PROJEKTPLAN.md     → (optional) Extra     │
│      ├── TODO.md            → (optional) Extra     │
│      └── backend/           → Code                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Vorteile:**
- ✅ Alex-Doku direkt anwendbar
- ✅ Community kann Projekte importieren
- ✅ Wir können trotzdem extras haben (TODO.md)
- ✅ Migration einfach

---

## 🚀 Implementierungs-Plan

### Phase A: Kompatibilitäts-Layer (30 Min)
- [ ] `projectPath` zu allen Projekten hinzufügen
- [ ] API-Aliasse erstellen (`/api/activity` → `/api/activities`)
- [ ] `features/` Ordner-Unterstützung

### Phase B: File Browser (60 Min)
- [ ] `GET /api/files/:projectId/*` Endpoint
- [ ] Tree-View Komponente
- [ ] Syntax-Highlighting (Prism.js)

### Phase C: Feature-Specs (45 Min)
- [ ] Task-Feld `featureFile` hinzufügen
- [ ] Auto-Link wenn `.md` in features/
- [ ] Task-Status ↔ File-Status Sync

---

## ❌ Was NICHT passen würde

| Alex Ansatz | Unser Problem | Lösung |
|-------------|---------------|--------|
| Harte Pfade in JSON | `/home/node/...` funktioniert nicht lokal | Relativen Pfad + `WORKSPACE_PATH` |
| Nur `features/` Ordner | Wir haben auch `TODO.md`, `PROJEKTPLAN.md` | Flexibles Mapping |
| Keine Spalten-Struktur | Alex hat flache `tasks[]` Liste | Beides unterstützen oder migrieren |

**Wichtig:** Wir behalten unsere 4-Spalten Kanban-Struktur bei – die ist besser!

---

## ✅ Fazit

> **JA, es passt!** Mit minimalen Anpassungen (ca. 2h Arbeit):
>
> 1. `projectPath` Feld hinzufügen
> 2. File Browser API implementieren  
> 3. Feature-Specs optional machen
>
> Danach ist Alex' Repo-Doku 1:1 anwendbar und wir können sogar
> Projekte aus der Community importieren!

---

**Empfehlung:** Phase A starten (Kompatibilitäts-Layer) – dann ist die Basis da.
