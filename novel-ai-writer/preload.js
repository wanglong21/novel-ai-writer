const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  callAIStream: (config, onChunk) => {
    const streamId = Date.now() + '-' + Math.random();
    const listener = (event, data) => {
      if (data.streamId === streamId) {
        if (data.done) {
          ipcRenderer.removeListener('ai-stream-data', listener);
          onChunk(null, true);
        } else if (data.error) {
          ipcRenderer.removeListener('ai-stream-data', listener);
          onChunk(null, false, data.error);
        } else {
          onChunk(data.chunk, false);
        }
      }
    };
    ipcRenderer.on('ai-stream-data', listener);
    ipcRenderer.send('call-ai-stream', { ...config, streamId });
    return streamId;
  },
  testConnection: (config) => ipcRenderer.invoke('test-connection', config),
  on: (channel, callback) => {
    const validChannels = ['ai-stream-complete', 'ai-stream-error'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, data) => callback(data));
    }
  },
  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  }
});