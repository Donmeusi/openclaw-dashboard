import React, { useState, useEffect } from 'react';
import { Folder, FileText, ChevronRight, ChevronDown, RefreshCw } from 'lucide-react';

// Simple syntax highlighting (basic)
const highlightCode = (content, ext) => {
  if (!content) return '';
  
  // Escape HTML
  let html = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Basic highlighting for common types
  if (ext === 'js' || ext === 'jsx' || ext === 'ts') {
    // Keywords
    html = html.replace(/\b(const|let|var|function|return|if|else|for|while|import|export|class|async|await)\b/g, 
      '<span style="color:#ff7b72">$1</span>');
    // Strings
    html = html.replace(/(['"`][^'"`]*['"`])/g, '<span style="color:#a5d6ff">$1</span>');
    // Comments
    html = html.replace(/(\/\/.*$)/gm, '<span style="color:#8b949e">$1</span>');
  }
  
  if (ext === 'json') {
    // Keys
    html = html.replace(/"([^"]+)":/g, '<span style="color:#7ee787">"$1"</span>:');
    // Strings
    html = html.replace(/: "([^"]*)"/g, ': <span style="color:#a5d6ff">"$1"</span>');
    // Numbers
    html = html.replace(/: (\d+)/g, ': <span style="color:#79c0ff">$1</span>');
  }
  
  if (ext === 'md') {
    // Headers
    html = html.replace(/^(#{1,6}\s+)(.*)$/gm, '<span style="color:#ff7b72">$1</span><span style="color:#d29922;font-weight:bold">$2</span>');
  }
  
  if (ext === 'sql') {
    // Keywords
    html = html.replace(/\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|ORDER|BY|GROUP|JOIN|CREATE|TABLE|VALUES)\b/gi,
      '<span style="color:#ff7b72">$1</span>');
  }
  
  return html;
};

export default function FileBrowser() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [currentPath, setCurrentPath] = useState('');
  const [items, setItems] = useState([]);
  const [expandedDirs, setExpandedDirs] = useState(new Set());
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadDirectory('');
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/projects');
      const data = await res.json();
      setProjects(data.projects || []);
      if (data.projects?.length > 0) {
        setSelectedProject(data.projects[0].id);
      }
    } catch (err) {
      setError('Projekte konnten nicht geladen werden');
    }
  };

  const loadDirectory = async (path) => {
    if (!selectedProject) return;
    
    try {
      const encodedPath = path ? encodeURIComponent(path) : '';
      const url = `http://localhost:3001/api/files/${selectedProject}${encodedPath ? '/' + encodedPath : '/'}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load');
      
      const data = await res.json();
      
      if (data.type === 'directory') {
        setItems(data.items || []);
        setCurrentPath(path);
        setSelectedFile(null);
        setFileContent('');
      } else {
        // It's a file
        setSelectedFile({ name: data.name, path: data.path, extension: data.extension });
        setFileContent(data.content || '');
      }
    } catch (err) {
      setError(`Fehler beim Laden: ${path || 'Root'}`);
      console.error(err);
    }
  };

  const toggleDir = (itemPath) => {
    if (expandedDirs.has(itemPath)) {
      const newSet = new Set(expandedDirs);
      newSet.delete(itemPath);
      setExpandedDirs(newSet);
    } else {
      setExpandedDirs(new Set([...expandedDirs, itemPath]));
      loadDirectory(itemPath);
    }
  };

  const handleItemClick = (item) => {
    if (item.type === 'directory') {
      toggleDir(item.path);
    } else {
      loadDirectory(item.path);
    }
  };

  const getFileIcon = (name, type) => {
    if (type === 'directory') {
      return <Folder size={16} style={{ color: '#58a6ff' }} />;
    }
    return <FileText size={16} style={{ color: '#8b949e' }} />;
  };

  const renderTree = () => {
    return items.map(item => {
      const isExpanded = expandedDirs.has(item.path);
      const paddingLeft = 12 + (item.path.split('/').length - 1) * 16;
      
      return (
        <div key={item.path}>
          <div
            onClick={() => handleItemClick(item)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '4px 8px',
              paddingLeft: `${paddingLeft}px`,
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--color-text)',
              background: selectedFile?.path === item.path ? 'var(--color-surface-hover)' : 'transparent',
              borderRadius: '4px',
              margin: '1px 0'
            }}
            onMouseEnter={e => e.target.style.background = 'var(--color-surface-hover)'}
            onMouseLeave={e => e.target.style.background = selectedFile?.path === item.path ? 'var(--color-surface-hover)' : 'transparent'}
          >
            <span style={{ marginRight: '6px', display: 'flex' }}>
              {item.type === 'directory' && (
                isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
              )}
            </span>
            {getFileIcon(item.name, item.type)}
            <span style={{ marginLeft: '6px' }}>{item.name}</span>
          </div>
          
          {item.type === 'directory' && isExpanded && expandedDirs.has(item.path) && (
            <div style={{ marginLeft: '16px' }}>
              {/* Subdirectory items loaded by clicking */}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ 
        padding: '12px', 
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
      }}>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          style={{
            flex: 1,
            padding: '6px 8px',
            background: 'var(--color-input-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            color: 'var(--color-text)',
            fontSize: '13px'
          }}
        >
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        
        <button
          onClick={() => loadDirectory(currentPath)}
          style={{
            padding: '6px',
            background: 'transparent',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            cursor: 'pointer',
            color: 'var(--color-text)'
          }}
          title="Aktualisieren"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Breadcrumb */}
      {currentPath && (
        <div style={{ 
          padding: '8px 12px', 
          fontSize: '12px',
          color: 'var(--color-text-muted)',
          borderBottom: '1px solid var(--color-border)'
        }}>
          📁 {selectedProject} / {currentPath}
        </div>
      )}

      {/* File Tree or File Content */}
      {selectedFile ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* File Header */}
          <div style={{
            padding: '12px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={16} />
              <span style={{ fontWeight: 500 }}>{selectedFile.name}</span>
              <span style={{ 
                fontSize: '11px', 
                padding: '2px 6px',
                background: 'var(--color-surface-hover)',
                borderRadius: '4px',
                textTransform: 'uppercase'
              }}>
                {selectedFile.extension}
              </span>
            </div>
            <button
              onClick={() => { setSelectedFile(null); setFileContent(''); }}
              style={{
                padding: '4px 12px',
                fontSize: '12px',
                background: 'var(--color-surface-hover)',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                cursor: 'pointer',
                color: 'var(--color-text)'
              }}
            >
              ← Zurück
            </button>
          </div>
          
          {/* File Content */}
          <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
            <pre style={{
              margin: 0,
              fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, monospace',
              fontSize: '13px',
              lineHeight: '1.5',
              color: 'var(--color-text)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              <code 
                dangerouslySetInnerHTML={{ 
                  __html: highlightCode(fileContent, selectedFile.extension) 
                }}
              />
            </pre>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
          {items.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              color: 'var(--color-text-muted)'
            }}>
              {error || 'Keine Dateien'}
            </div>
          ) : (
            renderTree()
          )}
        </div>
      )}
    </div>
  );
}
