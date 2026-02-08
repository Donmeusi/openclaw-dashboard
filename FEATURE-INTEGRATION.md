# 🔗 Feature-Integration: Referenz-Repo Analyse

**Quelle:** https://github.com/AlexPEClub/openclaw_react_board  
**Datum:** 8. Februar 2026  
**Ziel:** Relevante Features in unser Dashboard übernehmen

---

## ✅ Bereits vorhanden (unser Dashboard)

| Feature | Status | Beschreibung |
|---------|--------|--------------|
| Multi-Project Kanban | ✅ | Mehrere Projekte, 4 Spalten |
| Activity Log | ✅ | Chronologische Ansicht |
| Agent Status | ✅ | Verfügbar/Beschäftigt |
| Dark Theme | ✅ | GitHub-inspiriertes Design |
| Markdown Support | ✅ | Editor + Preview |
| Context Files | ✅ | AGENTS.md, SOUL.md, etc. |
| Auto-Discovery | ✅ | File-Watcher für Projekte |

---

## 🆕 Zu implementieren (aus Referenz)

### 1. File Browser mit Syntax Highlighting

**Was fehlt:**
- Vollständiger Datei-Explorer wie im Referenz
- Navigation durch Projekt-Verzeichnisse
- Syntax-Highlighting für verschiedene Dateitypen
- Tree-View Ordnerstruktur

**Referenz-Endpoint:** `GET /api/files/:projectId/*`

**Implementierung:**
```javascript
// Backend
app.get('/api/browser/*', async (req, res) => {
  const requestedPath = req.params[0];
  const fullPath = safeJoin(BASE_PATH, requestedPath);
  
  // Prüfe ob Datei oder Ordner
  const stats = await fs.stat(fullPath);
  
  if (stats.isDirectory()) {
    // Liste Inhalt
    const items = await fs.readdir(fullPath, { withFileTypes: true });
    res.json({ type: 'directory', items });
  } else {
    // Datei-Inhalt mit Syntax-Highlighting-Info
    const content = await fs.readFile(fullPath, 'utf-8');
    const ext = path.extname(fullPath);
    res.json({ type: 'file', content, extension: ext });
  }
});
```

**Frontend:**
- Sidebar mit Tree-View (wie VS Code)
- Syntax-Highlighting (Prism.js / highlight.js)
- Datei-Tabs (mehrere Dateien offen)
- Breadcrumb-Navigation

---

### 2. Feature-Specs verknüpfen

**Was fehlt:**
- Tasks können mit Feature-MD-Dateien verknüpft sein
- Automatisches Tracking von Feature-Files
- Synchronisierung Task-Status ↔ Feature-File

**Referenz-Konvention:**
```
/projects/mein-projekt/features/PROJ-1-user-auth.md
Namenskonvention: PROJ-{nummer}-{feature-name}.md
```

**Schema-Erweiterung:**
```json
{
  "id": "task-1",
  "title": "User Authentication",
  "featureFile": "PROJ-1-user-auth.md",  // ← NEU
  "featurePath": "/projects/.../features/PROJ-1-user-auth.md",
  "status": "in-progress",
  "priority": "high"
}
```

**Implementierung:**
- Optionales Feld `featureFile` beim Task erstellen
- Auto-Link: Wenn Feature-File existiert, verknüpfen
- Feature-Status ↔ Task-Status bidirektional

---

### 3. Dynamischer Agent-Status

**Was fehlt:**
- Status basierend auf aktiven Tasks (nicht nur statisch)
- Automatische "Beschäftigt" bei In-Progress Tasks

**Logik:**
```javascript
function getAgentStatus() {
  const activeTasks = countTasksWithStatus('in-progress');
  const pendingTasks = countTasksWithStatus('todo');
  
  if (activeTasks > 0) {
    return {
      status: 'busy',
      message: `${activeTasks} Tasks in Bearbeitung`,
      lastSeen: new Date()
    };
  }
  
  return { status: 'available', ... };
}
```

---

### 4. Projekt-Pfad Integration

**Was fehlt:**
- Jedes Projekt hat `projectPath` (absoluter Pfad)
- File Browser nutzt diesen Pfad als Root

**Schema-Erweiterung:**
```json
{
  "id": "gefahrstoffverzeichnis",
  "name": "🧪 Gefahrstoffverzeichnis",
  "description": "...",
  "projectPath": "/Users/.../workspace/projects/gefahrstoffverzeichnis",  // ← NEU
  "columns": { ... }
}
```

**Auto-Discovery ergänzen:**
- Beim Discovery `projectPath` automatisch setzen
- File Browser nutzt diesen Pfad

---

## 🚀 Priorisierte Implementierung

### Phase 1: Sofort (heute)
- [ ] `projectPath` zu Projekten hinzufügen
- [ ] File Browser API (`/api/browser/*`)
- [ ] Tree-View Komponente

### Phase 2: Diese Woche
- [ ] Syntax-Highlighting
- [ ] Feature-Specs verknüpfen
- [ ] Agent-Status dynamisch

### Phase 3: Später
- [ ] Datei-Tabs (mehrere offen)
- [ ] File-Suche
- [ ] Drag & Drop im File Browser

---

## 📋 Vergleich Feature-Matrix

| Feature | Alex Repo | Unser Dashboard | Todo |
|---------|-----------|-----------------|------|
| Multi-Project Kanban | ✅ | ✅ | - |
| File Browser | ✅ Tree+Syntax | ⚠️ Nur Context | 🔴 HIGH |
| Activity Log | ✅ | ✅ | - |
| Agent Status | ✅ | ✅ Statisch | 🟡 Dynamisch |
| Dark Theme | ✅ | ✅ | - |
| Markdown Editor | ✅ | ✅ | - |
| Feature-Specs | ✅ | ❌ | 🟡 Mittel |
| Auto-Discovery | ❌ | ✅ | - |
| projectPath | ✅ | ❌ | 🔴 HIGH |

---

## 🔧 Technische Anpassungen

### Datenbank/Schema
```sql
-- Projekte erweitern
ALTER TABLE projects ADD COLUMN project_path TEXT;
ALTER TABLE projects ADD COLUMN features_dir TEXT;

-- Tasks erweitern
ALTER TABLE tasks ADD COLUMN feature_file TEXT;
ALTER TABLE tasks ADD COLUMN feature_path TEXT;
```

### API Erweiterungen
```
GET    /api/browser/*?project=:id     # File Browser
GET    /api/projects/:id/files        # Projekt-Dateien
POST   /api/tasks/:id/link-feature    # Feature verknüpfen
GET    /api/agent/status              # Dynamischer Status
```

---

**Empfehlung:** File Browser zuerst implementieren – das ist das Haupt-Feature das fehlt.
