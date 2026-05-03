import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAI } from '../hooks/useAI';

const ProjectManager = () => {
  const { state, actions } = useApp();
  const { isGenerating, generateStream } = useAI();
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterContent, setChapterContent] = useState('');
  const [editingChapterIndex, setEditingChapterIndex] = useState(null);

  const getStats = (project) => {
    const chapters = project.chapters || [];
    const totalWords = chapters.reduce((sum, ch) => sum + (ch.content?.length || 0), 0);
    return { totalChapters: chapters.length, totalWords };
  };

  const handleCreateProject = () => {
    if (!newProject.name.trim()) return alert('请输入项目名称');
    const project = { id: Date.now().toString(), ...newProject, chapters: [], createdAt: new Date().toISOString() };
    actions.addProject(project);
    setNewProject({ name: '', description: '' });
    setShowModal(false);
    setSelectedProject(project);
  };

  const handleDeleteProject = (id) => {
    if (window.confirm('删除项目？')) actions.deleteProject(id);
    if (selectedProject?.id === id) setSelectedProject(null);
  };

  const handleAddChapter = () => {
    if (!chapterTitle.trim()) return alert('请输入章节标题');
    const newChapter = { id: Date.now().toString(), title: chapterTitle, content: chapterContent, completed: !!chapterContent.trim() };
    const updated = { ...selectedProject, chapters: [...(selectedProject.chapters || []), newChapter] };
    actions.updateProject(updated);
    setSelectedProject(updated);
    setChapterTitle(''); setChapterContent(''); setEditingChapterIndex(null);
  };

  const handleUpdateChapter = () => {
    if (!chapterTitle.trim()) return;
    const chapters = [...selectedProject.chapters];
    chapters[editingChapterIndex] = { ...chapters[editingChapterIndex], title: chapterTitle, content: chapterContent };
    const updated = { ...selectedProject, chapters };
    actions.updateProject(updated);
    setSelectedProject(updated);
    setChapterTitle(''); setChapterContent(''); setEditingChapterIndex(null);
  };

  const handleEditChapter = (idx) => {
    const ch = selectedProject.chapters[idx];
    setChapterTitle(ch.title);
    setChapterContent(ch.content);
    setEditingChapterIndex(idx);
  };

  const handleDeleteChapter = (idx) => {
    if (!window.confirm('删除章节？')) return;
    const chapters = selectedProject.chapters.filter((_, i) => i !== idx);
    const updated = { ...selectedProject, chapters };
    actions.updateProject(updated);
    setSelectedProject(updated);
  };

  const handleAIGenerateChapter = async () => {
    if (!chapterTitle.trim()) return alert('请输入章节标题');
    const prompt = `请为小说《${selectedProject.name}》生成章节《${chapterTitle}》的内容。项目描述：${selectedProject.description || '无'}。要求约1000字。`;
    let result = '';
    setChapterContent('');
    await generateStream(prompt, null, (chunk) => { result += chunk; setChapterContent(result); });
  };

  const exportProject = () => {
    if (!selectedProject) return;
    let text = `# ${selectedProject.name}\n## 描述\n${selectedProject.description}\n\n## 章节\n`;
    selectedProject.chapters?.forEach((ch, i) => { text += `### ${i+1}. ${ch.title}\n${ch.content}\n\n---\n\n`; });
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedProject.name}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="panel-header"><h1>📁 项目管理</h1><button className="btn btn-primary" onClick={() => setShowModal(true)}>+ 新建项目</button></div>
      <div className="project-container">
        <div className="project-sidebar">
          {state.projects.map(p => {
            const stats = getStats(p);
            return (
              <div key={p.id} className={`project-card ${selectedProject?.id === p.id ? 'active' : ''}`} onClick={() => setSelectedProject(p)}>
                <h3>{p.name}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{stats.totalChapters}章 · {stats.totalWords}字</div>
                <button className="delete-project-btn" onClick={(e) => { e.stopPropagation(); handleDeleteProject(p.id); }}>🗑️</button>
              </div>
            );
          })}
        </div>
        <div className="project-detail">
          {selectedProject ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><h2>{selectedProject.name}</h2><button className="btn btn-secondary" onClick={exportProject}>📥 导出全部</button></div>
              <div className="chapter-editor">
                <input type="text" placeholder="章节标题" value={chapterTitle} onChange={e => setChapterTitle(e.target.value)} style={{ width: '100%', marginBottom: '0.5rem' }} />
                <textarea rows={6} placeholder="章节内容" value={chapterContent} onChange={e => setChapterContent(e.target.value)} />
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button className="btn btn-secondary" onClick={handleAIGenerateChapter} disabled={isGenerating}>🤖 AI 生成</button>
                  <button className="btn btn-primary" onClick={editingChapterIndex !== null ? handleUpdateChapter : handleAddChapter}>{editingChapterIndex !== null ? '更新' : '添加'}</button>
                </div>
              </div>
              <h3>章节列表</h3>
              {selectedProject.chapters?.map((ch, i) => (
                <div key={ch.id} className="chapter-item">
                  <span><strong>{i+1}.</strong> {ch.title} ({ch.content?.length || 0}字)</span>
                  <div><button className="btn-icon" onClick={() => handleEditChapter(i)}>✏️</button><button className="btn-icon delete" onClick={() => handleDeleteChapter(i)}>🗑️</button></div>
                </div>
              ))}
            </>
          ) : <div className="empty-state">请选择项目</div>}
        </div>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>新建项目</h2>
            <input type="text" placeholder="项目名称" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} />
            <textarea placeholder="项目描述" rows={3} value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} />
            <div className="modal-buttons"><button className="btn btn-secondary" onClick={() => setShowModal(false)}>取消</button><button className="btn btn-primary" onClick={handleCreateProject}>创建</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManager;