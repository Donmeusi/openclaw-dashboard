import React from 'react';

export default function StatusBar({ status, theme, onToggleTheme }) {
  if (!status) {
    return (
      <header 
        className="px-6 py-3 flex items-center justify-between border-b"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full" style={{ background: 'var(--color-muted)' }}></div>
          <span style={{ color: 'var(--color-muted)' }}>Verbindung wird hergestellt...</span>
        </div>
      </header>
    );
  }

  const isAvailable = status.status === 'available';
  const lastSeen = new Date(status.lastSeen).toLocaleTimeString('de-DE');

  return (
    <header 
      className="px-6 py-3 flex items-center justify-between border-b"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center gap-4">
        <div className={`status-badge ${isAvailable ? 'status-available' : 'status-busy'}`}>
          <span className={`w-2 h-2 rounded-full ${isAvailable ? 'animate-pulse' : ''}`}
            style={{ background: isAvailable ? '#3fb950' : '#f85149' }}>
          </span>
          {isAvailable ? 'Verfügbar' : 'Beschäftigt'}
        </div>
        
        <span style={{ color: 'var(--color-muted)', fontSize: '13px' }}>
          Letzte Aktivität: {lastSeen}
        </span>
      </div>

      <div className="flex items-center gap-4" style={{ fontSize: '13px' }}>
        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          style={{
            background: 'var(--color-btn-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            padding: '5px 10px',
            color: 'var(--color-text)',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          title={theme === 'dark' ? 'Zu Light Mode wechseln' : 'Zu Dark Mode wechseln'}
        >
          <span>{theme === 'dark' ? '🌙' : '☀️'}</span>
          <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
        </button>
        
        <span style={{ color: 'var(--color-muted)' }}>
          Model: <span style={{ color: 'var(--color-text)' }}>{status.model}</span>
        </span>
        <span style={{ color: 'var(--color-muted)' }}>
          Version: <span style={{ color: 'var(--color-text)' }}>{status.version}</span>
        </span>
      </div>
    </header>
  );
}
