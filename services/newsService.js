const axios = require('axios');
const config = require('../config');

class NewsService {
  constructor() {
    this.newsApiKey = config.apis.newsApi.key;
    this.baseUrl = config.apis.newsApi.baseUrl;
  }

  /**
   * 獲取加密貨幣新聞
   * @param {string} coin - 加密貨幣代號 (btc, eth, sol, bnb, sui)
   * @param {number} limit - 新聞數量限制
   * @returns {Promise<Array>} 新聞列表
   */
  async getCryptoNews(coin = null, limit = 3) {
    try {
      let query = 'cryptocurrency OR bitcoin OR ethereum';
      
      if (coin && config.supportedCoins[coin.toLowerCase()]) {
        const coinName = config.supportedCoins[coin.toLowerCase()];
        query = `${coinName} OR ${coin.toLowerCase()}`;
      }

      const response = await axios.get(`${this.baseUrl}/everything`, {
        params: {
          q: query,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: limit,
          apiKey: this.newsApiKey
        }
      });

      if (response.data.status === 'ok') {
        return this.formatNews(response.data.articles);
      } else {
        throw new Error('NewsAPI 回應錯誤');
      }
    } catch (error) {
      console.error('獲取新聞失敗:', error.message);
      return this.getFallbackNews(coin, limit);
    }
  }

  /**
   * 格式化新聞資料
   * @param {Array} articles - 原始新聞資料
   * @returns {Array} 格式化後的新聞
   */
  formatNews(articles) {
    return articles.map(article => ({
      title: article.title,
      description: article.description,
      url: article.url,
      publishedAt: new Date(article.publishedAt).toLocaleString('zh-TW'),
      source: article.source.name
    }));
  }

  /**
   * 備用新聞資料（當 API 失敗時使用）
   * @param {string} coin - 加密貨幣代號
   * @param {number} limit - 新聞數量
   * @returns {Array} 備用新聞
   */
  getFallbackNews(coin, limit) {
    const fallbackNews = [
      {
        title: `${coin ? coin.toUpperCase() : '加密貨幣'}市場動態更新`,
        description: '市場持續關注加密貨幣發展趨勢，投資者需謹慎評估風險。',
        url: 'https://cointelegraph.com',
        publishedAt: new Date().toLocaleString('zh-TW'),
        source: 'CoinTelegraph'
      },
      {
        title: '區塊鏈技術創新持續推進',
        description: '最新技術發展為加密貨幣生態系統帶來新的可能性。',
        url: 'https://coindesk.com',
        publishedAt: new Date().toLocaleString('zh-TW'),
        source: 'CoinDesk'
      },
      {
        title: '監管環境變化影響市場情緒',
        description: '各國監管政策調整對加密貨幣市場產生重要影響。',
        url: 'https://decrypt.co',
        publishedAt: new Date().toLocaleString('zh-TW'),
        source: 'Decrypt'
      }
    ];

    return fallbackNews.slice(0, limit);
  }

  /**
   * 獲取每日新聞摘要
   * @returns {Promise<Array>} 新聞摘要
   */
  async getDailyNewsSummary() {
    return await this.getCryptoNews(null, 3);
  }
}

module.exports = new NewsService();
