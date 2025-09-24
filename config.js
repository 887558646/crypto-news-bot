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
    newsPushTime: '0 11 * * *', // 每天早上 11:00
    marketSummaryTime: '0 18 * * *', // 每天 18:00
  },
  supportedCoins: [
    // 前10大 (根據 CoinMarketCap 最新排名)
    'btc', 'eth', 'bnb', 'xrp', 'ada', 'doge', 'dot', 'ltc', 'bch', 'link',
    // 11-20大
    'xlm', 'etc', 'trx', 'dash', 'xmr', 'usdt', 'eos', 'neo', 'iota', 'zec',
    // 21-30大
    'bsv', 'usdc', 'sol', 'avax', 'matic', 'shib', 'uni', 'atom', 'near', 'leo',
    // 31-40大
    'fil', 'op', 'okb', 'hbar', 'apt', 'imx', 'inj', 'cro', 'kas', 'ldo',
    // 41-50大
    'vet', 'arb', 'tusd', 'stx', 'mnt', 'tia', 'grt', 'rune', 'egld', 'algo'
  ],
};
