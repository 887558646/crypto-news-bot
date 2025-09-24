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
    newsPushTime: '0 8 * * *', // 每天早上 08:00
    marketSummaryTime: '0 18 * * *', // 每天 18:00
  },
};
