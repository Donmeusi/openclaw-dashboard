const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3001;
const WORKSPACE_PATH = '/Users/donmeusi/.openclaw/workspace';
const PROJECTS_FILE = path.join(WORKSPACE_PATH, 'dashboard', 'projects.json');

// Default empty columns structure
const createDefaultColumns = () => ({
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
});

// Default initial data
const createDefaultProjects = () => ({
  activeProjectId: 'default',
  projects: [
    {
      id: 'default',
      name: '🚀 OpenClaw Dashboard',
      description: 'Dashboard Entwicklung',
      createdAt: new Date().toISOString(),
      columns: {
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
      }
    }
  ]
});

app.use(cors());
app.use(express.json());

// Get list of core markdown files
app.get('/api/files', async (req, res) => {
  try {
    const coreFiles = [
      'MEMORY.md',
      'AGENTS.md',
      'SOUL.md',
      'USER.md',
      'TOOLS.md',
      'IDENTITY.md',
      'HEARTBEAT.md'
    ];
    
    const fileList = await Promise.all(
      coreFiles.map(async (filename) => {
        const filePath = path.join(WORKSPACE_PATH, filename);
        try {
          const stats = await fs.stat(filePath);
          return {
            name: filename,
            path: filename,
            lastModified: stats.mtime,
            size: stats.size,
            exists: true
          };
        } catch {
          return { name: filename, path: filename, exists: false };
        }
      })
    );
    
    res.json(fileList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Read file content
app.get('/api/files/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const safeFilename = path.basename(filename);
    const filePath = path.join(WORKSPACE_PATH, safeFilename);
    
    const content = await fs.readFile(filePath, 'utf-8');
    res.json({ name: safeFilename, content });
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
  }
});

// Write file content
app.post('/api/files/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const { content } = req.body;
    const safeFilename = path.basename(filename);
    const filePath = path.join(WORKSPACE_PATH, safeFilename);
    
    await fs.writeFile(filePath, content, 'utf-8');
    res.json({ success: true, name: safeFilename });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List memory files
app.get('/api/memory', async (req, res) => {
  try {
    const memoryPath = path.join(WORKSPACE_PATH, 'memory');
    const files = await fs.readdir(memoryPath);
    const markdownFiles = files.filter(f => f.endsWith('.md'));
    
    const fileList = await Promise.all(
      markdownFiles.map(async (filename) => {
        const stats = await fs.stat(path.join(memoryPath, filename));
        return {
          name: filename,
          path: `memory/${filename}`,
          lastModified: stats.mtime,
          size: stats.size
        };
      })
    );
    
    res.json(fileList.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Read memory file
app.get('/api/memory/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const safeFilename = path.basename(filename);
    const filePath = path.join(WORKSPACE_PATH, 'memory', safeFilename);
    
    const content = await fs.readFile(filePath, 'utf-8');
    res.json({ name: safeFilename, path: `memory/${safeFilename}`, content });
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
  }
});

// Agent status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'available',
    lastSeen: new Date().toISOString(),
    version: '2026.2.7-multi-project',
    model: 'ollama/kimi-k2.5:cloud',
    uptime: process.uptime(),
    workspace: WORKSPACE_PATH
  });
});

// ============= PROJECTS API =============

// Helper to load projects
async function loadProjects() {
  try {
    const data = await fs.readFile(PROJECTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    const defaults = createDefaultProjects();
    await saveProjects(defaults);
    return defaults;
  }
}

// Helper to save projects
async function saveProjects(data) {
  await fs.writeFile(PROJECTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Get all projects + active project
app.get('/api/projects', async (req, res) => {
  try {
    const data = await loadProjects();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single project
app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await loadProjects();
    const project = data.projects.find(p => p.id === id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new project
app.post('/api/projects/create', async (req, res) => {
  try {
    const { name, description } = req.body;
    const data = await loadProjects();
    
    const newProject = {
      id: 'proj-' + Date.now(),
      name: name || 'Neues Projekt',
      description: description || '',
      createdAt: new Date().toISOString(),
      columns: createDefaultColumns()
    };
    
    data.projects.push(newProject);
    data.activeProjectId = newProject.id; // Auto-switch to new project
    await saveProjects(data);
    
    res.json({ success: true, project: newProject });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update project (columns/tasks)
app.post('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { columns } = req.body;
    const data = await loadProjects();
    
    const projectIndex = data.projects.findIndex(p => p.id === id);
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    data.projects[projectIndex].columns = columns;
    await saveProjects(data);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set active project
app.post('/api/projects/active/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await loadProjects();
    
    const project = data.projects.find(p => p.id === id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    data.activeProjectId = id;
    await saveProjects(data);
    
    res.json({ success: true, activeProjectId: id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete project
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await loadProjects();
    
    const projectIndex = data.projects.findIndex(p => p.id === id);
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    data.projects.splice(projectIndex, 1);
    
    // Switch to another project if active was deleted
    if (data.activeProjectId === id) {
      data.activeProjectId = data.projects[0]?.id || null;
    }
    
    await saveProjects(data);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`OpenClaw Dashboard API running on http://localhost:${PORT}`);
});
