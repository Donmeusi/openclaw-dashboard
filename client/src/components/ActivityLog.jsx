import React, { useState, useEffect } from 'react';
import { fetchMemory } from '../utils/api';

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

// Generate activities from memory file metadata
function generateActivities(memoryFiles) {
  const activities = [];
  
  // Add file creation/modification activities
  memoryFiles.forEach((file, index) => {
    const date = new Date(file.lastModified);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    activities.push({
      id: `mem-${index}`,
      type: 'create',
      file: file.name,
      description: isToday ? 'Heute aktualisiert' : 'Memory-Log erstellt',
      time: file.lastModified,
      user: 'Nova'
    });
  });
  
  // Add current session activity
  activities.unshift({
    id: 'current-1',
    type: 'edit',
    file: 'openclaw-dashboard',
    description: 'Dashboard auf GitHub veröffentlicht',
    time: new Date().toISOString(),
    user: 'Nova'
  });
  
  return activities.sort((a, b) => new Date(b.time) - new Date(a.time));
}

export default function ActivityLog() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const memoryFiles = await fetchMemory();
      const generated = generateActivities(memoryFiles);
      setActivities(generated);
    } catch (err) {
      console.error('Failed to load activities:', err);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Group by date
  const grouped = activities.reduce((acc, activity) => {
    const date = formatDate(activity.time);
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {});

  if (loading) {
    return (
      <div style={{ color: 'var(--color-muted)', padding: '20px' }}>
        Aktivitäten werden geladen...
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div>
        <h2 style={{ color: 'var(--color-text)', fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
          Aktivitäts-Log
        </h2>
        <div className="github-card p-4" style={{ color: 'var(--color-muted)' }}>
          Keine Aktivitäten vorhanden.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <h2 style={{ color: 'var(--color-text)', fontSize: '20px', fontWeight: 600 }}>
          Aktivitäts-Log
        </h2>
        <span style={{ color: 'var(--color-muted)', fontSize: '13px' }}>
          {activities.length} Einträge
        </span>
      </div>

      <div className="space-y-4">
        {Object.entries(grouped).map(([date, dayActivities]) => (
          <div key={date} className="github-card p-4">
            <h3 
              className="text-sm font-semibold mb-3 pb-2 border-b"
              style={{ color: 'var(--color-muted)', borderColor: 'var(--color-border)' }}
            >
              {date}
            </h3>
            
            <div className="space-y-3">
              {dayActivities.map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-start gap-3 pb-3"
                  style={{ borderBottom: '1px solid var(--color-border)' }}
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
                      <span style={{ color: 'var(--color-accent)', fontSize: '13px', fontWeight: 500 }}>
                        {activity.file}
                      </span>
                      <span style={{ color: 'var(--color-muted)', fontSize: '12px' }}>
                        ({formatTime(activity.time)})
                      </span>
                    </div>
                    <p style={{ color: 'var(--color-text)', fontSize: '14px', marginTop: '4px' }}>
                      {activity.description}
                    </p>
                  </div>
                  
                  <span 
                    className="text-xs px-2 py-1 rounded"
                    style={{ background: 'var(--color-btn-bg)', color: 'var(--color-muted)' }}
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
