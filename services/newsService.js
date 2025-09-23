const axios = require('axios');
const config = require('../config');

class NewsService {
  constructor() {
    this.apiKey = config.news.apiKey;
    this.baseUrl = config.news.baseUrl;
    this.defaultQuery = config.news.defaultQuery;
    this.topHeadlinesEndpoint = config.news.topHeadlinesEndpoint;
    this.everythingEndpoint = config.news.everythingEndpoint;
    this.pageSize = config.news.pageSize;
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
      
      if (coin && config.supportedCoins.includes(coin.toLowerCase())) {
        query = `${coin.toLowerCase()} OR ${coin.toUpperCase()}`;
      }

      // 計算一天前的時間
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const fromDate = oneDayAgo.toISOString().split('T')[0];

      const response = await axios.get(`${this.baseUrl}${this.everythingEndpoint}`, {
        params: {
          q: query,
          language: 'en', // 改為英文，中文新聞較少
          sortBy: 'publishedAt',
          from: fromDate, // 只獲取最近24小時的新聞
          pageSize: limit,
          apiKey: this.apiKey
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9,zh-TW;q=0.8,zh;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Referer': 'https://newsapi.org/',
          'Origin': 'https://newsapi.org',
          'Connection': 'keep-alive',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        timeout: 20000,
        httpVersion: '1.1',
        maxRedirects: 5
      });

      if (response.data.status === 'ok') {
        return this.formatNews(response.data.articles);
      } else {
        throw new Error('NewsAPI 回應錯誤');
      }
      } catch (error) {
        console.error('獲取新聞失敗:', error.message);
        throw new Error(`獲取 ${coin ? coin.toUpperCase() : '加密貨幣'} 新聞失敗: ${error.message}`);
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
      publishedAt: new Date(article.publishedAt).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
      source: article.source.name
    }));
  }

  /**
   * 備用新聞資料（當 API 失敗時使用）
   * @param {number} count - 新聞數量
   * @param {string} keyword - 關鍵字
   * @returns {Array} 備用新聞
   */
  getFallbackNews(count, keyword = '加密貨幣') {
    console.log('使用備用新聞');
    const fallback = [
      { title: `${keyword}市場動態更新`, url: 'https://example.com/crypto-update', source: '假新聞源', publishedAt: new Date().toISOString() },
      { title: `${keyword}技術分析報告`, url: 'https://example.com/tech-report', source: '假新聞源', publishedAt: new Date().toISOString() },
      { title: `${keyword}最新政策影響`, url: 'https://example.com/policy-impact', source: '假新聞源', publishedAt: new Date().toISOString() },
      { title: `${keyword}投資者情緒分析`, url: 'https://example.com/investor-sentiment', source: '假新聞源', publishedAt: new Date().toISOString() },
      { title: `${keyword}區塊鏈創新應用`, url: 'https://example.com/blockchain-innovation', source: '假新聞源', publishedAt: new Date().toISOString() },
    ];
    return fallback.slice(0, count);
  }

  /**
   * 獲取每日新聞摘要
   * @returns {Promise<Array>} 新聞摘要
   */
  async getDailyNewsSummary() {
    return await this.getCryptoNews(null, 3);
  }

  /**
   * 根據關鍵字獲取新聞
   * @param {string} keyword - 關鍵字
   * @param {number} count - 新聞數量
   * @returns {Promise<Array>} 新聞列表
   */
  async getNewsByKeyword(keyword, count = 3) {
    try {
      // 計算一天前的時間
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const fromDate = oneDayAgo.toISOString().split('T')[0];

      console.log(`🔍 搜尋新聞: ${keyword}, 日期: ${fromDate}`);

      const response = await axios.get(`${this.baseUrl}${this.everythingEndpoint}`, {
        params: {
          q: keyword,
          language: 'en', // 改為英文，中文新聞較少
          sortBy: 'publishedAt',
          from: fromDate,
          apiKey: this.apiKey,
          pageSize: count,
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9,zh-TW;q=0.8,zh;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Referer': 'https://newsapi.org/',
          'Origin': 'https://newsapi.org',
          'Connection': 'keep-alive',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        timeout: 20000,
        httpVersion: '1.1',
        maxRedirects: 5
      });

      console.log(`📰 找到 ${response.data.articles?.length || 0} 篇文章`);

      if (response.data.articles && response.data.articles.length > 0) {
        return response.data.articles.map(article => ({
          title: article.title,
          url: article.url,
          source: article.source.name,
          publishedAt: article.publishedAt,
        }));
      }
      return this.getFallbackNews(count, keyword);
    } catch (error) {
      console.error(`獲取 ${keyword} 新聞失敗:`, error.message);
      if (error.response) {
        console.error('API 回應:', error.response.status, error.response.data);
      }
      return this.getFallbackNews(count, keyword);
    }
  }

  /**
   * 獲取前幾條加密貨幣新聞
   * @param {number} count - 新聞數量
   * @returns {Promise<Array>} 新聞列表
   */
  async getTopCryptoNews(count = 3) {
    try {
      // 計算一天前的時間
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const fromDate = oneDayAgo.toISOString().split('T')[0];

      console.log(`🔍 搜尋熱門新聞: ${this.defaultQuery}, 日期: ${fromDate}`);

      const response = await axios.get(`${this.baseUrl}${this.everythingEndpoint}`, {
        params: {
          q: this.defaultQuery,
          language: 'en', // 改為英文，中文新聞較少
          sortBy: 'publishedAt',
          from: fromDate,
          apiKey: this.apiKey,
          pageSize: count,
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9,zh-TW;q=0.8,zh;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Referer': 'https://newsapi.org/',
          'Origin': 'https://newsapi.org',
          'Connection': 'keep-alive',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        timeout: 20000,
        httpVersion: '1.1',
        maxRedirects: 5
      });

      console.log(`📰 找到 ${response.data.articles?.length || 0} 篇熱門新聞`);

      if (response.data.articles && response.data.articles.length > 0) {
        return response.data.articles.map(article => ({
          title: article.title,
          url: article.url,
          source: article.source.name,
          publishedAt: new Date(article.publishedAt).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
        }));
      }
      return this.getFallbackNews(count);
    } catch (error) {
      console.error('獲取新聞失敗:', error.message);
      throw new Error(`獲取熱門新聞失敗: ${error.message}`);
    }
  }


  /**
   * 截斷過長的新聞標題
   * @param {string} title - 原始標題
   * @param {number} maxLength - 最大長度
   * @returns {string} 截斷後的標題
   */
  truncateTitle(title, maxLength = 80) {
    if (!title) return '無標題';
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  }



  /**
   * 格式化新聞訊息
   * @param {Array} newsArticles - 新聞文章陣列
   * @returns {string} 格式化後的新聞訊息
   */
  formatNewsMessage(newsArticles) {
    if (!newsArticles || newsArticles.length === 0) {
      return '目前沒有最新新聞。';
    }
    return newsArticles.map((news, index) =>
      `${index + 1}. ${news.title}\n來源: ${news.source}\n連結: ${news.url}`
    ).join('\n\n');
  }
}

module.exports = new NewsService();
