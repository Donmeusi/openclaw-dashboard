import React, { useState } from 'react';

const INITIAL_COLUMNS = {
  todo: {
    id: 'todo',
    title: '📋 To Do',
    items: [
      { id: '1', title: 'Dashboard UI verfeinern', tags: ['ui', 'react'], priority: 'high' },
      { id: '2', title: 'API-Endpoints dokumentieren', tags: ['docs'], priority: 'medium' },
    ]
  },
  progress: {
    id: 'progress',
    title: '🔨 In Progress',
    items: [
      { id: '3', title: 'File-Editor mit Syntax-Highlighting', tags: ['feature'], priority: 'high' },
    ]
  },
  review: {
    id: 'review',
    title: '👀 Review',
    items: [
      { id: '4', title: 'GitHub Dark Theme implementieren', tags: ['design'], priority: 'medium' },
    ]
  },
  done: {
    id: 'done',
    title: '✅ Done',
    items: [
      { id: '5', title: 'Backend API erstellen', tags: ['backend'], priority: 'high' },
      { id: '6', title: 'Projektstruktur aufsetzen', tags: ['setup'], priority: 'high' },
    ]
  }
};

const PRIORITY_COLORS = {
  high: '#f85149',
  medium: '#f0883e',
  low: '#3fb950',
};

const TAG_COLORS = {
  ui: '#58a6ff',
  react: '#61dafb',
  backend: '#238636',
  feature: '#a371f7',
  design: '#ff7b72',
  docs: '#8b949e',
  setup: '#3fb950',
};

export default function ProjectBoard() {
  const [columns, setColumns] = useState(INITIAL_COLUMNS);
  const [newTask, setNewTask] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);

  const handleAddTask = (columnId) => {
    if (!newTask.trim()) return;
    
    const task = {
      id: Date.now().toString(),
      title: newTask,
      tags: ['new'],
      priority: 'medium'
    };
    
    setColumns(prev => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        items: [...prev[columnId].items, task]
      }
    }));
    setNewTask('');
  };

  const handleDragStart = (item, sourceColumn) => {
    setDraggedItem({ item, sourceColumn });
  };

  const handleDrop = (targetColumnId) => {
    if (!draggedItem) return;
    
    const { item, sourceColumn } = draggedItem;
    if (sourceColumn === targetColumnId) return;
    
    setColumns(prev => ({
      ...prev,
      [sourceColumn]: {
        ...prev[sourceColumn],
        items: prev[sourceColumn].items.filter(i => i.id !== item.id)
      },
      [targetColumnId]: {
        ...prev[targetColumnId],
        items: [...prev[targetColumnId].items, item]
      }
    }));
    
    setDraggedItem(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 pb-4 border-b" style={{ borderColor: '#30363d' }}>
        <h2 style={{ color: '#f0f6fc', fontSize: '20px', fontWeight: 600 }}>
          📁 Projekt-Verwaltung
        </h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Neue Aufgabe..."
            style={{
              background: '#0d1117',
              border: '1px solid #30363d',
              borderRadius: '6px',
              padding: '6px 12px',
              color: '#c9d1d9',
              fontSize: '13px',
              width: '200px'
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask('todo')}
          />
          <button 
            onClick={() => handleAddTask('todo')}
            className="github-btn github-btn-primary"
          >
            + Hinzufügen
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-4 gap-4">
        {Object.values(columns).map((column) => (
          <div
            key={column.id}
            className="kanban-column"
            style={{ minHeight: '400px' }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(column.id)}
          >
            <div 
              className="p-3 border-b flex items-center justify-between"
              style={{ borderColor: '#30363d' }}
            >
              <span style={{ color: '#f0f6fc', fontWeight: 600, fontSize: '14px' }}>
                {column.title}
              </span>
              <span 
                className="px-2 py-0.5 rounded-full text-xs"
                style={{ background: '#30363d', color: '#8b949e' }}
              >
                {column.items.length}
              </span>
            </div>

            <div className="p-3 space-y-2">
              {column.items.map((item) => (
                <div
                  key={item.id}
                  className="kanban-card"
                  draggable
                  onDragStart={() => handleDragStart(item, column.id)}
                  style={{
                    opacity: draggedItem?.item.id === item.id ? 0.5 : 1,
                    cursor: 'grab'
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 style={{ color: '#f0f6fc', fontSize: '13px', fontWeight: 500, lineHeight: 1.4 }}>
                      {item.title}
                    </h4>
                    <span 
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: PRIORITY_COLORS[item.priority] }}
                      title={`Priorität: ${item.priority}`}
                    ></span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 rounded text-xs"
                        style={{ 
                          background: `${TAG_COLORS[tag] || '#8b949e'}20`,
                          color: TAG_COLORS[tag] || '#8b949e'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {column.items.length === 0 && (
                <div 
                  className="text-center py-8"
                  style={{ color: '#484f58', fontSize: '13px' }}
                >
                  Keine Einträge
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* File Browser Hint */}
      <div className="mt-6 github-card p-4">
        <h3 style={{ color: '#f0f6fc', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
          📂 File Browser (Coming Soon)
        </h3>
        <p style={{ color: '#8b949e', fontSize: '13px' }}>
          Zukünftig: Durchsuche dein OpenClaw-Workspace direkt im Dashboard.
        </p>
      </div>
    </div>
  );
}
