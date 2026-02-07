import React, { useState, useEffect } from 'react';
import { fetchProjects, saveProject, createProject, deleteProject, setActiveProject } from '../utils/api';

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
  ux: '#d29922',
  integration: '#39d0d8',
  new: '#6e7681',
};

const INITIAL_COLUMNS = {
  todo: {
    id: 'todo',
    title: '📋 To Do',
    items: []
  },
  progress: {
    id: 'progress',
    title: '🔨 In Progress',
    items: []
  },
  review: {
    id: 'review',
    title: '👀 Review',
    items: []
  },
  done: {
    id: 'done',
    title: '✅ Done',
    items: []
  }
};

export default function ProjectBoard() {
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [columns, setColumns] = useState(INITIAL_COLUMNS);
  const [newTask, setNewTask] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const activeProject = projects.find(p => p.id === activeProjectId);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await fetchProjects();
      setProjects(data.projects || []);
      const activeId = data.activeProjectId || data.projects?.[0]?.id;
      setActiveProjectId(activeId);
      
      const activeProj = data.projects?.find(p => p.id === activeId);
      if (activeProj?.columns) {
        setColumns(activeProj.columns);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
      setProjects([]);
      setColumns(INITIAL_COLUMNS);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSwitch = async (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setActiveProjectId(projectId);
      setColumns(project.columns || INITIAL_COLUMNS);
      await setActiveProject(projectId);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    
    setLoading(true);
    try {
      const result = await createProject(newProjectName, newProjectDesc);
      if (result.success) {
        await loadProjects();
        setShowNewProject(false);
        setNewProjectName('');
        setNewProjectDesc('');
      }
    } catch (err) {
      console.error('Failed to create project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Projekt wirklich löschen?')) return;
    
    setLoading(true);
    try {
      await deleteProject(projectId);
      await loadProjects();
    } catch (err) {
      console.error('Failed to delete project:', err);
    } finally {
      setLoading(false);
    }
  };

  const persistColumns = async (newColumns) => {
    if (!activeProjectId) return;
    
    setSaving(true);
    try {
      await saveProject(activeProjectId, newColumns);
    } catch (err) {
      console.error('Failed to save columns:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddTask = (columnId) => {
    if (!newTask.trim()) return;
    
    const task = {
      id: Date.now().toString(),
      title: newTask,
      tags: ['new'],
      priority: 'medium'
    };
    
    const updated = {
      ...columns,
      [columnId]: {
        ...columns[columnId],
        items: [...columns[columnId].items, task]
      }
    };
    
    setColumns(updated);
    persistColumns(updated);
    setNewTask('');
  };

  const handleDragStart = (item, sourceColumn) => {
    setDraggedItem({ item, sourceColumn });
  };

  const handleDrop = (targetColumnId) => {
    if (!draggedItem) return;
    
    const { item, sourceColumn } = draggedItem;
    if (sourceColumn === targetColumnId) return;
    
    const updated = {
      ...columns,
      [sourceColumn]: {
        ...columns[sourceColumn],
        items: columns[sourceColumn].items.filter(i => i.id !== item.id)
      },
      [targetColumnId]: {
        ...columns[targetColumnId],
        items: [...columns[targetColumnId].items, item]
      }
    };
    
    setColumns(updated);
    persistColumns(updated);
    setDraggedItem(null);
  };

  const handleDeleteTask = (columnId, taskId) => {
    const updated = {
      ...columns,
      [columnId]: {
        ...columns[columnId],
        items: columns[columnId].items.filter(i => i.id !== taskId)
      }
    };
    setColumns(updated);
    persistColumns(updated);
  };

  if (loading) {
    return (
      <div style={{ color: '#8b949e', padding: '40px', textAlign: 'center' }}>
        Projekte werden geladen...
      </div>
    );
  }

  return (
    <div>
      {/* Header with Project Selector */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b" style={{ borderColor: '#30363d' }}>
        <div className="flex items-center gap-3">
          <h2 style={{ color: '#f0f6fc', fontSize: '20px', fontWeight: 600 }}>
            📁 Projekt-Verwaltung
          </h2>
          
          {/* Project Dropdown */}
          <select
            value={activeProjectId || ''}
            onChange={(e) => handleProjectSwitch(e.target.value)}
            style={{
              background: '#0d1117',
              border: '1px solid #30363d',
              borderRadius: '6px',
              padding: '6px 12px',
              color: '#c9d1d9',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          
          <button
            onClick={() => setShowNewProject(true)}
            style={{
              background: '#238636',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              color: '#fff',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            + Neu
          </button>
          
          {projects.length > 1 && (
            <button
              onClick={() => handleDeleteProject(activeProjectId)}
              style={{
                background: '#21262d',
                border: '1px solid #f85149',
                borderRadius: '6px',
                padding: '6px 12px',
                color: '#f85149',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              🗑️ Löschen
            </button>
          )}
          
          {saving && (
            <span style={{ color: '#8b949e', fontSize: '12px' }}>
              💾 Speichern...
            </span>
          )}
        </div>
        
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

      {/* Project Description */}
      {activeProject?.description && (
        <div style={{ color: '#8b949e', fontSize: '13px', marginBottom: '16px' }}>
          {activeProject.description}
        </div>
      )}

      {/* New Project Modal */}
      {showNewProject && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '8px',
            padding: '24px',
            width: '400px'
          }}>
            <h3 style={{ color: '#f0f6fc', marginBottom: '16px' }}>
              Neues Projekt erstellen
            </h3>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Projektname..."
              style={{
                background: '#0d1117',
                border: '1px solid #30363d',
                borderRadius: '6px',
                padding: '8px 12px',
                color: '#c9d1d9',
                width: '100%',
                marginBottom: '12px'
              }}
            />
            <input
              type="text"
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              placeholder="Beschreibung (optional)..."
              style={{
                background: '#0d1117',
                border: '1px solid #30363d',
                borderRadius: '6px',
                padding: '8px 12px',
                color: '#c9d1d9',
                width: '100%',
                marginBottom: '16px'
              }}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowNewProject(false)}
                style={{
                  background: '#21262d',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  color: '#c9d1d9',
                  cursor: 'pointer'
                }}
              >
                Abbrechen
              </button>
              <button
                onClick={handleCreateProject}
                style={{
                  background: '#238636',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                Erstellen
              </button>
            </div>
          </div>
        </div>
      )}

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
                    <h4 style={{ color: '#f0f6fc', fontSize: '13px', fontWeight: 500, lineHeight: 1.4, flex: 1 }}>
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-1">
                      <span 
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: PRIORITY_COLORS[item.priority] }}
                        title={`Priorität: ${item.priority}`}
                      ></span>
                      <button
                        onClick={() => handleDeleteTask(column.id, item.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#8b949e',
                          cursor: 'pointer',
                          fontSize: '12px',
                          padding: '0 4px'
                        }}
                        title="Löschen"
                      >
                        ×
                      </button>
                    </div>
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
    </div>
  );
}
