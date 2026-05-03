import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAI } from '../hooks/useAI';

const CharacterManager = () => {
  const { state, actions } = useApp();
  const { isGenerating, generateStream } = useAI();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', identity: '', personality: '', goal: '', appearance: '', background: ''
  });
  const [aiSuggestion, setAiSuggestion] = useState('');

  const resetForm = () => {
    setFormData({ name: '', identity: '', personality: '', goal: '', appearance: '', background: '' });
    setEditingId(null);
    setAiSuggestion('');
  };

  const openModal = (char = null) => {
    if (char) { setFormData(char); setEditingId(char.id); }
    else resetForm();
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return alert('请输入角色姓名');
    const character = { id: editingId || Date.now().toString(), ...formData, updatedAt: new Date().toISOString() };
    if (editingId) actions.updateCharacter(character);
    else actions.addCharacter(character);
    setShowModal(false);
    resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm('确定删除？')) actions.deleteCharacter(id);
  };

  const handleAISuggest = async () => {
    if (!formData.name.trim()) return alert('请输入角色姓名');
    const prompt = `请为角色“${formData.name}”生成详细设定：身份、性格、目标、外貌、背景故事。已有信息：${formData.identity || '无'} / ${formData.personality || '无'}`;
    let suggestion = '';
    setAiSuggestion('生成中...');
    await generateStream(prompt, null, (chunk) => { suggestion += chunk; setAiSuggestion(suggestion); });
  };

  const applySuggestion = () => {
    if (!aiSuggestion || aiSuggestion === '生成中...') return;
    // 简单解析（实际可用正则）
    setFormData(prev => ({ ...prev, background: aiSuggestion.slice(0, 200) }));
    setAiSuggestion('');
  };

  return (
    <div>
      <div className="panel-header"><h1>👥 角色管理</h1><button className="btn btn-primary" onClick={() => openModal()}>+ 新建角色</button></div>
      {state.characters.length === 0 ? <div className="empty-state">暂无角色</div> : (
        <div className="character-grid">
          {state.characters.map(c => (
            <div key={c.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><h3>{c.name}</h3><div><button className="btn-icon" onClick={() => openModal(c)}>✏️</button><button className="btn-icon delete" onClick={() => handleDelete(c.id)}>🗑️</button></div></div>
              <p><strong>身份：</strong>{c.identity || '未设定'}</p>
              <p><strong>性格：</strong>{c.personality || '未设定'}</p>
              <p><strong>目标：</strong>{c.goal || '未设定'}</p>
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{editingId ? '编辑角色' : '新建角色'}</h2>
            <input type="text" placeholder="姓名*" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input type="text" placeholder="身份" value={formData.identity} onChange={e => setFormData({...formData, identity: e.target.value})} />
            <textarea placeholder="性格特点" rows={2} value={formData.personality} onChange={e => setFormData({...formData, personality: e.target.value})} />
            <input type="text" placeholder="核心目标" value={formData.goal} onChange={e => setFormData({...formData, goal: e.target.value})} />
            <button className="btn btn-secondary" onClick={handleAISuggest} disabled={isGenerating}>🤖 AI 生成建议</button>
            {aiSuggestion && <pre style={{background:'var(--bg-tertiary)', padding:'0.5rem', marginTop:'0.5rem'}}>{aiSuggestion}</pre>}
            {aiSuggestion && aiSuggestion !== '生成中...' && <button className="btn btn-primary" onClick={applySuggestion}>应用</button>}
            <div className="modal-buttons"><button className="btn btn-secondary" onClick={() => setShowModal(false)}>取消</button><button className="btn btn-primary" onClick={handleSave}>保存</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterManager;