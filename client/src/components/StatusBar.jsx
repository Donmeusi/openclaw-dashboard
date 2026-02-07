import React from 'react';

export default function StatusBar({ status }) {
  if (!status) {
    return (
      <header 
        className="px-6 py-3 flex items-center justify-between border-b"
        style={{ background: '#161b22', borderColor: '#30363d' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full" style={{ background: '#8b949e' }}></div>
          <span style={{ color: '#8b949e' }}>Verbindung wird hergestellt...</span>
        </div>
      </header>
    );
  }

  const isAvailable = status.status === 'available';
  const lastSeen = new Date(status.lastSeen).toLocaleTimeString('de-DE');

  return (
    <header 
      className="px-6 py-3 flex items-center justify-between border-b"
      style={{ background: '#161b22', borderColor: '#30363d' }}
    >
      <div className="flex items-center gap-4">
        <div className={`status-badge ${isAvailable ? 'status-available' : 'status-busy'}`}>
          <span className={`w-2 h-2 rounded-full ${isAvailable ? 'animate-pulse' : ''}`}
            style={{ background: isAvailable ? '#3fb950' : '#f85149' }}>
          </span>
          {isAvailable ? 'Verfügbar' : 'Beschäftigt'}
        </div>
        
        <span style={{ color: '#8b949e', fontSize: '13px' }}>
          Letzte Aktivität: {lastSeen}
        </span>
      </div>

      <div className="flex items-center gap-4" style={{ fontSize: '13px' }}>
        <span style={{ color: '#8b949e' }}>
          Model: <span style={{ color: '#c9d1d9' }}>{status.model}</span>
        </span>
        <span style={{ color: '#8b949e' }}>
          Version: <span style={{ color: '#c9d1d9' }}>{status.version}</span>
        </span>
      </div>
    </header>
  );
}
