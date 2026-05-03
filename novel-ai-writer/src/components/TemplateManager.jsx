import React, { useState, useEffect } from 'react';
import templateService from '../services/templateService';
import { useAI } from '../hooks/useAI';

const categories = [
  { id: 'all', name: '全部' },
  { id: 'system', name: '系统破甲' },
  { id: 'scene', name: '场景识别' },
  { id: 'rewrite', name: '改写规则' },
  { id: 'custom', name: '自定义' }
];

const TemplateManager = () => {
  const { generateStream } = useAI();
  const [templates, setTemplates] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');

  const load = () => {
    const all = templateService.getAll();
    if (selectedCategory === 'all') setTemplates(all);
    else setTemplates(all.filter(t => t.category === selectedCategory));
  };

  useEffect(() => { load(); }, [selectedCategory]);

  const handleSave = () => {
    if (!editing.name || !editing.content) return alert('请填写名称和内容');
    if (editing.id) templateService.update(editing.id, editing);
    else templateService.add(editing);
    load();
    setShowModal(false);
    setEditing(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('删除模板？')) { templateService.delete(id); load(); }
  };

  const handleTest = async (template) => {
    if (!testInput.trim()) return alert('请输入测试文本');
    const prompt = `${template.content}\n\n测试文本：\n${testInput}`;
    let output = '';
    setTestOutput('生成中...');
    await generateStream(prompt, null, (chunk) => { output += chunk; setTestOutput(output); });
  };

  return (
    <div>
      <div className="panel-header">
        <h1>📝 提示词模板</h1>
        <div><button className="btn btn-primary" onClick={() => { setEditing({ name: '', category: 'custom', content: '', tags: [] }); setShowModal(true); }}>+ 新建</button>
        <button className="btn btn-secondary" onClick={() => templateService.export()}>📤 导出</button>
        <label className="btn btn-secondary">📥 导入<input type="file" accept=".json" onChange={(e) => { if(e.target.files[0]) templateService.import(e.target.files[0]).then(load); e.target.value=''; }} style={{display:'none'}} /></label></div>
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ width: '150px' }}>{categories.map(cat => <button key={cat.id} className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`} onClick={() => setSelectedCategory(cat.id)}>{cat.name}</button>)}</div>
        <div style={{ flex: 1 }}>
          <div className="template-grid">
            {templates.map(t => (
              <div key={t.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><h3>{t.name}</h3><div><button className="btn-icon" onClick={() => { setEditing(t); setShowModal(true); }}>✏️</button><button className="btn-icon delete" onClick={() => handleDelete(t.id)}>🗑️</button></div></div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{categories.find(c => c.id === t.category)?.name} {t.tags?.map(tag => <span key={tag} className="tag">#{tag}</span>)}</div>
                <pre style={{ fontSize: '0.8rem', maxHeight: '100px', overflow: 'auto' }}>{t.content.slice(0, 150)}...</pre>
                <button className="btn btn-secondary" onClick={() => { setEditing(t); setTestInput(''); setTestOutput(''); }}>测试</button>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <h2>{editing?.id ? '编辑模板' : '新建模板'}</h2>
            <input type="text" placeholder="名称" value={editing?.name || ''} onChange={e => setEditing({...editing, name: e.target.value})} />
            <select value={editing?.category || 'custom'} onChange={e => setEditing({...editing, category: e.target.value})}>{categories.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            <textarea placeholder="模板内容" rows={6} value={editing?.content || ''} onChange={e => setEditing({...editing, content: e.target.value})} />
            <div className="modal-buttons"><button className="btn btn-secondary" onClick={() => setShowModal(false)}>取消</button><button className="btn btn-primary" onClick={handleSave}>保存</button></div>
          </div>
        </div>
      )}
      {editing && !showModal && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>测试模板: {editing.name}</h3>
            <textarea rows={4} placeholder="输入测试文本" value={testInput} onChange={e => setTestInput(e.target.value)} />
            <button className="btn btn-primary" onClick={() => handleTest(editing)}>运行测试</button>
            {testOutput && <pre style={{ marginTop: '1rem' }}>{testOutput}</pre>}
            <button className="btn btn-secondary" onClick={() => setEditing(null)}>关闭</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManager;