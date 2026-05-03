import storageService from './storageService';

const API_CONFIG_KEY = 'apiSettings';

class ApiService {
  constructor() {
    this.config = null;
    this.loadConfig();
  }

  loadConfig() {
    this.config = storageService.load(API_CONFIG_KEY);
  }

  getConfig() {
    if (!this.config) this.loadConfig();
    return this.config;
  }

  async testConnection() {
    const config = this.getConfig();
    if (!config) return { success: false, error: '请先配置API' };
    try {
      // 使用预加载暴露的 electronAPI
      const result = await window.electronAPI.testConnection(config);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async callAI(messages, onChunk, options = {}) {
    const config = this.getConfig();
    if (!config) throw new Error('请先配置API');

    const { temperature = config.temperature || 0.7, maxTokens = 2048, model = config.model } = options;

    return new Promise((resolve, reject) => {
      const streamId = window.electronAPI.callAIStream(
        {
          ...config,
          model,
          messages,
          temperature,
          max_tokens: maxTokens
        },
        (chunk, done, error) => {
          if (error) {
            reject(new Error(error));
          } else if (done) {
            resolve({ fullText: chunk });
          } else {
            onChunk?.(chunk);
          }
        }
      );

      // 监听完成和错误事件（备用）
      const completeHandler = (data) => {
        if (data.streamId === streamId) {
          window.electronAPI.removeListener('ai-stream-complete', completeHandler);
          window.electronAPI.removeListener('ai-stream-error', errorHandler);
          resolve({ fullText: data.fullText });
        }
      };
      const errorHandler = (data) => {
        if (data.streamId === streamId) {
          window.electronAPI.removeListener('ai-stream-complete', completeHandler);
          window.electronAPI.removeListener('ai-stream-error', errorHandler);
          reject(new Error(data.error));
        }
      };
      window.electronAPI.on('ai-stream-complete', completeHandler);
      window.electronAPI.on('ai-stream-error', errorHandler);
    });
  }
}

export default new ApiService();