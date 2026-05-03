import React, { useState, useCallback, useRef } from 'react';
import { useAI } from '../hooks/useAI';
import { useApp } from '../contexts/AppContext';
import { LoadingSpinner } from './common/LoadingSpinner';

const WritingPanel = () => {
  const { state } = useApp();
  const { isGenerating, generateStream, error, setError } = useAI();
  const [idea, setIdea] = useState('');
  const [outline, setOutline] = useState('');
  const [content, setContent] = useState('');
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [hook, setHook] = useState('');
  const fileInputRef = useRef(null);

  const generateOutline = useCallback(async () => {
    if (!idea.trim()) {
      alert('请先输入创意点子');
      return;
    }
    setIsGeneratingOutline(true);
    setError(null);
    const systemPrompt = `你是一个专业的小说大纲生成助手。请根据用户的创意生成详细的小说大纲，包括：
1. 故事梗概
2. 主要角色
3. 情节发展
4. 章节规划（至少5章）`;

    let generatedOutline = '';
    setOutline('');
    try {
      await generateStream(idea, systemPrompt, (chunk) => {
        generatedOutline += chunk;
        setOutline(generatedOutline);
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingOutline(false);
    }
  }, [idea, generateStream, setError]);

  const generateChapter = useCallback(async () => {
    if (!outline.trim()) {
      alert('请先生成或导入大纲');
      return;
    }
    const prompt = `请根据以下大纲生成小说的第一章内容：\n\n${outline}\n\n要求：文笔流畅，情节合理，约1500-2000字。`;
    let generatedContent = '';
    setContent('');
    await generateStream(prompt, null, (chunk) => {
      generatedContent += chunk;
      setContent(generatedContent);
    });
  }, [outline, generateStream]);

  const extractHook = useCallback(async () => {
    if (!content.trim()) {
      alert('请先生成章节内容');
      return;
    }
    const prompt = `请从以下章节内容中提取3-5个悬念钩子（可用于下一章的引子）：\n\n${content}`;
    let result = '';
    setHook('生成中...');
    await generateStream(prompt, null, (chunk) => {
      result += chunk;
      setHook(result);
    });
  }, [content, generateStream]);

  const handleImportOutline = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setOutline(event.target.result);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const exportContent = () => {
    if (!content.trim()) {
      alert('没有可导出的内容');
      return;
    }
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chapter_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="writing-panel">
      <div className="panel-header">
        <h1>✍️ 创作板块</h1>
      </div>
      {error && <div className="error-message">{error}</div>}

      <div className="input-group">
        <label>创意点子</label>
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="输入你的小说创意..."
          rows={3}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button className="btn btn-primary" onClick={generateOutline} disabled={isGeneratingOutline || isGenerating}>
          {isGeneratingOutline ? '生成中...' : '生成大纲'}
        </button>
        <label className="btn btn-secondary">
          📂 导入大纲
          <input type="file" accept=".txt,.md" onChange={handleImportOutline} style={{ display: 'none' }} ref={fileInputRef} />
        </label>
      </div>

      {outline && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3>小说大纲</h3>
          <pre style={{ whiteSpace: 'pre-wrap', maxHeight: '200px', overflow: 'auto' }}>{outline}</pre>
          <button className="btn btn-primary" onClick={generateChapter} disabled={isGenerating} style={{ marginTop: '0.5rem' }}>
            {isGenerating ? '生成章节中...' : '生成第一章'}
          </button>
        </div>
      )}

      {content && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3>生成内容</h3>
            <button className="btn btn-secondary" onClick={exportContent}>💾 导出</button>
          </div>
          <pre style={{ whiteSpace: 'pre-wrap', maxHeight: '400px', overflow: 'auto' }}>{content}</pre>
          <button className="btn btn-secondary" onClick={extractHook} style={{ marginTop: '0.5rem' }}>🔍 提取悬念钩子</button>
          {hook && <pre style={{ marginTop: '0.5rem', background: 'var(--bg-tertiary)', padding: '0.5rem', borderRadius: '6px' }}>{hook}</pre>}
        </div>
      )}
    </div>
  );
};

export default WritingPanel;