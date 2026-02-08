const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const chokidar = require(path.join(__dirname, '..', 'node_modules', 'chokidar'));

const app = express();
const PORT = 3001;
const WORKSPACE_PATH = '/Users/donmeusi/.openclaw/workspace';
const PROJECTS_DIR = path.join(WORKSPACE_PATH, 'projects');
const PROJECTS_FILE = path.join(WORKSPACE_PATH, 'dashboard', 'projects.json');
const ACTIVITY_FILE = path.join(WORKSPACE_PATH, 'dashboard', 'activity.json');

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

// Core files route (for MEMORY.md, SOUL.md, etc.)
// NEW: Separate route to avoid collision with File Browser
app.get('/api/core/:filename', async (req, res) => {
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

// Write core file content
app.post('/api/core/:filename', async (req, res) => {
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
    version: '2026.2.8-theme-toggle',
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

// ============= ACTIVITY LOG API =============

// Load activities
async function loadActivities() {
  try {
    const data = await fs.readFile(ACTIVITY_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { activities: [] };
  }
}

// Save activities
async function saveActivities(data) {
  await fs.writeFile(ACTIVITY_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Get all activities
app.get('/api/activities', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const data = await loadActivities();
    const sorted = data.activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json({ activities: sorted.slice(0, parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API Alias for Alex-compatibility
app.get('/api/activity', async (req, res) => {
  req.url = '/api/activities';
  app._router.handle(req, res);
});

// Add new activity
app.post('/api/activities', async (req, res) => {
  try {
    const { type, title, description, project } = req.body;
    const data = await loadActivities();
    
    const newActivity = {
      id: 'act-' + Date.now(),
      type: type || 'edit',
      title: title || 'Aktivität',
      description: description || '',
      project: project || 'default',
      timestamp: new Date().toISOString(),
      user: 'Nova'
    };
    
    data.activities.push(newActivity);
    await saveActivities(data);
    
    res.status(201).json(newActivity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ AUTO-DISCOVERY ============

// Extract project info from README
function extractProjectInfo(readmeContent, projectId) {
  const lines = readmeContent.split('\n').filter(l => l.trim());
  
  // First # line = title
  const titleMatch = lines.find(l => l.startsWith('# '));
  const name = titleMatch ? titleMatch.replace('# ', '').trim() : projectId;
  
  // Next non-empty, non-header line = description
  const descLine = lines.find(l => l.trim() && !l.startsWith('#') && !l.startsWith('---'));
  const description = descLine ? descLine.trim().slice(0, 200) : '';
  
  return { name, description };
}

// Check if project already exists
async function projectExists(projectId) {
  try {
    const data = await loadProjects();
    return data.projects.some(p => p.id === projectId);
  } catch {
    return false;
  }
}

// Create project from discovered directory
async function createDiscoveredProject(projectPath) {
  const projectId = path.basename(projectPath);
  
  if (await projectExists(projectId)) {
    return null; // Already exists
  }
  
  try {
    // Read README
    const readmePath = path.join(projectPath, 'README.md');
    let name = projectId;
    let description = 'Auto-discovered project';
    
    try {
      const readme = await fs.readFile(readmePath, 'utf-8');
      const info = extractProjectInfo(readme, projectId);
      name = info.name;
      description = info.description;
    } catch {
      // No README, use defaults
    }
    
    // Create project
    const projectsData = await loadProjects();
    
    const newProject = {
      id: projectId,
      name: `📁 ${name}`,
      description,
      projectPath: projectPath,  // ← Alex-compatibility
      createdAt: new Date().toISOString(),
      autoDiscovered: true,
      columns: createDefaultColumns()
    };
    
    projectsData.projects.push(newProject);
    await saveProjects(projectsData);
    
    // Log activity
    const activityData = await loadActivities();
    activityData.activities.push({
      id: 'act-' + Date.now(),
      type: 'create',
      title: `🔍 Auto-entdeckt: ${name}`,
      description: `Projekt aus ${PROJECTS_DIR}/${projectId} automatisch hinzugefügt`,
      project: projectId,
      timestamp: new Date().toISOString(),
      user: 'Nova'
    });
    await saveActivities(activityData);
    
    console.log(`[Auto-Discovery] ✅ Created project: ${name} (${projectId})`);
    return newProject;
    
  } catch (error) {
    console.error(`[Auto-Discovery] ❌ Error creating project ${projectId}:`, error.message);
    return null;
  }
}

// Initialize file watcher
function initProjectWatcher() {
  // Ensure projects directory exists
  fs.mkdir(PROJECTS_DIR, { recursive: true }).catch(() => {});
  
  const watcher = chokidar.watch(`${PROJECTS_DIR}/*/README.md`, {
    ignored: /node_modules/,
    persistent: true,
    depth: 2
  });
  
  watcher
    .on('add', async (filePath) => {
      const projectPath = path.dirname(filePath);
      await createDiscoveredProject(projectPath);
    })
    .on('change', async (filePath) => {
      // README updated - could sync name/description
      console.log(`[Auto-Discovery] 📝 README updated: ${filePath}`);
    })
    .on('unlink', async (filePath) => {
      console.log(`[Auto-Discovery] 🗑️ README removed: ${filePath}`);
    });
  
  console.log(`[Auto-Discovery] 👁️ Watching: ${PROJECTS_DIR}/*/`);
  return watcher;
}

// Manual trigger endpoint (for testing)
app.post('/api/admin/scan-projects', async (req, res) => {
  try {
    const entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
    const projects = [];
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const created = await createDiscoveredProject(path.join(PROJECTS_DIR, entry.name));
        if (created) projects.push(created);
      }
    }
    
    res.json({ 
      scanned: entries.length,
      created: projects.length,
      projects: projects.map(p => ({ id: p.id, name: p.name }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ FILE BROWSER (Alex-Compatibility) ============

// Safe path join helper
function safeJoin(base, target) {
  const result = path.join(base, target);
  if (!result.startsWith(base)) {
    throw new Error('Path traversal detected');
  }
  return result;
}

// File Browser API - List files in project
// File Browser handler (used by both routes)
async function fileBrowserHandler(req, res) {
  try {
    const { projectId } = req.params;
    // Use path set by route handler, not raw params[0]
    const filePath = req.params.path || '';
    
    console.log(`[FileBrowser] project=${projectId}, path="${filePath}"`);
    
    console.log(`[FileBrowser] Request: project=${projectId}, path="${filePath}"`);
    
    // Get project
    const data = await loadProjects();
    const project = data.projects.find(p => p.id === projectId);
    
    console.log(`[FileBrowser] Found project: ${project ? 'YES' : 'NO'}, has path: ${project?.projectPath ? 'YES' : 'NO'}`);
    
    if (!project || !project.projectPath) {
      return res.status(404).json({ error: 'Project not found or no projectPath' });
    }
    
    // Safe path construction
    const fullPath = safeJoin(project.projectPath, filePath);
    console.log(`[FileBrowser] Full path: ${fullPath}`);
    
    const stats = await fs.stat(fullPath);
    
    if (stats.isDirectory()) {
      // List directory contents
      const items = await fs.readdir(fullPath, { withFileTypes: true });
      const formatted = items.map(item => ({
        name: item.name,
        type: item.isDirectory() ? 'directory' : 'file',
        path: path.join(filePath, item.name)
      }));
      
      res.json({
        type: 'directory',
        path: filePath || '/',
        items: formatted
      });
    } else {
      // Read file content
      const content = await fs.readFile(fullPath, 'utf-8');
      const ext = path.extname(fullPath).slice(1);
      
      res.json({
        type: 'file',
        name: path.basename(fullPath),
        path: filePath,
        extension: ext,
        content,
        size: stats.size,
        lastModified: stats.mtime
      });
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: error.message });
  }
}

// Register File Browser route - handles ALL variants
// /api/files/:id, /api/files/:id/, /api/files/:id/path
app.get('/api/files/:projectId*', async (req, res) => {
  const extraPath = req.params[0] || '';
  // Remove leading/trailing slashes
  req.params.path = extraPath.replace(/^\//, '').replace(/\/$/, '');
  await fileBrowserHandler(req, res);
});

// Create features directory for a project (if using Alex-style)
app.post('/api/projects/:id/init-features', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await loadProjects();
    const project = data.projects.find(p => p.id === id);
    
    if (!project || !project.projectPath) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const featuresDir = path.join(project.projectPath, 'features');
    await fs.mkdir(featuresDir, { recursive: true });
    
    // Create a sample feature file
    const sampleFile = path.join(featuresDir, 'README.md');
    await fs.writeFile(sampleFile, `# Features

Feature-Spezifikationen für ${project.name}.

## Konvention
- PROJ-1-feature-name.md
- Markdown format
- Tasks können verknüpft werden
`, 'utf-8');
    
    res.json({ success: true, featuresPath: featuresDir });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ START SERVER ============

app.listen(PORT, () => {
  console.log(`🚀 OpenClaw Dashboard API running on http://localhost:${PORT}`);
  
  // Initialize auto-discovery
  initProjectWatcher();
  console.log('[Auto-Discovery] ✅ Initialized');
  console.log('[Alex-Compat] ✅ File Browser API ready');
});
