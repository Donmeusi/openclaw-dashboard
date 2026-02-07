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
    <div className="flex h-screen" style={{ background: '#0d1117' }}>
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
        <StatusBar status={status} />
        
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
