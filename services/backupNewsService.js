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

    // 如果所有備用源都失敗，返回基本的加密貨幣新聞
    console.log('🔄 使用基本備用新聞...');
    return this.getBasicCryptoNews(query, limit);
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

  /**
   * 獲取基本加密貨幣新聞 (當所有 API 都失敗時使用)
   * @param {string} query - 搜尋關鍵字
   * @param {number} limit - 新聞數量
   * @returns {Array} 基本新聞列表
   */
  getBasicCryptoNews(query, limit) {
    const now = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
    
    const basicNews = [
      {
        title: '加密貨幣市場持續波動，投資者需謹慎',
        description: '加密貨幣市場今日出現波動，專家建議投資者保持謹慎態度，做好風險管理。',
        url: 'https://coinmarketcap.com/',
        publishedAt: now,
        source: 'Crypto News Bot'
      },
      {
        title: '比特幣價格走勢分析',
        description: '比特幣價格在近期出現波動，技術分析顯示市場情緒複雜，建議關注關鍵支撐位。',
        url: 'https://coinmarketcap.com/currencies/bitcoin/',
        publishedAt: now,
        source: 'Crypto News Bot'
      },
      {
        title: '以太坊生態系統持續發展',
        description: '以太坊網絡持續升級，DeFi 和 NFT 生態系統保持活躍，開發者活動增加。',
        url: 'https://coinmarketcap.com/currencies/ethereum/',
        publishedAt: now,
        source: 'Crypto News Bot'
      },
      {
        title: '加密貨幣監管動態更新',
        description: '全球各國對加密貨幣的監管政策持續演進，投資者需關注相關法規變化。',
        url: 'https://coinmarketcap.com/',
        publishedAt: now,
        source: 'Crypto News Bot'
      },
      {
        title: '區塊鏈技術應用擴展',
        description: '區塊鏈技術在各行業的應用持續擴展，從金融到供應鏈管理都有新進展。',
        url: 'https://coinmarketcap.com/',
        publishedAt: now,
        source: 'Crypto News Bot'
      }
    ];

    // 根據查詢關鍵字過濾相關新聞
    let filteredNews = basicNews;
    if (query.toLowerCase().includes('bitcoin') || query.toLowerCase().includes('btc')) {
      filteredNews = basicNews.filter(news => 
        news.title.toLowerCase().includes('比特幣') || 
        news.title.toLowerCase().includes('bitcoin')
      );
    } else if (query.toLowerCase().includes('ethereum') || query.toLowerCase().includes('eth')) {
      filteredNews = basicNews.filter(news => 
        news.title.toLowerCase().includes('以太坊') || 
        news.title.toLowerCase().includes('ethereum')
      );
    }

    return filteredNews.slice(0, limit);
  }
}

module.exports = new BackupNewsService();
