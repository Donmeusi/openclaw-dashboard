# 🔒 Projekt-Platzhalter

**ACHTUNG:** Dies ist eine TEMPLATE-Datei.

Echte Projekte enthalten sensible Daten und werden NICHT in Git committiert.

## Projektstruktur (Lokal)

```
~/workspace/projects/
├── gefahrstoffverzeichnis/     # Nicht im Git!
│   ├── README.md              # Lokale Beschreibung
│   ├── backend/               # Lokaler Code
│   └── frontend/              # Lokaler Code
│
└── [weitere-projekte]/        # Nicht im Git!
```

## Auto-Discovery

Das Dashboard erkennt neue Projekte automatisch in `~/workspace/projects/*/README.md`.

**Wichtig:**
- ❌ KEINE API-Keys in README
- ❌ KEINE Passwörter im Code
- ❌ KEINE internen URLs
- ✅ Nutze `${PLATZHALTER}` für sensible Daten

## Sync zu GitHub

```bash
# Sensible Daten entfernen vor Push
./sanitize-before-push.sh
```
