import React, { useState, useEffect } from 'react';
import { fetchFileContent, saveFile } from '../utils/api';

export default function FileEditor({ filename }) {
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFile();
  }, [filename]);

  const loadFile = async () => {
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const data = await fetchFileContent(filename);
      setContent(data.content);
      setOriginalContent(data.content);
    } catch (err) {
      setError(err.message);
      setContent('');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await saveFile(filename.replace('memory/', ''), content);
      setOriginalContent(content);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError('Speichern fehlgeschlagen: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const isDirty = content !== originalContent;
  const filenameDisplay = filename.replace('memory/', '');

  // Simple markdown highlighting (preview mode) - theme-aware
  const renderPreview = (text) => {
    return text
      .replace(/^(#{1,6})\s(.+)$/gm, (_, hashes, title) => {
        const level = hashes.length;
        const sizes = { 1: '28px', 2: '24px', 3: '20px', 4: '18px', 5: '16px', 6: '14px' };
        return `<h${level} style="color:var(--color-text);font-size:${sizes[level]};margin:16px 0 8px 0;border-bottom:1px solid var(--color-border);padding-bottom:8px;">${title}</h${level}>`;
      })
      .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--color-text);">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em style="color:var(--color-muted);">$1</em>')
      .replace(/`(.+?)`/g, '<code style="background:var(--color-btn-bg);padding:2px 6px;border-radius:3px;color:var(--color-accent);font-size:12px;">$1</code>')
      .replace(/^- \[(x| )\]\s(.+)$/gm, (_, checked, text) => {
        const isChecked = checked === 'x';
        return `<div style="display:flex;align-items:center;gap:8px;margin:4px 0;"><span style="color:${isChecked ? '#3fb950' : 'var(--color-muted)'}">${isChecked ? '☑' : '☐'}</span><span style="${isChecked ? 'text-decoration:line-through;color:var(--color-muted);' : ''}">${text}</span></div>`;
      })
      .replace(/^-\s(.+)$/gm, '<li style="margin:4px 0;color:var(--color-text);">• $1</li>')
      .replace(/\n/g, '<br>');
  };

  const [showPreview, setShowPreview] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ color: 'var(--color-muted)' }}>
        <div className="animate-pulse flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-accent)' }}></span>
          Lade {filenameDisplay}...
        </div>
      </div>
    );
  }

  if (error && !content) {
    return (
      <div className="github-card p-6" style={{ color: '#f85149' }}>
        <p className="font-semibold mb-2">Fehler beim Laden</p>
        <p style={{ color: 'var(--color-muted)' }}>{error}</p>
        <button onClick={loadFile} className="github-btn mt-4">
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <h2 style={{ color: 'var(--color-text)', fontSize: '20px', fontWeight: 600 }}>
            {filenameDisplay}
          </h2>
          {isDirty && (
            <span 
              className="px-2 py-1 rounded text-xs"
              style={{ background: 'rgba(240, 136, 62, 0.2)', color: '#f0883e' }}
            >
              Geändert
            </span>
          )}
          {saved && (
            <span 
              className="px-2 py-1 rounded text-xs"
              style={{ background: 'rgba(35, 134, 54, 0.2)', color: '#3fb950' }}
            >
              ✓ Gespeichert
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="github-btn"
            style={{ background: showPreview ? 'var(--color-btn-hover)' : 'var(--color-btn-bg)' }}
          >
            {showPreview ? '✏️ Bearbeiten' : '👁️ Vorschau'}
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="github-btn github-btn-primary"
            style={{ opacity: !isDirty || saving ? 0.5 : 1 }}
          >
            {saving ? '💾 Speichern...' : '💾 Speichern'}
          </button>
        </div>
      </div>

      {/* Editor / Preview */}
      {showPreview ? (
        <div 
          className="github-card p-6"
          style={{ minHeight: '400px' }}
          dangerouslySetInnerHTML={{ __html: renderPreview(content) }}
        />
      ) : (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="editor-textarea"
          placeholder="Markdown-Inhalt..."
          spellCheck={false}
        />
      )}

      {/* Stats */}
      <div className="mt-3 text-xs" style={{ color: 'var(--color-muted)' }}>
        {content.length} Zeichen • {content.split('\n').length} Zeilen
        {filename.startsWith('memory/') && (
          <span className="ml-3">📁 Memory-Log</span>
        )}
      </div>
    </div>
  );
}
