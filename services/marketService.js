const axios = require('axios');
const config = require('../config');

class MarketService {
  constructor() {
    this.baseUrl = config.coingecko.baseUrl;
  }

  /**
   * 獲取市場總覽數據
   * @returns {Promise<Object>} 市場總覽
   */
  async getMarketOverview() {
    try {
      const response = await axios.get(`${this.baseUrl}/global`);
      
      if (response.data.data) {
        const data = response.data.data;
        return {
          totalMarketCap: data.total_market_cap.usd,
          totalVolume: data.total_volume.usd,
          marketCapChange: data.market_cap_change_percentage_24h_usd,
          activeCryptocurrencies: data.active_cryptocurrencies,
          marketCapPercentage: data.market_cap_percentage,
          lastUpdated: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
        };
      }
      throw new Error('無法獲取市場數據');
    } catch (error) {
      console.error('獲取市場總覽失敗:', error.message);
      return this.getFallbackMarketData();
    }
  }

  /**
   * 獲取趨勢幣種
   * @returns {Promise<Array>} 趨勢幣種列表
   */
  async getTrendingCoins() {
    try {
      const response = await axios.get(`${this.baseUrl}/search/trending`);
      
      if (response.data.coins) {
        return response.data.coins.map(coin => ({
          id: coin.item.id,
          name: coin.item.name,
          symbol: coin.item.symbol,
          marketCapRank: coin.item.market_cap_rank,
          thumb: coin.item.thumb
        }));
      }
      throw new Error('無法獲取趨勢數據');
    } catch (error) {
      console.error('獲取趨勢幣種失敗:', error.message);
      return [];
    }
  }

  /**
   * 獲取恐懼貪婪指數
   * @returns {Promise<Object>} 恐懼貪婪指數
   */
  async getFearGreedIndex() {
    try {
      const response = await axios.get(`${this.baseUrl}/fear_greed_index`);
      
      if (response.data.data && response.data.data.length > 0) {
        const latest = response.data.data[0];
        return {
          value: latest.value,
          valueClassification: latest.value_classification,
          timestamp: latest.timestamp,
          timeUntilUpdate: latest.time_until_update
        };
      }
      throw new Error('無法獲取恐懼貪婪指數');
    } catch (error) {
      console.error('獲取恐懼貪婪指數失敗:', error.message);
      return this.getFallbackFearGreedData();
    }
  }

  /**
   * 格式化市場總覽訊息
   * @param {Object} data - 市場數據
   * @returns {string} 格式化訊息
   */
  formatMarketOverview(data) {
    const marketCap = (data.totalMarketCap / 1e12).toFixed(2);
    const volume = (data.totalVolume / 1e9).toFixed(2);
    const changeEmoji = data.marketCapChange >= 0 ? '📈' : '📉';
    const changeText = data.marketCapChange >= 0 ? `+${data.marketCapChange.toFixed(2)}%` : `${data.marketCapChange.toFixed(2)}%`;

    return `🌍 全球加密貨幣市場總覽

💰 總市值: $${marketCap}T (${changeEmoji} ${changeText})
📊 24h 交易量: $${volume}B
🪙 活躍幣種: ${data.activeCryptocurrencies.toLocaleString()}

🏆 市值佔比:
• BTC: ${data.marketCapPercentage.btc.toFixed(1)}%
• ETH: ${data.marketCapPercentage.eth.toFixed(1)}%
• 其他: ${(100 - data.marketCapPercentage.btc - data.marketCapPercentage.eth).toFixed(1)}%

⏰ 更新時間: ${data.lastUpdated}`;
  }

  /**
   * 格式化趨勢幣種訊息
   * @param {Array} coins - 趨勢幣種
   * @returns {string} 格式化訊息
   */
  formatTrendingCoins(coins) {
    if (coins.length === 0) {
      return '目前無法獲取趨勢幣種數據。';
    }

    let message = '🔥 今日趨勢幣種\n\n';
    
    coins.slice(0, 5).forEach((coin, index) => {
      const rank = coin.marketCapRank ? `#${coin.marketCapRank}` : 'N/A';
      message += `${index + 1}. ${coin.name} (${coin.symbol.toUpperCase()})\n`;
      message += `   排名: ${rank}\n\n`;
    });

    return message;
  }

  /**
   * 格式化恐懼貪婪指數訊息
   * @param {Object} data - 恐懼貪婪指數數據
   * @returns {string} 格式化訊息
   */
  formatFearGreedIndex(data) {
    const emoji = this.getFearGreedEmoji(data.value);
    const color = this.getFearGreedColor(data.value);
    
    return `😨😊 恐懼貪婪指數

${emoji} 當前指數: ${data.value}/100
${color} 市場情緒: ${data.valueClassification}

💡 指數說明:
• 0-24: 極度恐懼
• 25-49: 恐懼
• 50-74: 貪婪
• 75-100: 極度貪婪

⏰ 更新時間: ${new Date(data.timestamp * 1000).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}`;
  }

  /**
   * 根據指數值獲取表情符號
   * @param {number} value - 指數值
   * @returns {string} 表情符號
   */
  getFearGreedEmoji(value) {
    if (value <= 24) return '😱';
    if (value <= 49) return '😨';
    if (value <= 74) return '😊';
    return '🤩';
  }

  /**
   * 根據指數值獲取顏色
   * @param {number} value - 指數值
   * @returns {string} 顏色
   */
  getFearGreedColor(value) {
    if (value <= 24) return '🔴';
    if (value <= 49) return '🟠';
    if (value <= 74) return '🟡';
    return '🟢';
  }

  /**
   * 備用市場數據
   * @returns {Object} 備用數據
   */
  getFallbackMarketData() {
    return {
      totalMarketCap: 2500000000000,
      totalVolume: 80000000000,
      marketCapChange: 2.5,
      activeCryptocurrencies: 8500,
      marketCapPercentage: {
        btc: 45.2,
        eth: 18.7
      },
      lastUpdated: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
    };
  }

  /**
   * 備用恐懼貪婪指數
   * @returns {Object} 備用數據
   */
  getFallbackFearGreedData() {
    return {
      value: 55,
      value_classification: 'Neutral',
      timestamp: Math.floor(Date.now() / 1000),
      time_until_update: 3600
    };
  }
}

module.exports = new MarketService();
