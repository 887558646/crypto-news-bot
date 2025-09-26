const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const webhookRouter = require('./routes/webhook');
const { getActiveUsersStats } = require('./routes/webhook');
const mappingService = require('./services/mappingService');
const keepAliveService = require('./services/keepAliveService');

const app = express();

// 中間件
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// 健康檢查路由
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Crypto News Bot 正在運行中！',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
});

// 狀態檢查路由
app.get('/status', (req, res) => {
  res.status(200).json({
    bot: {
      name: 'Crypto News Bot',
      version: '1.0.0',
      status: 'running',
      uptime: process.uptime(),
    },
    activeUsers: getActiveUsersStats(),
    mappingCache: mappingService.getCacheStats(),
    keepAlive: keepAliveService.getStatus(),
    apiKeys: {
      newsApi: config.news.apiKey ? 'configured' : 'not configured',
      line: config.line.channelAccessToken && config.line.channelSecret ? 'configured' : 'not configured',
    },
  });
});

// 測試路由 (僅限開發/測試用)
app.post('/test', async (req, res) => {
  const { type, coin } = req.body;
  let message = '';
  try {
    switch (type) {
      case 'test-mapping':
        if (coin) {
          console.log(`測試動態映射: ${coin}`);
          const coinId = await mappingService.findCoinId(coin);
          message = coinId ? `映射成功: ${coin} -> ${coinId}` : `映射失敗: ${coin}`;
        } else {
          message = '請提供 coin 參數';
        }
        break;
      default:
        return res.status(400).json({ error: '無效的測試類型' });
    }
    res.status(200).json({ message });
  } catch (error) {
    console.error('測試失敗:', error);
    res.status(500).json({ error: '測試失敗', details: error.message });
  }
});

// Keep-Alive 端點 - 防止 Render 免費版睡眠
app.get('/keepalive', (req, res) => {
  res.json({ 
    status: 'alive', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// LINE Webhook 路由
app.use(config.server.webhookPath, webhookRouter);


// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('伺服器錯誤:', err);
  res.status(500).json({
    error: '內部伺服器錯誤',
    message: process.env.NODE_ENV === 'development' ? err.message : '請稍後再試'
  });
});

// 404 處理
app.use((req, res) => {
  res.status(404).json({
    error: '找不到請求的資源',
    path: req.originalUrl,
    method: req.method
  });
});

// 啟動伺服器
const PORT = config.server.port;

app.listen(PORT, () => {
  console.log(`🚀 Crypto News Bot 已啟動！`);
  console.log(`📡 伺服器運行在 http://localhost:${PORT}`);
  console.log(`🔗 Webhook 端點: http://localhost:${PORT}${config.server.webhookPath}`);
  console.log(`📊 狀態檢查: http://localhost:${PORT}/status`);
  console.log(`🧪 測試端點: http://localhost:${PORT}/test`);
  console.log(`💓 Keep-Alive 端點: http://localhost:${PORT}/keepalive`);
  
  // 啟動 Keep-Alive 服務（僅在生產環境或 Render 環境）
  if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
    keepAliveService.start();
  }
  
  console.log('✅ 所有服務已就緒！');
});
