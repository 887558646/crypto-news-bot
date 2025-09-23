require('dotenv').config();

module.exports = {
  line: {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET,
  },
  news: {
    apiKey: process.env.NEWS_API_KEY,
    baseUrl: 'https://newsapi.org/v2',
    defaultQuery: 'cryptocurrency',
    topHeadlinesEndpoint: '/top-headlines',
    everythingEndpoint: '/everything',
    pageSize: 5,
  },
  coingecko: {
    baseUrl: 'https://api.coingecko.com/api/v3',
    priceEndpoint: '/simple/price',
    chartEndpoint: '/coins',
  },
  quickchart: {
    baseUrl: 'https://quickchart.io',
  },
  server: {
    port: process.env.PORT || 3000,
    webhookPath: '/webhook',
  },
  schedule: {
    newsPushTime: '0 9 * * *', // 每天早上 9:00
    marketSummaryTime: '0 18 * * *', // 每天 18:00
    specificNewsTime: '0 * * * *', // 每小時
  },
  supportedCoins: [
    'btc', 'eth', 'usdt', 'bnb', 'sol', 'xrp', 'usdc', 'steth', 'ada', 'avax',
    'trx', 'wbtc', 'link', 'dot', 'matic', 'dai', 'shib', 'ltc', 'bch', 'uni',
    'atom', 'etc', 'xlm', 'near', 'algo', 'vet', 'fil', 'icp', 'hbar', 'apt'
  ],
  // 用戶訂閱狀態管理（實際應用中應使用資料庫）
  userSubscriptions: new Map(),
};
