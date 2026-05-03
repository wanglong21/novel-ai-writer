import React, { useState, useEffect } from 'react';
import modelPresetService from '../services/modelPresetService';

const ModelPresetManager = () => {
  const [presets, setPresets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [testResults, setTestResults] = useState({});

  const load = () => setPresets(modelPresetService.getAll());
  useEffect(() => { load(); }, []);

  const handleSave = () => {
    if (!editing.name || !editing.endpoint || !editing.model) return alert('请填写必要字段');
    if (editing.id) modelPresetService.update(editing.id, editing);
    else modelPresetService.add(editing);
    load();
    setShowModal(false);
    setEditing(null);
  };

  const handleDelete = (id) => {
    try { modelPresetService.delete(id); load(); } catch (err) { alert(err.message); }
  };

  const handleSetDefault = (id) => {
    modelPresetService.setDefault(id);
    load();
  };

  const handleTest = async (id) => {
    setTestResults(prev => ({ ...prev, [id]: '测试中...' }));
    const result = await modelPresetService.testPreset(id);
    setTestResults(prev => ({ ...prev, [id]: result.success ? '✅ 成功' : '❌ ' + result.error }));
  };

  return (
    <div>
      <div className="panel-header"><h1>🤖 模型预设</h1><button className="btn btn-primary" onClick={() => { setEditing({ name: '', endpoint: 'http://', apiKey: '', model: '', temperature: 0.7, maxTokens: 2048, isDefault: false }); setShowModal(true); }}>+ 新建</button></div>
      <div className="preset-list">
        {presets.map(p => (
          <div key={p.id} className={`preset-card ${p.isDefault ? 'default' : ''}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><h3>{p.name} {p.isDefault && <span className="badge-default">默认</span>}</h3><div><button className="btn-icon" onClick={() => { setEditing(p); setShowModal(true); }}>✏️</button><button className="btn-icon delete" onClick={() => handleDelete(p.id)} disabled={p.isDefault}>🗑️</button></div></div>
            <p><strong>端点：</strong>{p.endpoint}</p><p><strong>模型：</strong>{p.model}</p><p><strong>Temp：</strong>{p.temperature} | <strong>Max Tokens：</strong>{p.maxTokens}</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              {!p.isDefault && <button className="btn btn-secondary" onClick={() => handleSetDefault(p.id)}>设为默认</button>}
              <button className="btn btn-secondary" onClick={() => handleTest(p.id)}>测试连接</button>
              {testResults[p.id] && <span>{testResults[p.id]}</span>}
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{editing?.id ? '编辑预设' : '新建预设'}</h2>
            <input type="text" placeholder="名称" value={editing?.name || ''} onChange={e => setEditing({...editing, name: e.target.value})} />
            <input type="text" placeholder="API 端点" value={editing?.endpoint || ''} onChange={e => setEditing({...editing, endpoint: e.target.value})} />
            <input type="password" placeholder="API Key (可选)" value={editing?.apiKey || ''} onChange={e => setEditing({...editing, apiKey: e.target.value})} />
            <input type="text" placeholder="模型名称" value={editing?.model || ''} onChange={e => setEditing({...editing, model: e.target.value})} />
            <label>Temperature: {editing?.temperature}</label><input type="range" min="0" max="2" step="0.01" value={editing?.temperature || 0.7} onChange={e => setEditing({...editing, temperature: parseFloat(e.target.value)})} />
            <label>Max Tokens: {editing?.maxTokens}</label><input type="range" min="256" max="8192" step="128" value={editing?.maxTokens || 2048} onChange={e => setEditing({...editing, maxTokens: parseInt(e.target.value)})} />
            <div className="modal-buttons"><button className="btn btn-secondary" onClick={() => setShowModal(false)}>取消</button><button className="btn btn-primary" onClick={handleSave}>保存</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelPresetManager;