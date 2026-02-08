# 🔄 Auto-Sync System: Projekte ↔ Dashboard

**Ziel:** Nahtlose Integration zwischen Workspace-Projeten und Dashboard-Kanban
**Status:** Konzeptphase
**Erstellt:** 8. Februar 2026

---

## 🎯 Anforderungen

### 1. Automatische Projekt-Erkennung
- Neue Projekte in `~/projects/` oder `~/workspace/projects/` werden automatisch erkannt
- Ohne manuelles Hinzufügen im Dashboard
- Metadaten aus README.md oder package.json extrahieren

### 2. Live Kanban-Updates
- Task-Statusänderungen (To Do → Done) sofort sichtbar
- Kein manuelles Browser-Refresh nötig
- Mehrere Nutzer sehen gleichen Stand

### 3. Bidirektionale Synchronisation
- Dashboard-Änderungen → Projekt-Dateien (z.B. TODO.md)
- Projekt-Änderungen → Dashboard-Kanban

---

## 🏗️ Lösungsansätze

### Option A: File-Watcher + WebSocket (Empfohlen)

**Backend erweitern:**
```javascript
// 1. File-Watcher (chokidar)
watchProjectsDirectory() {
  chokidar.watch('/projects/*/README.md')
    .on('add', (path) => this.autoCreateProject(path))
    .on('change', (path) => this.syncToKanban(path));
}

// 2. WebSocket für Live-Updates
io.on('connection', (socket) => {
  socket.emit('projects:update', projects);
  socket.emit('kanban:update', tasks);
});
```

**Frontend:**
- WebSocket-Client für Echtzeit-Updates
- Polling-Fallback (alle 5 Sekunden)
- Toast-Notifications bei Änderungen

**Vorteile:**
- ✅ Echtzeit-Sync
- ✅ Keine manuellen Schritte
- ✅ Funktioniert lokal & remote

**Nachteile:**
- ⚠️ WebSocket-Komplexität
- ⚠️ Konfliktbehandlung bei gleichzeitigen Änderungen

---

### Option B: Git-Hooks + API-Trigger

**Workflow:**
1. Git-Post-Commit Hook erkennt Änderungen
2. Ruft Dashboard-API auf (`POST /api/sync`)
3. Dashboard parset commit messages für Task-Updates
4. Aktualisiert projects.json

**Vorteile:**
- ✅ Versioniert (Git-History)
- ✅ Einfach nachvollziehbar
- ✅ Kein dauerhafter Prozess nötig

**Nachteile:**
- ⚠️ Nur bei Git-Commits (nicht live)
- ⚠️ Erfordert Hook-Setup pro Projekt

---

### Option C: Convention-over-Configuration

**Konvention:**
- Jedes Projekt hat `project.json` im Root
- Schema: `{ id, name, description, kanban: { todo: [], progress: [], review: [], done: [] } }`
- Dashboard liest direkt aus Projektdaten

**Vorteile:**
- ✅ Single Source of Truth
- ✅ Projekte sind portabel
- ✅ Keine Duplikation

**Nachteile:**
- ⚠️ Migration bestehender Projekte nötig
- ⚠️ Projekte müssen Schema einhalten

---

## 📋 Empfohlene Implementierung (Hybrid)

### Phase 1: Auto-Discovery (SOFORT)

**File-Watcher im Backend:**
```javascript
const chokidar = require('chokidar');
const PROJECTS_DIR = path.join(WORKSPACE_PATH, 'projects');

// Neue Projekte erkennen
chokidar.watch(`${PROJECTS_DIR}/*/README.md`)
  .on('add', async (filePath) => {
    const projectDir = path.dirname(filePath);
    const projectId = path.basename(projectDir);
    
    // Projekt existiert bereits?
    const existing = await findProject(projectId);
    if (existing) return;
    
    // Neue Projekt aus README extrahieren
    const readme = await fs.readFile(filePath, 'utf-8');
    const name = extractTitle(readme) || projectId;
    const description = extractFirstParagraph(readme);
    
    // Auto-create im Dashboard
    await createProject({
      id: projectId,
      name: `📁 ${name}`,
      description,
      autoDiscovered: true
    });
    
    // Activity loggen
    await addActivity({
      type: 'create',
      title: `🔍 Projekt auto-entdeckt: ${name}`,
      project: projectId
    });
  });
```

### Phase 2: TODO.md Sync (KURZFRISTIG)

**Konvention:**
- Jedes Projekt hat `TODO.md` mit Checkbox-Listen
- Dashboard parsed TODOs → Kanban-Items
- Änderungen in beide Richtungen

**TODO.md Schema:**
```markdown
# 📝 Projekt TODOs

## 📋 To Do
- [ ] Feature A implementieren
- [ ] Bugfix für Login

## 🔨 In Progress
- [ ] API Endpoint erstellen

## ✅ Done
- [x] Projektsetup
- [x] Datenbankschema
```

**Sync-Logik:**
```javascript
// TODO.md → Kanban
parseTodoMd(content) {
  const sections = {
    '## 📋 To Do': 'todo',
    '## 🔨 In Progress': 'progress',
    '## 👀 Review': 'review',
    '## ✅ Done': 'done'
  };
  
  for (const [header, columnId] of Object.entries(sections)) {
    const items = extractTasks(content, header);
    kanban[columnId].items = items.map(task => ({
      id: hash(task),
      title: task,
      source: 'TODO.md'
    }));
  }
}

// Kanban → TODO.md (bei Änderungen)
syncToTodoMd(projectId, kanban) {
  const todo = generateTodoMd(kanban);
  fs.writeFile(`projects/${projectId}/TODO.md`, todo);
}
```

### Phase 3: Live-Updates (MITTELFRISTIG)

**WebSocket Integration:**
```javascript
// Backend
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  // Client joined dashboard
  socket.join('dashboard-updates');
  
  // Bei Änderungen broadcasten
  socket.on('project:update', (data) => {
    io.to('dashboard-updates').emit('kanban:refresh', data);
  });
});

// Frontend
socket.on('kanban:refresh', (data) => {
  // Auto-refresh ohne Page reload
  updateKanbanBoard(data);
  showToast(`🔄 ${data.project}: ${data.change}`);
});
```

---

## 📁 Vorgeschlagene Projektstruktur (Standard)

```
~/workspace/projects/
├── gefahrstoffverzeichnis/
│   ├── README.md           # Titel + Beschreibung
│   ├── TODO.md            # ★ Kanban-Quelle
│   ├── PROJEKTPLAN.md     # Details
│   ├── CHANGELOG.md       # History
│   ├── backend/
│   └── frontend/
│
├── neues-projekt-2026/
│   ├── README.md
│   ├── TODO.md            # Wird auto in Dashboard angezeigt
│   └── ...
│
└── template/              # Kopier-Vorlage
    ├── README.md
    ├── TODO.md
    └── init.sh            # Setup-Script
```

**Regeln:**
1. Ordner-Name = Projekt-ID
2. README.md = 1. Zeile = Titel, 2.-4. Zeile = Beschreibung
3. TODO.md = Kanban-Spalten via H2-Header (📋, 🔨, 👀, ✅)

---

## 🚀 Implementierungsschritte

### SOFORT (Heute)
- [ ] File-Watcher in Dashboard-Backend einbauen
- [ ] Auto-Discovery für `projects/*/` aktivieren
- [ ] Gefahrstoffverzeichnis als erstes auto-Project testen

### KURZFRISTIG (Diese Woche)
- [ ] TODO.md Parser für Kanban-Sync
- [ ] Bidirektionale Sync (Dashboard ↔ TODO.md)
- [ ] Activity-Log für alle Auto-Aktionen

### MITTELFRISTIG (Nächste Woche)
- [ ] WebSocket für Echtzeit-Updates
- [ ] Konflikt-Erkennung (gleichzeitige Änderungen)
- [ ] Mobile-Optimierung

---

## 🎨 UI-Verbesserungen

### Auto-Discovery Indikatoren
- 🆕 Badge für neue, auto-entdeckte Projekte (24h)
- 🔄 Sync-Status ("Zuletzt synchronisiert: 2 Min")
- 📡 Live-Indicator (WebSocket connected/disconnected)

### Smart Notifications
- "🔍 Neues Projekt entdeckt: gefahrstoffverzeichnis"
- "✅ 3 Tasks von TODO.md importiert"
- "🔄 Kanban aktualisiert (änderung von anderem Nutzer)"

---

## 💡 Zusätzliche Features

### Projekt-Templates
```bash
# Neues Projekt aus Template
~/dashboard/create-project.sh "Mein Projekt"
# Erstellt: Ordner + README.md + TODO.md + Eintrag in projects.json
```

### GitHub Integration
- Issues → Kanban-Items
- PRs → Review-Spalte
- Commits → Activity Log

### CLI-Tool
```bash
# Task hinzufügen via Terminal
dashboard add-task "gefarhstoffverzeichnis" "Frontend Login"
# → Updated TODO.md + Kanban + Activity Log
```

---

## ⚡ Quick-Win: Sofort umsetzbar

Das kann ich **jetzt** implementieren (10 Minuten):

1. **File-Watcher** im Dashboard-Server
2. **Auto-Discovery** für `projects/*/README.md`
3. **Gefahrstoffverzeichnis** als erstes Test-Projekt

Soll ich starten? 🚀
