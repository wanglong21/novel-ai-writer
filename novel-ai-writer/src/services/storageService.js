const PREFIX = 'novel_ai_';

class StorageService {
  getKey(key) {
    return `${PREFIX}${key}`;
  }

  save(key, data) {
    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`保存 ${key} 失败:`, error);
      return false;
    }
  }

  load(key, defaultValue = null) {
    try {
      const saved = localStorage.getItem(this.getKey(key));
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.error(`加载 ${key} 失败:`, error);
      return defaultValue;
    }
  }

  delete(key) {
    try {
      localStorage.removeItem(this.getKey(key));
      return true;
    } catch (error) {
      console.error(`删除 ${key} 失败:`, error);
      return false;
    }
  }

  clear() {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(PREFIX))
        .forEach(k => localStorage.removeItem(k));
      return true;
    } catch (error) {
      console.error('清空存储失败:', error);
      return false;
    }
  }
}

export default new StorageService();