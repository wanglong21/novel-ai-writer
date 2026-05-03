import storageService from './storageService';

const TEMPLATE_CATEGORIES = {
  system: '系统破甲',
  scene: '场景识别',
  rewrite: '改写规则',
  custom: '自定义'
};

const DEFAULT_TEMPLATES = [
  {
    id: 'system_default',
    name: '默认系统提示',
    category: 'system',
    content: '你是一位专业的小说作家，擅长各种文学体裁。',
    tags: ['通用']
  },
  {
    id: 'system_chinese',
    name: '中式网文风格',
    category: 'system',
    content: '你是一位网络小说作家，语言通俗流畅，节奏明快。',
    tags: ['网文']
  },
  {
    id: 'scene_battle',
    name: '战斗场景增强',
    category: 'scene',
    content: '请强化战斗场景描写，增加动作细节和紧张氛围。',
    tags: ['战斗']
  },
  {
    id: 'rewrite_expand',
    name: '扩写润色',
    category: 'rewrite',
    content: '请扩写以下内容，增加细节和心理活动。',
    tags: ['扩写']
  }
];

class TemplateService {
  constructor() {
    this.templates = [];
    this.load();
  }

  load() {
    const saved = storageService.load('templates');
    if (saved && saved.length) {
      this.templates = saved;
    } else {
      this.templates = DEFAULT_TEMPLATES;
      this.save();
    }
  }

  save() {
    storageService.save('templates', this.templates);
  }

  getAll() {
    return [...this.templates];
  }

  getByCategory(category) {
    return this.templates.filter(t => t.category === category);
  }

  get(id) {
    return this.templates.find(t => t.id === id);
  }

  add(template) {
    const newTemplate = {
      id: Date.now().toString(),
      ...template,
      createdAt: new Date().toISOString()
    };
    this.templates.push(newTemplate);
    this.save();
    return newTemplate;
  }

  update(id, updates) {
    const index = this.templates.findIndex(t => t.id === id);
    if (index !== -1) {
      this.templates[index] = { ...this.templates[index], ...updates, updatedAt: new Date().toISOString() };
      this.save();
      return this.templates[index];
    }
    return null;
  }

  delete(id) {
    this.templates = this.templates.filter(t => t.id !== id);
    this.save();
  }

  export() {
    const data = JSON.stringify(this.templates, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `templates_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  import(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          if (Array.isArray(imported)) {
            const existingIds = new Set(this.templates.map(t => t.id));
            const newTemplates = imported.filter(t => !existingIds.has(t.id));
            this.templates.push(...newTemplates);
            this.save();
            resolve(newTemplates.length);
          } else reject(new Error('无效格式'));
        } catch (err) { reject(err); }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
}

export default new TemplateService();