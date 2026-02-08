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
  const isCoreFile = !isMemoryFile && !filename.includes('/');  // Core files have no path separator
  
  let endpoint;
  if (isMemoryFile) {
    endpoint = `${API_BASE}/memory/${filename.replace('memory/', '')}`;
  } else if (isCoreFile) {
    endpoint = `${API_BASE}/core/${filename}`;  // NEW: Core files route
  } else {
    endpoint = `${API_BASE}/files/${filename}`;
  }
  
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error('File fetch failed');
  return res.json();
}

export async function saveFile(filename, content) {
  const isCoreFile = !filename.includes('/');  // Core files have no path separator
  const endpoint = isCoreFile 
    ? `${API_BASE}/core/${filename}`  // NEW: Core files route
    : `${API_BASE}/files/${filename}`;
  
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error('Save failed');
  return res.json();
}

// ============ PROJECTS API ============

export async function fetchProjects() {
  const res = await fetch(`${API_BASE}/projects`);
  if (!res.ok) throw new Error('Projects fetch failed');
  return res.json();
}

export async function fetchProject(id) {
  const res = await fetch(`${API_BASE}/projects/${id}`);
  if (!res.ok) throw new Error('Project fetch failed');
  return res.json();
}

export async function createProject(name, description = '') {
  const res = await fetch(`${API_BASE}/projects/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) throw new Error('Create project failed');
  return res.json();
}

export async function saveProject(id, columns) {
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ columns }),
  });
  if (!res.ok) throw new Error('Save project failed');
  return res.json();
}

export async function setActiveProject(id) {
  const res = await fetch(`${API_BASE}/projects/active/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Set active project failed');
  return res.json();
}

export async function deleteProject(id) {
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Delete project failed');
  return res.json();
}
