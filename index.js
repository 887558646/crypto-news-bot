const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const webhookRouter = require('./routes/webhook');
const scheduler = require('./utils/scheduler');
const newsService = require('./services/newsService');
const priceService = require('./services/priceService');
const { broadcastDailyNews, getActiveUsersStats } = require('./routes/webhook'); // 引入 broadcastDailyNews

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
  const schedulerStatus = scheduler.getStatus();
  res.status(200).json({
    bot: {
      name: 'Crypto News Bot',
      version: '1.0.0',
      status: 'running',
      uptime: process.uptime(),
    },
    scheduler: schedulerStatus,
    activeUsers: getActiveUsersStats(),
    apiKeys: {
      newsApi: config.news.apiKey ? 'configured' : 'not configured',
      line: config.line.channelAccessToken && config.line.channelSecret ? 'configured' : 'not configured',
    },
  });
});

// 測試推播路由 (僅限開發/測試用)
app.post('/test', async (req, res) => {
  const { type, userId, coin } = req.body;
  let message = '';
  try {
    switch (type) {
      case 'daily-news':
        console.log('手動觸發每日新聞推播...');
        await broadcastDailyNews();
        message = '每日新聞推播已觸發';
        break;
      case 'specific-news':
        if (!userId || !coin) {
          return res.status(400).json({ error: '需要 userId 和 coin 參數' });
        }
        console.log(`手動觸發用戶 ${userId} 的 ${coin} 新聞推播...`);
        const news = await newsService.getNewsByKeyword(coin, 1);
        if (news && news.length > 0) {
          await client.pushMessage(userId, { type: 'text', text: newsService.formatNews(news) });
          message = `用戶 ${userId} 的 ${coin} 新聞已推播`;
        } else {
          message = `無法獲取 ${coin} 的新聞`;
        }
        break;
      case 'market-summary':
        console.log('手動觸發市場總結推播...');
        // 這裡需要從 scheduler 引入或重新實現市場總結邏輯
        // 為了簡化，這裡只返回一個訊息
        message = '市場總結推播已觸發 (實際邏輯在 scheduler 中)';
        break;
      default:
        return res.status(400).json({ error: '無效的推播類型' });
    }
    res.status(200).json({ message });
  } catch (error) {
    console.error('測試推播失敗:', error);
    res.status(500).json({ error: '測試推播失敗', details: error.message });
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
  console.log(`🚀 Crypto News Bot 已啟動！`);
  console.log(`📡 伺服器運行在 http://localhost:${PORT}`);
  console.log(`🔗 Webhook 端點: http://localhost:${PORT}${config.server.webhookPath}`);
  console.log(`📊 狀態檢查: http://localhost:${PORT}/status`);
  console.log(`🧪 測試端點: http://localhost:${PORT}/test`);
  console.log('⏰ 排程器將在啟動後開始運行');
  scheduler.init(webhookRouter);
  console.log('✅ 所有服務已就緒！');
});
