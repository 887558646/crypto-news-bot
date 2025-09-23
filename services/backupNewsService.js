const axios = require('axios');
const config = require('../config');

/**
 * 備用新聞服務
 * 整合多個免費新聞 API 作為 NewsAPI 的備用方案
 */
class BackupNewsService {
  constructor() {
    this.newsDataApiKey = process.env.NEWSDATA_API_KEY;
    this.mediastackApiKey = process.env.MEDIASTACK_API_KEY;
    this.bingApiKey = process.env.BING_API_KEY;
  }

  /**
   * 獲取加密貨幣新聞 (多個備用源)
   * @param {string} coin - 幣種名稱
   * @param {number} limit - 新聞數量
   * @returns {Promise<Array>} 新聞列表
   */
  async getCryptoNews(coin = null, limit = 3) {
    const query = coin ? `${coin} cryptocurrency` : 'cryptocurrency bitcoin ethereum';
    
    // 嘗試多個備用源
    const sources = [
      () => this.getNewsFromNewsData(query, limit),
      () => this.getNewsFromMediastack(query, limit),
      () => this.getNewsFromBing(query, limit)
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
   * 從 Mediastack 獲取新聞
   * @param {string} query - 搜尋關鍵字
   * @param {number} limit - 新聞數量
   * @returns {Promise<Array>} 新聞列表
   */
  async getNewsFromMediastack(query, limit) {
    if (!this.mediastackApiKey) {
      throw new Error('Mediastack API Key 未配置');
    }

    const response = await axios.get('http://api.mediastack.com/v1/news', {
      params: {
        access_key: this.mediastackApiKey,
        keywords: query,
        languages: 'en',
        categories: 'business,technology',
        limit: limit,
        sort: 'published_desc'
      },
      timeout: 10000
    });

    if (response.data.data) {
      return response.data.data.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        publishedAt: new Date(article.published_at).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
        source: article.source || 'Mediastack'
      }));
    }

    throw new Error('Mediastack 無有效新聞');
  }

  /**
   * 從 Bing 新聞搜索獲取新聞
   * @param {string} query - 搜尋關鍵字
   * @param {number} limit - 新聞數量
   * @returns {Promise<Array>} 新聞列表
   */
  async getNewsFromBing(query, limit) {
    if (!this.bingApiKey) {
      throw new Error('Bing API Key 未配置');
    }

    const response = await axios.get('https://api.bing.microsoft.com/v7.0/news/search', {
      params: {
        q: query,
        count: limit,
        mkt: 'en-US',
        category: 'Business',
        sortBy: 'Date'
      },
      headers: {
        'Ocp-Apim-Subscription-Key': this.bingApiKey
      },
      timeout: 10000
    });

    if (response.data.value) {
      return response.data.value.map(article => ({
        title: article.name,
        description: article.description,
        url: article.url,
        publishedAt: new Date(article.datePublished).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
        source: article.provider?.[0]?.name || 'Bing News'
      }));
    }

    throw new Error('Bing News 無有效新聞');
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
