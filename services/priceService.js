const axios = require('axios');
const config = require('../config');

class PriceService {
  constructor() {
    this.baseUrl = config.coingecko.baseUrl;
    this.priceEndpoint = config.coingecko.priceEndpoint;
    this.chartEndpoint = config.coingecko.chartEndpoint;
  }

  /**
   * 獲取加密貨幣即時價格
   * @param {string} coin - 加密貨幣代號 (btc, eth, sol, bnb, sui)
   * @returns {Promise<Object>} 價格資訊
   */
  async getCoinPrice(coin) {
    try {
      if (!config.supportedCoins.includes(coin.toLowerCase())) {
        throw new Error(`不支援的加密貨幣: ${coin}`);
      }

      // 映射到 CoinGecko 的實際 ID (市值前30大)
      const coinGeckoIds = {
        'btc': 'bitcoin',
        'eth': 'ethereum',
        'usdt': 'tether',
        'bnb': 'binancecoin',
        'sol': 'solana',
        'xrp': 'ripple',
        'usdc': 'usd-coin',
        'steth': 'staked-ether',
        'ada': 'cardano',
        'avax': 'avalanche-2',
        'trx': 'tron',
        'wbtc': 'wrapped-bitcoin',
        'link': 'chainlink',
        'dot': 'polkadot',
        'matic': 'matic-network',
        'dai': 'dai',
        'shib': 'shiba-inu',
        'ltc': 'litecoin',
        'bch': 'bitcoin-cash',
        'uni': 'uniswap',
        'atom': 'cosmos',
        'etc': 'ethereum-classic',
        'xlm': 'stellar',
        'near': 'near',
        'algo': 'algorand',
        'vet': 'vechain',
        'fil': 'filecoin',
        'icp': 'internet-computer',
        'hbar': 'hedera-hashgraph',
        'apt': 'aptos'
      };

      const coinGeckoId = coinGeckoIds[coin.toLowerCase()];
      if (!coinGeckoId) {
        throw new Error(`不支援的加密貨幣: ${coin}`);
      }

      const response = await axios.get(`${this.baseUrl}${this.priceEndpoint}`, {
        params: {
          ids: coinGeckoId,
          vs_currencies: 'usd,twd',
          include_24hr_change: true,
          include_24hr_vol: true,
          include_market_cap: true
        }
      });

      if (response.data[coinGeckoId]) {
        return this.formatPriceData(coin.toUpperCase(), response.data[coinGeckoId]);
      } else {
        throw new Error('無法獲取價格資料');
      }
    } catch (error) {
      console.error('獲取價格失敗:', error.message);
      throw new Error(`獲取 ${coin.toUpperCase()} 價格失敗: ${error.message}`);
    }
  }

  /**
   * 獲取多個加密貨幣價格
   * @param {Array} coins - 加密貨幣代號陣列
   * @returns {Promise<Array>} 價格資訊陣列
   */
  async getMultipleCoinPrices(coins) {
    try {
      const coinIds = coins.filter(coin => config.supportedCoins.includes(coin.toLowerCase())).join(',');
      
      const response = await axios.get(`${this.baseUrl}${this.priceEndpoint}`, {
        params: {
          ids: coinIds,
          vs_currencies: 'usd,twd',
          include_24hr_change: true,
          include_24hr_vol: true,
          include_market_cap: true
        }
      });

      return Object.keys(response.data).map(coinId => {
        return this.formatPriceData(coinId.toUpperCase(), response.data[coinId]);
      });
    } catch (error) {
      console.error('獲取多個價格失敗:', error.message);
      throw new Error(`獲取多個幣種價格失敗: ${error.message}`);
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
      lastUpdated: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
    };
  }

  /**
   * 格式化價格訊息
   * @param {Object} priceData - 價格資料
   * @returns {string} 格式化後的價格訊息
   */
  formatPrice(priceData) {
    if (!priceData) {
      return '無法獲取價格資訊';
    }

    const { symbol, price, change24h } = priceData;
    const changeEmoji = change24h >= 0 ? '📈' : '📉';
    const changeText = change24h >= 0 ? `+${change24h.toFixed(2)}%` : `${change24h.toFixed(2)}%`;

    return `${symbol} 即時價格\n\n💵 USD: $${price.usd.toLocaleString()}\n💱 TWD: NT$${price.twd.toLocaleString()}\n\n${changeEmoji} 24h 變化: ${changeText}`;
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
      lastUpdated: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
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
      if (!config.supportedCoins.includes(coin.toLowerCase())) {
        throw new Error(`不支援的加密貨幣: ${coin}`);
      }

      const response = await axios.get(`${this.baseUrl}${this.chartEndpoint}/${coin.toLowerCase()}/market_chart`, {
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

  /**
   * 獲取 OHLCV 數據（用於技術分析）
   * @param {string} coin - 加密貨幣代號
   * @param {number} days - 天數
   * @returns {Promise<Array>} OHLCV 數據
   */
  async getOHLCVData(coin, days = 30) {
    try {
      if (!config.supportedCoins.includes(coin.toLowerCase())) {
        throw new Error(`不支援的加密貨幣: ${coin}`);
      }

      const coinGeckoIds = {
        'btc': 'bitcoin', 'eth': 'ethereum', 'usdt': 'tether', 'bnb': 'binancecoin', 'sol': 'solana',
        'xrp': 'ripple', 'usdc': 'usd-coin', 'steth': 'staked-ether', 'ada': 'cardano', 'avax': 'avalanche-2',
        'trx': 'tron', 'wbtc': 'wrapped-bitcoin', 'link': 'chainlink', 'dot': 'polkadot', 'matic': 'matic-network',
        'dai': 'dai', 'shib': 'shiba-inu', 'ltc': 'litecoin', 'bch': 'bitcoin-cash', 'uni': 'uniswap',
        'atom': 'cosmos', 'etc': 'ethereum-classic', 'xlm': 'stellar', 'near': 'near', 'algo': 'algorand',
        'vet': 'vechain', 'fil': 'filecoin', 'icp': 'internet-computer', 'hbar': 'hedera-hashgraph', 'apt': 'aptos'
      };
      
      const coinGeckoId = coinGeckoIds[coin.toLowerCase()];
      if (!coinGeckoId) {
        throw new Error(`不支援的加密貨幣: ${coin}`);
      }

      const response = await axios.get(`${this.baseUrl}${this.chartEndpoint}/${coinGeckoId}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: days
        }
      });

      const prices = response.data.prices;
      const volumes = response.data.total_volumes;

      // 轉換為 OHLCV 格式
      const ohlcvData = [];
      for (let i = 0; i < prices.length; i++) {
        const price = prices[i][1];
        const volume = volumes[i][1];
        
        // 由於 CoinGecko 只提供收盤價，我們用收盤價作為 OHLC
        ohlcvData.push({
          timestamp: new Date(prices[i][0]),
          open: price,
          high: price * (1 + Math.random() * 0.02), // 模擬高價
          low: price * (1 - Math.random() * 0.02),  // 模擬低價
          close: price,
          volume: volume
        });
      }

      return ohlcvData;
    } catch (error) {
      console.error('獲取 OHLCV 數據失敗:', error.message);
      return [];
    }
  }
}

module.exports = new PriceService();
