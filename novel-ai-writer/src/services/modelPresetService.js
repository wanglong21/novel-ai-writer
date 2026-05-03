import storageService from './storageService';
import apiService from './apiService';

const DEFAULT_PRESETS = [
  {
    id: 'local_lmstudio',
    name: 'LM Studio 本地',
    endpoint: 'http://127.0.0.1:1234/v1/chat/completions',
    apiKey: '',
    model: 'qwen-3-8b-instruct',
    temperature: 0.7,
    maxTokens: 2048,
    isDefault: true
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    apiKey: '',
    model: 'deepseek-chat',
    temperature: 0.7,
    maxTokens: 4096,
    isDefault: false
  }
];

class ModelPresetService {
  constructor() {
    this.presets = [];
    this.load();
  }

  load() {
    const saved = storageService.load('modelPresets');
    if (saved && saved.length) {
      this.presets = saved;
    } else {
      this.presets = DEFAULT_PRESETS;
      this.save();
    }
  }

  save() {
    storageService.save('modelPresets', this.presets);
  }

  getAll() {
    return [...this.presets];
  }

  getActive() {
    return this.presets.find(p => p.isDefault) || this.presets[0];
  }

  add(preset) {
    const newPreset = { id: Date.now().toString(), ...preset, createdAt: new Date().toISOString() };
    this.presets.push(newPreset);
    this.save();
    return newPreset;
  }

  update(id, updates) {
    const index = this.presets.findIndex(p => p.id === id);
    if (index !== -1) {
      this.presets[index] = { ...this.presets[index], ...updates };
      this.save();
      return this.presets[index];
    }
    return null;
  }

  delete(id) {
    const preset = this.presets.find(p => p.id === id);
    if (preset?.isDefault) throw new Error('不能删除默认预设');
    this.presets = this.presets.filter(p => p.id !== id);
    this.save();
  }

  setDefault(id) {
    this.presets.forEach(p => { p.isDefault = (p.id === id); });
    this.save();
    const active = this.getActive();
    if (active) {
      const { endpoint, apiKey, model, temperature, maxTokens } = active;
      apiService.config = { endpoint, apiKey, model, temperature, maxTokens };
      storageService.save('apiSettings', apiService.config);
    }
  }

  async testPreset(id) {
    const preset = this.presets.find(p => p.id === id);
    if (!preset) throw new Error('预设不存在');
    const original = apiService.config;
    apiService.config = {
      endpoint: preset.endpoint,
      apiKey: preset.apiKey,
      model: preset.model,
      temperature: preset.temperature,
      maxTokens: preset.maxTokens
    };
    try {
      const result = await apiService.testConnection();
      return result;
    } finally {
      apiService.config = original;
    }
  }
}

export default new ModelPresetService();