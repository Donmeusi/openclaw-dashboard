// Nova Dashboard v1.1 - Modern Dashboard with Kanban
// Handles Projects, Notes, Activity Log, and Navigation

class NovaDashboard {
    constructor() {
        this.projects = [];
        this.notes = [];
        this.currentPanel = 'projects';
        this.draggedCard = null;
        this.init();
    }

    init() {
        this.loadData();
        this.setupNavigation();
        this.setupEventListeners();
        this.renderAll();
        this.startAutoRefresh();
    }

    // ========== DATA MANAGEMENT ==========
    loadData() {
        // Load projects (with default sample projects)
        const savedProjects = localStorage.getItem('nova-projects');
        if (savedProjects) {
            this.projects = JSON.parse(savedProjects);
        } else {
            // Sample projects for demonstration
            this.projects = [
                {
                    id: 1,
                    title: 'Mac Mini 4 Migration',
                    desc: 'Vollständige Migration zu lokaler LLM-Verarbeitung',
                    priority: 'high',
                    status: 'inprogress',
                    created: new Date().toISOString(),
                    updated: new Date().toISOString()
                },
                {
                    id: 2,
                    title: 'Matrix Channel Setup',
                    desc: 'Nativer Matrix-Channel für Datenhoheit',
                    priority: 'normal',
                    status: 'todo',
                    created: new Date().toISOString(),
                    updated: new Date().toISOString()
                },
                {
                    id: 3,
                    title: 'Dashboard v1',
                    desc: 'Projekt-Management Dashboard für Nova',
                    priority: 'high',
                    status: 'review',
                    created: new Date().toISOString(),
                    updated: new Date().toISOString()
                },
                {
                    id: 4,
                    title: 'Home Assistant Integration',
                    desc: 'Smart Home Steuerung via OpenClaw',
                    priority: 'low',
                    status: 'done',
                    created: new Date().toISOString(),
                    updated: new Date().toISOString()
                }
            ];
            this.saveProjects();
        }

        // Load notes
        const savedNotes = localStorage.getItem('nova-notes');
        if (savedNotes) {
            this.notes = JSON.parse(savedNotes);
        }

        // Update badges
        this.updateBadges();
    }

    saveProjects() {
        localStorage.setItem('nova-projects', JSON.stringify(this.projects));
        this.updateBadges();
    }

    saveNotes() {
        localStorage.setItem('nova-notes', JSON.stringify(this.notes));
        this.updateBadges();
    }

    updateBadges() {
        const projectCount = this.projects.filter(p => p.status !== 'done').length;
        const notesCount = this.notes.filter(n => n.status === 'unseen').length;
        
        const projectBadge = document.getElementById('project-badge');
        const notesBadge = document.getElementById('notes-badge');
        
        if (projectBadge) {
            projectBadge.textContent = projectCount;
            projectBadge.style.display = projectCount > 0 ? 'inline' : 'none';
        }
        
        if (notesBadge) {
            notesBadge.textContent = notesCount;
            notesBadge.style.display = notesCount > 0 ? 'inline' : 'none';
        }
    }

    renderStats() {
        const counts = {
            todo: this.projects.filter(p => p.status === 'todo').length,
            inprogress: this.projects.filter(p => p.status === 'inprogress').length,
            review: this.projects.filter(p => p.status === 'review').length,
            done: this.projects.filter(p => p.status === 'done').length
        };

        document.getElementById('stat-todo') && (document.getElementById('stat-todo').textContent = counts.todo);
        document.getElementById('stat-progress') && (document.getElementById('stat-progress').textContent = counts.inprogress);
        document.getElementById('stat-review') && (document.getElementById('stat-review').textContent = counts.review);
        document.getElementById('stat-done') && (document.getElementById('stat-done').textContent = counts.done);
    }

    // ========== NAVIGATION ==========
    setupNavigation() {
        const navTabs = document.querySelectorAll('.nav-tab');
        navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const panel = tab.dataset.panel;
                this.switchPanel(panel);
            });
        });
    }

    switchPanel(panelName) {
        // Update tab active state
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.panel === panelName) {
                tab.classList.add('active');
            }
        });

        // Update panel visibility
        document.querySelectorAll('.content-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        const targetPanel = document.getElementById(`${panelName}-panel`);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }

        this.currentPanel = panelName;
        
        // Refresh content
        if (panelName === 'projects') {
            this.renderStats();
            this.renderKanban();
        }
        if (panelName === 'notes') this.renderNotes();
        if (panelName === 'activity') this.renderActivity();
    }

    // ========== KANBAN BOARD ==========
    renderKanban() {
        const columns = ['todo', 'inprogress', 'review', 'done'];
        
        columns.forEach(status => {
            const container = document.getElementById(`${status}-cards`);
            const countEl = document.getElementById(`${status}-count`);
            
            if (!container) return;
            
            const cards = this.projects.filter(p => p.status === status);
            
            if (countEl) {
                countEl.textContent = cards.length;
            }
            
            if (cards.length === 0) {
                container.innerHTML = '<div class="empty-state">Keine Aufgaben</div>';
                return;
            }
            
            container.innerHTML = cards.map(project => this.createKanbanCard(project)).join('');
        });

        this.setupDragAndDrop();
        this.setupCardActions();
    }

    createKanbanCard(project) {
        const priorityClass = `priority-${project.priority}`;
        const date = new Date(project.updated).toLocaleDateString('de-DE');
        
        return `
            <div class="kanban-card ${priorityClass}" draggable="true" data-id="${project.id}">
                <div class="card-title">${this.escapeHtml(project.title)}</div>
                <div class="card-desc">${this.escapeHtml(project.desc)}</div>
                <div class="card-meta">
                    <span class="card-priority">
                        ${project.priority === 'high' ? '🔴 Hoch' : 
                          project.priority === 'normal' ? '⚪ Normal' : '🔵 Niedrig'}
                    </span>
                    <div class="card-actions-inline">
                        <button class="btn-icon edit-project" data-id="${project.id}">✏️</button>
                        <button class="btn-icon delete-project" data-id="${project.id}">🗑️</button>
                    </div>
                </div>
            </div>
        `;
    }

    setupDragAndDrop() {
        const cards = document.querySelectorAll('.kanban-card');
        const columns = document.querySelectorAll('.kanban-cards');

        cards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                this.draggedCard = card;
                card.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
                this.draggedCard = null;
            });
        });

        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });

            column.addEventListener('drop', (e) => {
                e.preventDefault();
                if (!this.draggedCard) return;

                const projectId = parseInt(this.draggedCard.dataset.id);
                const newStatus = column.parentElement.dataset.status;
                
                this.updateProjectStatus(projectId, newStatus);
            });
        });
    }

    setupCardActions() {
        // Edit buttons
        document.querySelectorAll('.edit-project').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                this.editProject(id);
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-project').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                this.deleteProject(id);
            });
        });
    }

    addProject(project) {
        project.id = Date.now();
        project.created = new Date().toISOString();
        project.updated = new Date().toISOString();
        
        this.projects.push(project);
        this.saveProjects();
        this.renderKanban();
    }

    updateProjectStatus(id, newStatus) {
        const project = this.projects.find(p => p.id === id);
        if (project) {
            project.status = newStatus;
            project.updated = new Date().toISOString();
            this.saveProjects();
            this.renderKanban();
        }
    }

    editProject(id) {
        const project = this.projects.find(p => p.id === id);
        if (!project) return;

        // Populate modal with project data
        document.getElementById('project-title').value = project.title;
        document.getElementById('project-desc').value = project.desc;
        document.getElementById('project-priority').value = project.priority;
        document.getElementById('project-status').value = project.status;

        // Show modal in edit mode
        this.openModal();
        
        // Change save handler to update instead of add
        const saveBtn = document.getElementById('save-project');
        saveBtn.textContent = 'Änderungen speichern';
        saveBtn.dataset.editId = id;
    }

    deleteProject(id) {
        if (!confirm('Projekt wirklich löschen?')) return;
        
        this.projects = this.projects.filter(p => p.id !== id);
        this.saveProjects();
        this.renderKanban();
    }

    // ========== NOTES ==========
    addNote(content, priority = 'normal') {
        const note = {
            id: Date.now(),
            content: content,
            priority: priority,
            timestamp: new Date().toISOString(),
            status: 'unseen'
        };
        
        this.notes.unshift(note);
        this.saveNotes();
        this.renderNotes();
    }

    renderNotes(filter = 'all') {
        const container = document.getElementById('notes-grid');
        if (!container) return;

        let filteredNotes = this.notes;
        if (filter !== 'all') {
            filteredNotes = this.notes.filter(n => n.status === filter);
        }

        if (filteredNotes.length === 0) {
            container.innerHTML = '<div class="empty-state">Keine Notes vorhanden</div>';
            return;
        }

        container.innerHTML = filteredNotes.map(note => {
            const time = new Date(note.timestamp).toLocaleString('de-DE');
            const priorityClass = `priority-${note.priority}`;
            
            return `
                <div class="note-card ${priorityClass}" data-id="${note.id}">
                    <div class="note-card-header">
                        <span class="note-time">${time}</span>
                        <span class="note-status ${note.status}">${note.status}</span>
                    </div>
                    <div class="note-content">${this.escapeHtml(note.content)}</div>
                </div>
            `;
        }).join('');
    }

    updateNoteStatus(id, status) {
        const note = this.notes.find(n => n.id === id);
        if (note) {
            note.status = status;
            this.saveNotes();
            this.renderNotes();
        }
    }

    // ========== ACTIVITY ==========
    renderActivity() {
        // Update metrics
        const metricSessions = document.getElementById('metric-sessions');
        const metricNotes = document.getElementById('metric-notes');
        const metricProjects = document.getElementById('metric-projects');
        const metricLast = document.getElementById('metric-last');

        if (metricSessions) metricSessions.textContent = '1'; // Placeholder
        if (metricNotes) metricNotes.textContent = this.notes.length;
        if (metricProjects) metricProjects.textContent = this.projects.filter(p => p.status !== 'done').length;
        if (metricLast) metricLast.textContent = new Date().toLocaleTimeString('de-DE');

        // Render log
        this.renderActivityLog();
    }

    renderActivityLog() {
        const container = document.getElementById('activity-log');
        if (!container) return;

        const showSessions = document.getElementById('filter-sessions')?.checked ?? true;
        const showTools = document.getElementById('filter-tools')?.checked ?? true;
        const showErrors = document.getElementById('filter-errors')?.checked ?? true;

        // Generate placeholder activity
        const activities = [
            { time: new Date().toLocaleTimeString('de-DE'), type: 'session', message: 'Dashboard aktualisiert' },
            { time: new Date().toLocaleTimeString('de-DE'), type: 'tool', message: `${this.projects.length} Projekte geladen` },
            { time: new Date().toLocaleTimeString('de-DE'), type: 'tool', message: `${this.notes.length} Notes geladen` }
        ];

        const filteredActivities = activities.filter(a => {
            if (a.type === 'session' && !showSessions) return false;
            if (a.type === 'tool' && !showTools) return false;
            if (a.type === 'error' && !showErrors) return false;
            return true;
        });

        container.innerHTML = filteredActivities.map(activity => `
            <div class="log-entry">
                <span class="log-time">${activity.time}</span>
                <span class="log-type ${activity.type}">${activity.type.toUpperCase()}</span>
                <span class="log-message">${this.escapeHtml(activity.message)}</span>
            </div>
        `).join('');
    }

    // ========== MODAL ==========
    openModal() {
        const modal = document.getElementById('project-modal');
        if (modal) {
            modal.classList.add('active');
            // Reset form
            document.getElementById('project-title').value = '';
            document.getElementById('project-desc').value = '';
            document.getElementById('project-priority').value = 'normal';
            document.getElementById('project-status').value = 'todo';
            document.getElementById('save-project').textContent = 'Projekt anlegen';
            delete document.getElementById('save-project').dataset.editId;
        }
    }

    closeModal() {
        const modal = document.getElementById('project-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    saveModalProject() {
        const title = document.getElementById('project-title').value.trim();
        const desc = document.getElementById('project-desc').value.trim();
        const priority = document.getElementById('project-priority').value;
        const status = document.getElementById('project-status').value;
        const saveBtn = document.getElementById('save-project');
        const editId = saveBtn.dataset.editId;

        if (!title) {
            alert('Bitte einen Titel eingeben');
            return;
        }

        if (editId) {
            // Update existing
            const project = this.projects.find(p => p.id === parseInt(editId));
            if (project) {
                project.title = title;
                project.desc = desc;
                project.priority = priority;
                project.status = status;
                project.updated = new Date().toISOString();
                this.saveProjects();
                this.renderKanban();
            }
        } else {
            // Add new
            this.addProject({ title, desc, priority, status });
        }

        this.closeModal();
    }

    // ========== EVENT LISTENERS ==========
    setupEventListeners() {
        // New project button
        const newProjectBtn = document.getElementById('new-project-btn');
        if (newProjectBtn) {
            newProjectBtn.addEventListener('click', () => this.openModal());
        }

        // Modal close
        document.querySelector('.modal-close')?.addEventListener('click', () => this.closeModal());
        document.getElementById('cancel-project')?.addEventListener('click', () => this.closeModal());
        document.getElementById('save-project')?.addEventListener('click', () => this.saveModalProject());

        // Close modal on outside click
        document.getElementById('project-modal')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });

        // Save note
        const saveNoteBtn = document.getElementById('save-note');
        const noteInput = document.getElementById('note-input');
        const notePriority = document.getElementById('note-priority');
        
        if (saveNoteBtn && noteInput) {
            saveNoteBtn.addEventListener('click', () => {
                const content = noteInput.value.trim();
                const priority = notePriority?.value || 'normal';
                
                if (content) {
                    this.addNote(content, priority);
                    noteInput.value = '';
                }
            });
        }

        // Notes filter
        document.querySelectorAll('.filter-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderNotes(btn.dataset.filter);
            });
        });

        // Refresh buttons
        document.getElementById('refresh-all')?.addEventListener('click', () => {
            this.renderAll();
        });

        // Log filters
        ['filter-sessions', 'filter-tools', 'filter-errors'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', () => {
                this.renderActivityLog();
            });
        });

        // Settings
        document.getElementById('export-data')?.addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('clear-data')?.addEventListener('click', () => {
            this.clearData();
        });

        // Add card buttons in kanban
        document.querySelectorAll('.add-card-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const status = btn.parentElement.dataset.status;
                document.getElementById('project-status').value = status;
                this.openModal();
            });
        });
    }

    // ========== UTILITY ==========
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    renderAll() {
        this.renderStats();
        this.renderKanban();
        this.renderNotes();
        this.renderActivity();
        this.updateBadges();
    }

    startAutoRefresh() {
        setInterval(() => {
            this.updateBadges();
            
            // Update sync time
            const lastSync = document.getElementById('last-sync');
            if (lastSync) {
                lastSync.textContent = `Letzte Sync: ${new Date().toLocaleTimeString('de-DE')}`;
            }
        }, 30000); // Every 30 seconds
    }

    exportData() {
        const data = {
            projects: this.projects,
            notes: this.notes,
            exported: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nova-dashboard-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    clearData() {
        if (!confirm('ALLE Daten wirklich löschen? Das kann nicht rückgängig gemacht werden!')) return;
        
        localStorage.removeItem('nova-projects');
        localStorage.removeItem('nova-notes');
        
        this.projects = [];
        this.notes = [];
        
        this.renderAll();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new NovaDashboard();
    console.log('🌟 Nova Dashboard v1.1 initialized');
});
