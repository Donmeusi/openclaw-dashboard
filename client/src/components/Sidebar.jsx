import React from 'react';

export default function Sidebar({ activeTab, setActiveTab, files, selectedFile, onSelectFile }) {
  const coreFiles = [
    { name: 'MEMORY.md', icon: '🧠', label: 'Memory' },
    { name: 'AGENTS.md', icon: '🤖', label: 'Agents' },
    { name: 'SOUL.md', icon: '✨', label: 'Soul' },
    { name: 'USER.md', icon: '👤', label: 'User' },
    { name: 'TOOLS.md', icon: '🧰', label: 'Tools' },
    { name: 'IDENTITY.md', icon: '🆔', label: 'Identity' },
    { name: 'HEARTBEAT.md', icon: '💓', label: 'Heartbeat' },
  ];

  const memoryFiles = files.filter(f => f.name.startsWith('202'));

  return (
    <aside 
      className="w-64 flex flex-col border-r"
      style={{ 
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)'
      }}
    >
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <h1 style={{ color: 'var(--color-text)', fontSize: '18px', fontWeight: 600 }}>
          ⚡ OpenClaw Dashboard
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          <button
            onClick={() => setActiveTab('editor')}
            className={`sidebar-link w-full text-left ${activeTab === 'editor' ? 'active' : ''}`}
            style={{ color: 'var(--color-text)' }}
          >
            📝 Editor
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`sidebar-link w-full text-left ${activeTab === 'activity' ? 'active' : ''}`}
            style={{ color: 'var(--color-text)' }}
          >
            📊 Aktivitäten
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`sidebar-link w-full text-left ${activeTab === 'projects' ? 'active' : ''}`}
            style={{ color: 'var(--color-text)' }}
          >
            📁 Projekte
          </button>
        </div>

        <div className="mt-6">
          <h3 
            className="px-3 text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: 'var(--color-muted)' }}
          >
            Core Files
          </h3>
          <div className="space-y-1">
            {coreFiles.map((file) => (
              <button
                key={file.name}
                onClick={() => onSelectFile(file.name)}
                className={`sidebar-link w-full text-left ${selectedFile === file.name ? 'active' : ''}`}
                style={{ color: 'var(--color-text)' }}
              >
                <span>{file.icon}</span>
                <span>{file.label}</span>
              </button>
            ))}
          </div>
        </div>

        {memoryFiles.length > 0 && (
          <div className="mt-6">
            <h3 
              className="px-3 text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--color-muted)' }}
            >
              Memory Log
            </h3>
            <div className="space-y-1">
              {memoryFiles.slice(0, 5).map((file) => (
                <button
                  key={file.name}
                  onClick={() => onSelectFile(file.path)}
                  className={`sidebar-link w-full text-left ${selectedFile === file.path ? 'active' : ''}`}
                  style={{ color: 'var(--color-text)', fontSize: '13px' }}
                >
                  <span>📝</span>
                  <span>{file.name.replace('.md', '')}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}
