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
        if (error.message.includes('timeout')) {
          console.log('⏰ 請求超時，可能是網路問題或 API 響應慢');
        } else if (error.message.includes('API Key')) {
          console.log('🔑 API Key 未配置或無效');
        } else if (error.message.includes('403') || error.message.includes('401')) {
          console.log('🚫 API 訪問被拒絕，可能是額度用完或配置錯誤');
        }
        continue;
      }
    }

    // 如果所有備用源都失敗，拋出錯誤
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
      timeout: 20000
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
   * 獲取熱門新聞
   * @param {number} limit - 新聞數量
   * @returns {Promise<Array>} 新聞列表
   */
  async getTopCryptoNews(limit = 5) {
    return this.getCryptoNews('cryptocurrency bitcoin ethereum', limit);
  }

}

module.exports = new BackupNewsService();
