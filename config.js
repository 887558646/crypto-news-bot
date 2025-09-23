// Crypto News Bot 配置檔案
module.exports = {
  // LINE Bot 配置
  line: {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || 'YOUR_LINE_CHANNEL_ACCESS_TOKEN',
    channelSecret: process.env.LINE_CHANNEL_SECRET || 'YOUR_LINE_CHANNEL_SECRET'
  },

  // API 配置
  apis: {
    // NewsAPI (免費版本每天 1000 次請求)
    newsApi: {
      key: process.env.NEWS_API_KEY || 'YOUR_NEWS_API_KEY',
      baseUrl: 'https://newsapi.org/v2'
    },
    
    // CoinGecko API (免費，不需要 key)
    coinGecko: {
      baseUrl: 'https://api.coingecko.com/api/v3'
    },
    
    // QuickChart API (免費，不需要 key)
    quickChart: {
      baseUrl: 'https://quickchart.io'
    }
  },

  // 支援的加密貨幣
  supportedCoins: {
    'btc': 'bitcoin',
    'eth': 'ethereum', 
    'sol': 'solana',
    'bnb': 'binancecoin',
    'sui': 'sui'
  },

  // 伺服器配置
  server: {
    port: process.env.PORT || 3000,
    webhookPath: '/webhook'
  },

  // 排程配置
  schedule: {
    // 每天早上 9:00 推播新聞
    newsPushTime: '0 9 * * *'
  }
};
