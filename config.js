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
    apiKey: process.env.COINGECKO_API_KEY,
  },
  quickchart: {
    baseUrl: 'https://quickchart.io',
  },
  server: {
    port: process.env.PORT || 3000,
    webhookPath: '/webhook',
  },
  schedule: {
    newsPushTime: '30 12 * * *', // 每天中午 12:30
    marketSummaryTime: '0 18 * * *', // 每天 18:00
  },
  supportedCoins: [
    // 前10大
    'btc', 'eth', 'usdt', 'xrp', 'bnb', 'sol', 'usdc', 'doge', 'steth', 'trx',
    // 11-20大
    'ada', 'wsteth', 'wbeth', 'link', 'usde', 'avax', 'wbtc', 'figr_heloc', 'hype', 'sui',
    // 21-30大
    'xlm', 'bch', 'weeth', 'weth', 'hbar', 'leo', 'ltc', 'usds', 'bsc-usd', 'cro',
    // 31-40大
    'ton', 'shib', 'cbbtc', 'susde', 'dot', 'wbt', 'mnt', 'wlfi', 'xmr', 'uni',
    // 41-50大
    'dai', 'ena', 'aave', 'm', 'pepe', 'usdt0', 'okb', 'ip', 'bgb', 'near'
  ],
};
