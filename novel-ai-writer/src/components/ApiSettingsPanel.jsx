import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import apiService from '../services/apiService';
import modelPresetService from '../services/modelPresetService';

const ApiSettingsPanel = () => {
  const { state, actions } = useApp();
  const [settings, setSettings] = useState({
    endpoint: 'http://127.0.0.1:1234/v1/chat/completions',
    apiKey: '',
    model: 'qwen-3-8b-instruct',
    temperature: 0.7,
    maxTokens: 2048
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [presets, setPresets] = useState([]);

  useEffect(() => {
    if (state.apiSettings) setSettings(prev => ({ ...prev, ...state.apiSettings }));
    setPresets(modelPresetService.getAll());
  }, [state.apiSettings]);

  const handleSave = () => {
    if (!settings.endpoint.trim() || !settings.model.trim()) return alert('请填写端点和模型');
    actions.setApiSettings(settings);
    alert('设置已保存');
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await apiService.testConnection();
    setTestResult(result);
    setTesting(false);
  };

  const loadPreset = (presetId) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setSettings({
        endpoint: preset.endpoint,
        apiKey: preset.apiKey,
        model: preset.model,
        temperature: preset.temperature,
        maxTokens: preset.maxTokens
      });
    }
  };

  return (
    <div>
      <div className="panel-header"><h1>⚙️ API 设置</h1><button className="btn btn-primary" onClick={handleSave}>保存设置</button></div>
      <div className="settings-container">
        <div className="card">
          <h3>连接配置</h3>
          <div className="input-group">
            <label>快速加载预设</label>
            <select onChange={(e) => loadPreset(e.target.value)} defaultValue="">
              <option value="" disabled>选择预设</option>
              {presets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="input-group"><label>API 端点</label><input type="text" value={settings.endpoint} onChange={e => setSettings({...settings, endpoint: e.target.value})} /></div>
          <div className="input-group"><label>API Key（可选）</label><input type="password" value={settings.apiKey} onChange={e => setSettings({...settings, apiKey: e.target.value})} /></div>
          <div className="input-group"><label>模型名称</label><input type="text" value={settings.model} onChange={e => setSettings({...settings, model: e.target.value})} /></div>
          <div className="input-group"><label>Temperature: {settings.temperature}</label><input type="range" min="0" max="2" step="0.01" value={settings.temperature} onChange={e => setSettings({...settings, temperature: parseFloat(e.target.value)})} /></div>
          <div className="input-group"><label>Max Tokens: {settings.maxTokens}</label><input type="range" min="256" max="8192" step="128" value={settings.maxTokens} onChange={e => setSettings({...settings, maxTokens: parseInt(e.target.value)})} /></div>
          <button className="btn btn-secondary" onClick={handleTest} disabled={testing}>{testing ? '测试中...' : '测试连接'}</button>
          {testResult && <div className={testResult.success ? 'success-message' : 'error-message'} style={{ marginTop: '1rem' }}>{testResult.success ? '✅ 连接成功' : '❌ ' + testResult.error}</div>}
        </div>
      </div>
    </div>
  );
};

export default ApiSettingsPanel;