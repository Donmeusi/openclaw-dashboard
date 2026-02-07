import React from 'react';

const CORE_FILES = [
  { name: 'MEMORY.md', icon: '🧠', label: 'Memory' },
  { name: 'AGENTS.md', icon: '🤖', label: 'Agents' },
  { name: 'SOUL.md', icon: '✨', label: 'Soul' },
  { name: 'USER.md', icon: '👤', label: 'User' },
  { name: 'TOOLS.md', icon: '🧰', label: 'Tools' },
  { name: 'IDENTITY.md', icon: '🆔', label: 'Identity' },
  { name: 'HEARTBEAT.md', icon: '💓', label: 'Heartbeat' },
];

export default function Sidebar({ activeTab, setActiveTab, files, selectedFile, onSelectFile }) {
  const existingFiles = files.filter(f => f.exists).map(f => f.name);
  
  return (
    <aside 
      className="w-64 flex-shrink-0 overflow-y-auto"
      style={{ 
        background: '#161b22', 
        borderRight: '1px solid #30363d'
      }}
    >
      <div className="p-4">
        <h1 
          className="text-lg font-semibold mb-6 flex items-center gap-2"
          style={{ color: '#f0f6fc' }}
        >
          <span style={{ color: '#58a6ff' }}>⚡</span>
          OpenClaw Dashboard
        </h1>

        {/* Navigation */}
        <nav className="space-y-1 mb-6">
          <button
            onClick={() => setActiveTab('editor')}
            className={`sidebar-link w-full text-left ${activeTab === 'editor' ? 'active' : ''}`}
          >
            <span>📝</span>
            Editor
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`sidebar-link w-full text-left ${activeTab === 'activity' ? 'active' : ''}`}
          >
            <span>📊</span>
            Aktivitäten
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`sidebar-link w-full text-left ${activeTab === 'projects' ? 'active' : ''}`}
          >
            <span>📁</span>
            Projekte
          </button>
        </nav>

        {/* Core Files */}
        <div className="mb-6">
          <h3 
            className="text-xs font-semibold uppercase tracking-wide mb-2 px-3"
            style={{ color: '#8b949e' }}
          >
            Core Files
          </h3>
          <div className="space-y-1">
            {CORE_FILES.map((file) => {
              const exists = existingFiles.includes(file.name);
              return (
                <button
                  key={file.name}
                  onClick={() => onSelectFile(file.name)}
                  className={`sidebar-link w-full text-left ${selectedFile === file.name ? 'active' : ''}`}
                  style={{ opacity: exists ? 1 : 0.5 }}
                  title={exists ? file.name : `${file.name} (nicht vorhanden)`}
                >
                  <span>{file.icon}</span>
                  <span className="flex-1">{file.label}</span>
                  {!exists && <span style={{ color: '#8b949e', fontSize: '10px' }}>✗</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Memory Files */}
        <div>
          <h3 
            className="text-xs font-semibold uppercase tracking-wide mb-2 px-3"
            style={{ color: '#8b949e' }}
          >
            Memory Log
          </h3>
          <div className="space-y-1">
            {files
              .filter(f => f.name.startsWith('2026-'))
              .slice(0, 5)
              .map((file) => (
                <button
                  key={file.name}
                  onClick={() => onSelectFile(`memory/${file.name}`)}
                  className="sidebar-link w-full text-left text-xs"
                >
                  <span>📄</span>
                  {file.name.replace('.md', '')}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div 
        className="p-4 mt-auto border-t text-xs"
        style={{ borderColor: '#30363d', color: '#8b949e' }}
      >
        <p>v1.0.0 • GitHub Dark</p>
      </div>
    </aside>
  );
}
