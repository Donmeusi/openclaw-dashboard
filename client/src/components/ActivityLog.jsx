import React from 'react';

const MOCK_ACTIVITIES = [
  { id: 1, type: 'edit', file: 'MEMORY.md', description: 'TODOs aktualisiert', time: '2026-02-07T19:30:00', user: 'Nova' },
  { id: 2, type: 'create', file: '2026-02-07.md', description: 'Memory-Log erstellt', time: '2026-02-07T18:50:00', user: 'Nova' },
  { id: 3, type: 'integration', file: 'Jellyfin API', description: 'Server-Verbindung hergestellt', time: '2026-02-07T18:45:00', user: 'Nova' },
  { id: 4, type: 'integration', file: 'Todoist', description: 'Watchlist-Projekt erstellt', time: '2026-02-07T18:40:00', user: 'Nova' },
  { id: 5, type: 'edit', file: 'TOOLS.md', description: 'API-Keys gespeichert', time: '2026-02-07T18:30:00', user: 'Nova' },
  { id: 6, type: 'create', file: 'Jellyfin Watchlist', description: 'Zwei Empfehlungen hinzugefügt', time: '2026-02-07T18:25:00', user: 'Nova' },
];

const ACTIVITY_ICONS = {
  edit: '✏️',
  create: '✨',
  integration: '🔌',
  delete: '🗑️',
};

const ACTIVITY_COLORS = {
  edit: '#58a6ff',
  create: '#3fb950',
  integration: '#f0883e',
  delete: '#f85149',
};

export default function ActivityLog() {
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Group by date
  const grouped = MOCK_ACTIVITIES.reduce((acc, activity) => {
    const date = formatDate(activity.time);
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-4 pb-4 border-b" style={{ borderColor: '#30363d' }}>
        <h2 style={{ color: '#f0f6fc', fontSize: '20px', fontWeight: 600 }}>
          Aktivitäts-Log
        </h2>
        <span style={{ color: '#8b949e', fontSize: '13px' }}>
          {MOCK_ACTIVITIES.length} Einträge
        </span>
      </div>

      <div className="space-y-4">
        {Object.entries(grouped).map(([date, activities]) => (
          <div key={date} className="github-card p-4">
            <h3 
              className="text-sm font-semibold mb-3 pb-2 border-b"
              style={{ color: '#8b949e', borderColor: '#30363d' }}
            >
              {date}
            </h3>
            
            <div className="space-y-3">
              {activities.map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-start gap-3 pb-3"
                  style={{ borderBottom: '1px solid #21262d' }}
                >
                  <span className="text-lg">{ACTIVITY_ICONS[activity.type]}</span>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span 
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{ 
                          background: `${ACTIVITY_COLORS[activity.type]}20`,
                          color: ACTIVITY_COLORS[activity.type]
                        }}
                      >
                        {activity.type.toUpperCase()}
                      </span>
                      <span style={{ color: '#58a6ff', fontSize: '13px', fontWeight: 500 }}>
                        {activity.file}
                      </span>
                      <span style={{ color: '#8b949e', fontSize: '12px' }}>
                        ({formatTime(activity.time)})
                      </span>
                    </div>
                    <p style={{ color: '#c9d1d9', fontSize: '14px', marginTop: '4px' }}>
                      {activity.description}
                    </p>
                  </div>
                  
                  <span 
                    className="text-xs px-2 py-1 rounded"
                    style={{ background: '#21262d', color: '#8b949e' }}
                  >
                    {activity.user}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
