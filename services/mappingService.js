const axios = require('axios');

class MappingService {
  constructor() {
    this.apiKey = process.env.COINGECKO_API_KEY;
    this.baseURL = 'https://api.coingecko.com/api/v3';
    this.cache = new Map(); // 緩存映射結果
    this.cacheTimeout = 24 * 60 * 60 * 1000; // 24小時緩存
  }

  /**
   * 動態搜索並映射幣種
   * @param {string} symbol - 幣種代號
   * @returns {Promise<string|null>} - CoinGecko ID 或 null
   */
  async findCoinId(symbol) {
    const lowerSymbol = symbol.toLowerCase();
    
    // 檢查緩存
    if (this.cache.has(lowerSymbol)) {
      const cached = this.cache.get(lowerSymbol);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log(`使用緩存的映射: ${symbol} -> ${cached.coinId}`);
        return cached.coinId;
      } else {
        this.cache.delete(lowerSymbol);
      }
    }

    try {
      console.log(`🔍 正在搜索幣種映射: ${symbol}`);
      
      // 方法1: 直接嘗試使用符號作為 ID
      const directResult = await this.tryDirectMapping(lowerSymbol);
      if (directResult) {
        this.cacheMapping(lowerSymbol, directResult);
        return directResult;
      }

      // 方法2: 搜索幣種列表
      const searchResult = await this.searchCoinList(lowerSymbol);
      if (searchResult) {
        this.cacheMapping(lowerSymbol, searchResult);
        return searchResult;
      }

      // 方法3: 使用搜索 API
      const apiSearchResult = await this.searchWithAPI(lowerSymbol);
      if (apiSearchResult) {
        this.cacheMapping(lowerSymbol, apiSearchResult);
        return apiSearchResult;
      }

      console.log(`❌ 無法找到幣種映射: ${symbol}`);
      return null;

    } catch (error) {
      console.error(`搜索幣種映射失敗: ${symbol}`, error.message);
      return null;
    }
  }

  /**
   * 直接嘗試使用符號作為 ID
   */
  async tryDirectMapping(symbol) {
    try {
      const response = await axios.get(`${this.baseURL}/simple/price`, {
        params: {
          ids: symbol,
          vs_currencies: 'usd',
          include_24hr_change: true
        },
        timeout: 5000
      });

      if (response.data && response.data[symbol]) {
        console.log(`✅ 直接映射成功: ${symbol} -> ${symbol}`);
        return symbol;
      }
    } catch (error) {
      // 忽略錯誤，繼續嘗試其他方法
    }
    return null;
  }

  /**
   * 搜索幣種列表
   */
  async searchCoinList(symbol) {
    try {
      const response = await axios.get(`${this.baseURL}/coins/list`, {
        timeout: 10000
      });

      if (response.data && Array.isArray(response.data)) {
        // 精確匹配
        const exactMatch = response.data.find(coin => 
          coin.symbol.toLowerCase() === symbol
        );
        
        if (exactMatch) {
          console.log(`✅ 列表搜索成功: ${symbol} -> ${exactMatch.id}`);
          return exactMatch.id;
        }

        // 部分匹配（包含符號）
        const partialMatch = response.data.find(coin => 
          coin.symbol.toLowerCase().includes(symbol) || 
          symbol.includes(coin.symbol.toLowerCase())
        );
        
        if (partialMatch) {
          console.log(`✅ 部分匹配成功: ${symbol} -> ${partialMatch.id}`);
          return partialMatch.id;
        }
      }
    } catch (error) {
      console.error('搜索幣種列表失敗:', error.message);
    }
    return null;
  }

  /**
   * 使用搜索 API
   */
  async searchWithAPI(symbol) {
    try {
      const response = await axios.get(`${this.baseURL}/search`, {
        params: {
          query: symbol
        },
        timeout: 5000
      });

      if (response.data && response.data.coins && response.data.coins.length > 0) {
        // 優先選擇精確匹配
        const exactMatch = response.data.coins.find(coin => 
          coin.symbol.toLowerCase() === symbol
        );
        
        if (exactMatch) {
          console.log(`✅ API搜索成功: ${symbol} -> ${exactMatch.id}`);
          return exactMatch.id;
        }

        // 選擇第一個結果
        const firstResult = response.data.coins[0];
        console.log(`✅ API搜索成功 (首選): ${symbol} -> ${firstResult.id}`);
        return firstResult.id;
      }
    } catch (error) {
      console.error('API搜索失敗:', error.message);
    }
    return null;
  }

  /**
   * 緩存映射結果
   */
  cacheMapping(symbol, coinId) {
    this.cache.set(symbol, {
      coinId: coinId,
      timestamp: Date.now()
    });
    console.log(`💾 緩存映射: ${symbol} -> ${coinId}`);
  }

  /**
   * 獲取緩存統計
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([symbol, data]) => ({
        symbol,
        coinId: data.coinId,
        age: Math.round((Date.now() - data.timestamp) / 1000 / 60) // 分鐘
      }))
    };
  }

  /**
   * 清除過期緩存
   */
  clearExpiredCache() {
    const now = Date.now();
    let cleared = 0;
    
    for (const [symbol, data] of this.cache.entries()) {
      if (now - data.timestamp >= this.cacheTimeout) {
        this.cache.delete(symbol);
        cleared++;
      }
    }
    
    if (cleared > 0) {
      console.log(`🧹 清除了 ${cleared} 個過期緩存`);
    }
    
    return cleared;
  }
}

module.exports = new MappingService();
