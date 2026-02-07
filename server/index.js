const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const DEFAULT_PROJECTS = {
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

const app = express();
const PORT = 3001;
const WORKSPACE_PATH = '/Users/donmeusi/.openclaw/workspace';

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
    version: '2026.2.6-3',
    model: 'ollama/kimi-k2.5:cloud',
    uptime: process.uptime(),
    workspace: WORKSPACE_PATH
  });
});

// Get projects data
app.get('/api/projects', async (req, res) => {
  try {
    const projectsPath = path.join(WORKSPACE_PATH, 'dashboard', 'projects.json');
    try {
      const data = await fs.readFile(projectsPath, 'utf-8');
      const projects = JSON.parse(data);
      res.json(projects);
    } catch {
      // Return defaults if file doesn't exist
      res.json(DEFAULT_PROJECTS);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save projects data
app.post('/api/projects', async (req, res) => {
  try {
    const { projects } = req.body;
    const projectsPath = path.join(WORKSPACE_PATH, 'dashboard', 'projects.json');
    
    await fs.writeFile(projectsPath, JSON.stringify(projects, null, 2), 'utf-8');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`OpenClaw Dashboard API running on http://localhost:${PORT}`);
});
