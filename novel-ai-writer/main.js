const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// 流式 AI 调用 (SSE)
ipcMain.on('call-ai-stream', async (event, config) => {
  const { endpoint, apiKey, model, messages, temperature, max_tokens, streamId } = config;
  try {
    const response = await axios({
      method: 'post',
      url: endpoint,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey ? `Bearer ${apiKey}` : ''
      },
      data: {
        model,
        messages,
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 2048,
        stream: true
      },
      responseType: 'stream',
      timeout: 300000
    });

    let buffer = '';
    response.data.on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            mainWindow.webContents.send('ai-stream-data', { streamId, done: true });
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content || '';
            if (content) {
              buffer += content;
              mainWindow.webContents.send('ai-stream-data', { streamId, chunk: content, done: false });
            }
          } catch (e) {}
        }
      }
    });
    response.data.on('end', () => {
      mainWindow.webContents.send('ai-stream-complete', { streamId, fullText: buffer });
    });
    response.data.on('error', (err) => {
      mainWindow.webContents.send('ai-stream-error', { streamId, error: err.message });
    });
  } catch (error) {
    mainWindow.webContents.send('ai-stream-error', { streamId, error: error.message });
  }
});

// 测试连接
ipcMain.handle('test-connection', async (event, config) => {
  const { endpoint, apiKey, model } = config;
  try {
    const response = await axios.post(endpoint, {
      model: model,
      messages: [{ role: 'user', content: 'ping' }],
      max_tokens: 1
    }, {
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      timeout: 10000
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});