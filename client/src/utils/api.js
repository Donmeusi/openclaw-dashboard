const API_BASE = 'http://localhost:3001/api';

export async function fetchStatus() {
  const res = await fetch(`${API_BASE}/status`);
  if (!res.ok) throw new Error('Status fetch failed');
  return res.json();
}

export async function fetchFiles() {
  const res = await fetch(`${API_BASE}/files`);
  if (!res.ok) throw new Error('Files fetch failed');
  return res.json();
}

export async function fetchMemory() {
  const res = await fetch(`${API_BASE}/memory`);
  if (!res.ok) throw new Error('Memory fetch failed');
  return res.json();
}

export async function fetchFileContent(filename) {
  const isMemoryFile = filename.startsWith('memory/');
  const endpoint = isMemoryFile 
    ? `${API_BASE}/memory/${filename.replace('memory/', '')}`
    : `${API_BASE}/files/${filename}`;
  
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error('File fetch failed');
  return res.json();
}

export async function saveFile(filename, content) {
  const res = await fetch(`${API_BASE}/files/${filename}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error('Save failed');
  return res.json();
}

// Project Board API
export async function fetchProjects() {
  const res = await fetch(`${API_BASE}/projects`);
  if (!res.ok) throw new Error('Projects fetch failed');
  return res.json();
}

export async function saveProjects(projects) {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projects }),
  });
  if (!res.ok) throw new Error('Save projects failed');
  return res.json();
}
