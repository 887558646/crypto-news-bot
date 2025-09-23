const express = require('express');
const config = require('./config');
const webhookRouter = require('./routes/webhook');
const scheduler = require('./utils/scheduler');

// 建立 Express 應用程式
const app = express();

// 中間件設定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康檢查端點
app.get('/', (req, res) => {
  res.json({
    message: 'Crypto News Bot 正在運行中！',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
});

// 狀態檢查端點
app.get('/status', (req, res) => {
  const schedulerStatus = scheduler.getStatus();
  
  res.json({
    bot: {
      name: 'Crypto News Bot',
      version: '1.0.0',
      status: 'running',
      uptime: process.uptime()
    },
    scheduler: schedulerStatus,
    supportedCoins: Object.keys(config.supportedCoins),
    endpoints: {
      webhook: config.server.webhookPath,
      health: '/',
      status: '/status',
      test: '/test'
    }
  });
});

// 測試端點（用於測試推播功能）
app.post('/test', async (req, res) => {
  try {
    const { type } = req.body;
    
    switch (type) {
      case 'daily-news':
        await scheduler.triggerDailyNews();
        res.json({ message: '每日新聞推播已觸發' });
        break;
      case 'specific-news':
        await scheduler.triggerSpecificCoinNews();
        res.json({ message: '特定幣種新聞推播已觸發' });
        break;
      case 'market-summary':
        await scheduler.triggerMarketSummary();
        res.json({ message: '市場總結推播已觸發' });
        break;
      default:
        res.status(400).json({ error: '無效的測試類型' });
    }
  } catch (error) {
    console.error('測試推播失敗:', error);
    res.status(500).json({ error: '測試推播失敗' });
  }
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
  console.log('🚀 Crypto News Bot 已啟動！');
  console.log(`📡 伺服器運行在 http://localhost:${PORT}`);
  console.log(`🔗 Webhook 端點: http://localhost:${PORT}${config.server.webhookPath}`);
  console.log(`📊 狀態檢查: http://localhost:${PORT}/status`);
  console.log(`🧪 測試端點: http://localhost:${PORT}/test`);
  console.log('⏰ 排程器將在啟動後開始運行');
  
  // 初始化排程器
  scheduler.init(webhookRouter);
  
  console.log('✅ 所有服務已就緒！');
});

// 優雅關閉處理
process.on('SIGINT', () => {
  console.log('\n🛑 收到關閉信號，正在優雅關閉...');
  
  scheduler.stopScheduler();
  
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 收到終止信號，正在優雅關閉...');
  
  scheduler.stopScheduler();
  
  process.exit(0);
});

// 未處理的異常處理
process.on('uncaughtException', (err) => {
  console.error('未處理的異常:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未處理的 Promise 拒絕:', reason);
  process.exit(1);
});

module.exports = app;
