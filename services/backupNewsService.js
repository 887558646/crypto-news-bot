const axios = require('axios');
const config = require('../config');

/**
 * 備用新聞服務
 * 使用 NewsData.io 作為 NewsAPI 的備用方案
 */
class BackupNewsService {
  constructor() {
    this.newsDataApiKey = process.env.NEWSDATA_API_KEY;
  }

  /**
   * 獲取加密貨幣新聞 (備用源)
   * @param {string} coin - 幣種名稱
   * @param {number} limit - 新聞數量
   * @returns {Promise<Array>} 新聞列表
   */
  async getCryptoNews(coin = null, limit = 3) {
    const query = coin ? `${coin} cryptocurrency` : 'cryptocurrency bitcoin ethereum';
    
    // 嘗試備用源
    const sources = [
      () => this.getNewsFromNewsData(query, limit)
    ];

    for (const source of sources) {
      try {
        const news = await source();
        if (news && news.length > 0) {
          console.log(`✅ 備用新聞源成功獲取 ${news.length} 則新聞`);
          return news;
        }
      } catch (error) {
        console.log(`❌ 備用新聞源失敗: ${error.message}`);
        continue;
      }
    }

    throw new Error('所有備用新聞源都無法使用');
  }

  /**
   * 從 NewsData.io 獲取新聞
   * @param {string} query - 搜尋關鍵字
   * @param {number} limit - 新聞數量
   * @returns {Promise<Array>} 新聞列表
   */
  async getNewsFromNewsData(query, limit) {
    if (!this.newsDataApiKey) {
      throw new Error('NewsData.io API Key 未配置');
    }

    const response = await axios.get('https://newsdata.io/api/1/news', {
      params: {
        apikey: this.newsDataApiKey,
        q: query,
        language: 'en',
        category: 'business,technology',
        size: limit
      },
      timeout: 10000
    });

    if (response.data.status === 'success' && response.data.results) {
      return response.data.results.map(article => ({
        title: article.title,
        description: article.description,
        url: article.link,
        publishedAt: new Date(article.pubDate).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
        source: article.source_id || 'NewsData.io'
      }));
    }

    throw new Error('NewsData.io 無有效新聞');
  }


  /**
   * 搜尋關鍵字新聞
   * @param {string} keyword - 搜尋關鍵字
   * @param {number} limit - 新聞數量
   * @returns {Promise<Array>} 新聞列表
   */
  async searchNewsByKeyword(keyword, limit = 5) {
    return this.getCryptoNews(keyword, limit);
  }

  /**
   * 獲取熱門新聞
   * @param {number} limit - 新聞數量
   * @returns {Promise<Array>} 新聞列表
   */
  async getTopCryptoNews(limit = 5) {
    return this.getCryptoNews('cryptocurrency bitcoin ethereum', limit);
  }
}

module.exports = new BackupNewsService();
