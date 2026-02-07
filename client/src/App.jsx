import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import StatusBar from './components/StatusBar';
import FileEditor from './components/FileEditor';
import ActivityLog from './components/ActivityLog';
import ProjectBoard from './components/ProjectBoard';
import { fetchStatus, fetchFiles } from './utils/api';

function App() {
  const [activeTab, setActiveTab] = useState('editor');
  const [status, setStatus] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('MEMORY.md');
  
  // Theme state: 'dark' or 'light'
  const [theme, setTheme] = useState(() => {
    // Load from localStorage or default to dark
    const saved = localStorage.getItem('dashboard-theme');
    return saved || 'dark';
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dashboard-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    loadStatus();
    loadFiles();
    const interval = setInterval(loadStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      const data = await fetchStatus();
      setStatus(data);
    } catch (err) {
      console.error('Status error:', err);
    }
  };

  const loadFiles = async () => {
    try {
      const data = await fetchFiles();
      setFiles(data);
    } catch (err) {
      console.error('Files error:', err);
    }
  };

  return (
    <div className="flex h-screen" style={{ background: 'var(--color-bg)' }}>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        files={files}
        selectedFile={selectedFile}
        onSelectFile={(file) => {
          setSelectedFile(file);
          setActiveTab('editor');
        }}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <StatusBar status={status} theme={theme} onToggleTheme={toggleTheme} />
        
        <main className="flex-1 overflow-auto p-6">
          {activeTab === 'editor' && (
            <FileEditor filename={selectedFile} />
          )}
          {activeTab === 'activity' && (
            <ActivityLog />
          )}
          {activeTab === 'projects' && (
            <ProjectBoard />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
