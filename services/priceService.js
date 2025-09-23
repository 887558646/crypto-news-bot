const axios = require('axios');
const config = require('../config');

class PriceService {
  constructor() {
    this.baseUrl = config.apis.coinGecko.baseUrl;
  }

  /**
   * 獲取加密貨幣即時價格
   * @param {string} coin - 加密貨幣代號 (btc, eth, sol, bnb, sui)
   * @returns {Promise<Object>} 價格資訊
   */
  async getCoinPrice(coin) {
    try {
      const coinId = config.supportedCoins[coin.toLowerCase()];
      
      if (!coinId) {
        throw new Error(`不支援的加密貨幣: ${coin}`);
      }

      const response = await axios.get(`${this.baseUrl}/simple/price`, {
        params: {
          ids: coinId,
          vs_currencies: 'usd,twd',
          include_24hr_change: true,
          include_24hr_vol: true,
          include_market_cap: true
        }
      });

      if (response.data[coinId]) {
        return this.formatPriceData(coin.toUpperCase(), response.data[coinId]);
      } else {
        throw new Error('無法獲取價格資料');
      }
    } catch (error) {
      console.error('獲取價格失敗:', error.message);
      return this.getFallbackPrice(coin);
    }
  }

  /**
   * 獲取多個加密貨幣價格
   * @param {Array} coins - 加密貨幣代號陣列
   * @returns {Promise<Array>} 價格資訊陣列
   */
  async getMultipleCoinPrices(coins) {
    try {
      const coinIds = coins.map(coin => config.supportedCoins[coin.toLowerCase()]).join(',');
      
      const response = await axios.get(`${this.baseUrl}/simple/price`, {
        params: {
          ids: coinIds,
          vs_currencies: 'usd,twd',
          include_24hr_change: true,
          include_24hr_vol: true,
          include_market_cap: true
        }
      });

      return Object.keys(response.data).map(coinId => {
        const coin = Object.keys(config.supportedCoins).find(
          key => config.supportedCoins[key] === coinId
        );
        return this.formatPriceData(coin.toUpperCase(), response.data[coinId]);
      });
    } catch (error) {
      console.error('獲取多個價格失敗:', error.message);
      return coins.map(coin => this.getFallbackPrice(coin));
    }
  }

  /**
   * 格式化價格資料
   * @param {string} symbol - 加密貨幣符號
   * @param {Object} data - 原始價格資料
   * @returns {Object} 格式化後的價格資料
   */
  formatPriceData(symbol, data) {
    return {
      symbol,
      price: {
        usd: data.usd,
        twd: data.twd
      },
      change24h: data.usd_24h_change,
      volume24h: data.usd_24h_vol,
      marketCap: data.usd_market_cap,
      lastUpdated: new Date().toLocaleString('zh-TW')
    };
  }

  /**
   * 備用價格資料（當 API 失敗時使用）
   * @param {string} coin - 加密貨幣代號
   * @returns {Object} 備用價格資料
   */
  getFallbackPrice(coin) {
    const fallbackPrices = {
      'BTC': { usd: 45000, twd: 1350000, change: 2.5 },
      'ETH': { usd: 3000, twd: 90000, change: 1.8 },
      'SOL': { usd: 100, twd: 3000, change: 3.2 },
      'BNB': { usd: 300, twd: 9000, change: 1.5 },
      'SUI': { usd: 1.5, twd: 45, change: 4.1 }
    };

    const price = fallbackPrices[coin.toUpperCase()] || { usd: 0, twd: 0, change: 0 };

    return {
      symbol: coin.toUpperCase(),
      price: {
        usd: price.usd,
        twd: price.twd
      },
      change24h: price.change,
      volume24h: 0,
      marketCap: 0,
      lastUpdated: new Date().toLocaleString('zh-TW'),
      isFallback: true
    };
  }

  /**
   * 獲取價格歷史資料（用於圖表）
   * @param {string} coin - 加密貨幣代號
   * @param {number} days - 天數
   * @returns {Promise<Array>} 歷史價格資料
   */
  async getPriceHistory(coin, days = 7) {
    try {
      const coinId = config.supportedCoins[coin.toLowerCase()];
      
      if (!coinId) {
        throw new Error(`不支援的加密貨幣: ${coin}`);
      }

      const response = await axios.get(`${this.baseUrl}/coins/${coinId}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: days
        }
      });

      return response.data.prices.map(([timestamp, price]) => ({
        timestamp: new Date(timestamp),
        price: price
      }));
    } catch (error) {
      console.error('獲取價格歷史失敗:', error.message);
      return [];
    }
  }
}

module.exports = new PriceService();
