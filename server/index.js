const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

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

app.listen(PORT, () => {
  console.log(`OpenClaw Dashboard API running on http://localhost:${PORT}`);
});
