import React, { useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import WritingPanel from './components/WritingPanel';
import AddonPanel from './components/AddonPanel';
import CharacterManager from './components/CharacterManager';
import ProjectManager from './components/ProjectManager';
import ApiSettingsPanel from './components/ApiSettingsPanel';
import TemplateManager from './components/TemplateManager';
import ModelPresetManager from './components/ModelPresetManager';
import './styles.css';

function AppContent() {
  const { state, actions } = useApp();
  const [activeTab, setActiveTab] = useState(state.ui.activeTab);

  const tabs = [
    { id: 'writing', label: '✍️ 创作', component: WritingPanel },
    { id: 'addon', label: '🎨 加料', component: AddonPanel },
    { id: 'characters', label: '👥 角色', component: CharacterManager },
    { id: 'projects', label: '📁 项目', component: ProjectManager },
    { id: 'templates', label: '📝 提示词', component: TemplateManager },
    { id: 'models', label: '🤖 模型预设', component: ModelPresetManager },
    { id: 'settings', label: '⚙️ 设置', component: ApiSettingsPanel }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    actions.setUI({ activeTab: tabId });
  };

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className={`app ${state.ui.theme}`}>
      <aside className={`sidebar ${state.ui.sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h2>Novel AI Writer</h2>
          <button className="collapse-btn" onClick={() => actions.setUI({ sidebarCollapsed: !state.ui.sidebarCollapsed })}>
            {state.ui.sidebarCollapsed ? '→' : '←'}
          </button>
        </div>
        <nav className="sidebar-nav">
          {tabs.map(tab => (
            <button key={tab.id} className={`nav-item ${activeTab === tab.id ? 'active' : ''}`} onClick={() => handleTabChange(tab.id)}>
              <span className="nav-icon">{tab.label.split(' ')[0]}</span>
              {!state.ui.sidebarCollapsed && <span className="nav-label">{tab.label}</span>}
            </button>
          ))}
        </nav>
      </aside>
      <main className="main-content">
        {ActiveComponent && <ActiveComponent />}
      </main>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;