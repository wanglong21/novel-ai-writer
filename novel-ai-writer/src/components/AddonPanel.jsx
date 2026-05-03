import React, { useState, useCallback, useRef } from 'react';
import { useAI } from '../hooks/useAI';
import { LoadingSpinner } from './common/LoadingSpinner';

const TEMPLATES = {
  sweet: { name: '甜宠风格', prompt: '增加甜宠元素：温馨互动、甜蜜对话、宠溺细节。' },
  battle: { name: '战斗风格', prompt: '强化战斗描写：动作细节、技能特效、紧张氛围。' },
  psychological: { name: '心理描写', prompt: '深化心理描写：内心独白、情感变化、心理冲突。' }
};

const AddonPanel = () => {
  const { isGenerating, generateStream, error, setError } = useAI();
  const [originalText, setOriginalText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('sweet');
  const [customTemplate, setCustomTemplate] = useState('');
  const [enhancedText, setEnhancedText] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setOriginalText(ev.target.result);
    reader.readAsText(file);
  };

  const handleAddEnhancement = useCallback(async () => {
    if (!originalText.trim()) {
      alert('请先上传或粘贴小说文本');
      return;
    }
    let prompt = showCustom && customTemplate.trim() ? customTemplate : TEMPLATES[selectedTemplate]?.prompt;
    const fullPrompt = `${prompt}\n\n待处理文本：\n${originalText}`;
    let result = '';
    setEnhancedText('');
    setError(null);
    await generateStream(fullPrompt, null, (chunk) => {
      result += chunk;
      setEnhancedText(result);
    });
  }, [originalText, selectedTemplate, showCustom, customTemplate, generateStream, setError]);

  const exportEnhanced = () => {
    if (!enhancedText.trim()) return alert('无内容可导出');
    const blob = new Blob([enhancedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enhanced_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="addon-panel">
      <div className="panel-header"><h1>🎨 加料板块</h1></div>
      {error && <div className="error-message">{error}</div>}
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <div className="input-group">
            <label>原始文本</label>
            <textarea rows={10} value={originalText} onChange={(e) => setOriginalText(e.target.value)} placeholder="粘贴或上传小说文本..." />
            <button className="btn btn-secondary" onClick={() => fileInputRef.current.click()}>📁 上传文件</button>
            <input ref={fileInputRef} type="file" accept=".txt,.md" style={{ display: 'none' }} onChange={handleFileUpload} />
          </div>
          <div className="input-group">
            <label>加料模板</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {Object.entries(TEMPLATES).map(([id, t]) => (
                <button key={id} className={`btn ${selectedTemplate === id && !showCustom ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setSelectedTemplate(id); setShowCustom(false); }}>{t.name}</button>
              ))}
              <button className={`btn ${showCustom ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setShowCustom(true)}>自定义</button>
            </div>
          </div>
          {showCustom && (
            <div className="input-group">
              <label>自定义指令</label>
              <textarea rows={3} value={customTemplate} onChange={(e) => setCustomTemplate(e.target.value)} placeholder="输入你的加料指令..." />
            </div>
          )}
          <button className="btn btn-primary" onClick={handleAddEnhancement} disabled={isGenerating}>✨ 执行加料</button>
        </div>
        <div style={{ flex: 1 }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><h3>加料结果</h3>{enhancedText && <button className="btn btn-secondary" onClick={exportEnhanced}>💾 导出</button>}</div>
            {isGenerating && !enhancedText ? <LoadingSpinner /> : <pre style={{ whiteSpace: 'pre-wrap', maxHeight: '400px', overflow: 'auto' }}>{enhancedText || '等待生成...'}</pre>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddonPanel;