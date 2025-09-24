const axios = require('axios');
const config = require('../config');

class PortfolioService {
  constructor() {
    this.baseUrl = config.coingecko.baseUrl;
    // 用戶投資組合 (實際應用中應使用資料庫)
    this.userPortfolios = new Map();
  }

  /**
   * 添加投資組合項目
   * @param {string} userId - 用戶 ID
   * @param {string} coin - 加密貨幣代號
   * @param {number} amount - 持有數量
   * @param {number} buyPrice - 買入價格
   * @returns {boolean} 是否添加成功
   */
  addPortfolioItem(userId, coin, amount, buyPrice) {
    // 移除支援幣種限制，支援所有 CoinGecko 上的加密貨幣
    if (false) {
      return false;
    }

    if (amount <= 0 || buyPrice <= 0) {
      return false;
    }

    if (!this.userPortfolios.has(userId)) {
      this.userPortfolios.set(userId, []);
    }

    const portfolio = this.userPortfolios.get(userId);
    const existingItem = portfolio.find(item => item.coin === coin.toLowerCase());

    if (existingItem) {
      // 更新現有項目 (加權平均價格)
      const totalAmount = existingItem.amount + amount;
      const totalValue = (existingItem.amount * existingItem.buyPrice) + (amount * buyPrice);
      existingItem.amount = totalAmount;
      existingItem.buyPrice = totalValue / totalAmount;
    } else {
      // 添加新項目
      portfolio.push({
        coin: coin.toLowerCase(),
        amount: amount,
        buyPrice: buyPrice,
        addedAt: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
      });
    }

    return true;
  }

  /**
   * 獲取用戶投資組合
   * @param {string} userId - 用戶 ID
   * @returns {Array} 投資組合
   */
  getUserPortfolio(userId) {
    return this.userPortfolios.get(userId) || [];
  }

  /**
   * 分析投資組合
   * @param {string} userId - 用戶 ID
   * @returns {Promise<Object>} 投資組合分析
   */
  async analyzePortfolio(userId) {
    try {
      const portfolio = this.getUserPortfolio(userId);
      
      if (portfolio.length === 0) {
        return {
          totalValue: 0,
          totalGainLoss: 0,
          totalGainLossPercent: 0,
          diversification: 0,
          riskLevel: 'N/A',
          recommendations: ['請先添加投資組合項目'],
          items: []
        };
      }

      // 獲取所有幣種的當前價格
      const coins = portfolio.map(item => item.coin);
      const prices = await this.getMultipleCoinPrices(coins);

      let totalValue = 0;
      let totalCost = 0;
      const items = [];

      portfolio.forEach(item => {
        const currentPrice = prices.find(p => p.symbol.toLowerCase() === item.coin)?.price?.usd || 0;
        const currentValue = item.amount * currentPrice;
        const cost = item.amount * item.buyPrice;
        const gainLoss = currentValue - cost;
        const gainLossPercent = (gainLoss / cost) * 100;

        totalValue += currentValue;
        totalCost += cost;

        items.push({
          coin: item.coin.toUpperCase(),
          amount: item.amount,
          buyPrice: item.buyPrice,
          currentPrice: currentPrice,
          currentValue: currentValue,
          cost: cost,
          gainLoss: gainLoss,
          gainLossPercent: gainLossPercent
        });
      });

      const totalGainLoss = totalValue - totalCost;
      const totalGainLossPercent = (totalGainLoss / totalCost) * 100;

      // 計算多樣化程度
      const diversification = this.calculateDiversification(items);
      
      // 計算風險等級
      const riskLevel = this.calculateRiskLevel(items, totalGainLossPercent);

      // 生成建議
      const recommendations = this.generateRecommendations(items, diversification, riskLevel);

      return {
        totalValue,
        totalGainLoss,
        totalGainLossPercent,
        diversification,
        riskLevel,
        recommendations,
        items,
        lastUpdated: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
      };

    } catch (error) {
      console.error('投資組合分析失敗:', error.message);
      return {
        totalValue: 0,
        totalGainLoss: 0,
        totalGainLossPercent: 0,
        diversification: 0,
        riskLevel: 'N/A',
        recommendations: ['分析失敗，請稍後再試'],
        items: []
      };
    }
  }

  /**
   * 獲取多個幣種價格
   * @param {Array} coins - 幣種陣列
   * @returns {Promise<Array>} 價格陣列
   */
  async getMultipleCoinPrices(coins) {
    try {
      const coinGeckoIdsMap = {
        'btc': 'bitcoin', 'eth': 'ethereum', 'usdt': 'tether', 'bnb': 'binancecoin', 'sol': 'solana',
        'xrp': 'ripple', 'usdc': 'usd-coin', 'steth': 'staked-ether', 'ada': 'cardano', 'avax': 'avalanche-2',
        'trx': 'tron', 'wbtc': 'wrapped-bitcoin', 'link': 'chainlink', 'dot': 'polkadot', 'matic': 'matic-network',
        'dai': 'dai', 'shib': 'shiba-inu', 'ltc': 'litecoin', 'bch': 'bitcoin-cash', 'uni': 'uniswap',
        'atom': 'cosmos', 'etc': 'ethereum-classic', 'xlm': 'stellar', 'near': 'near', 'algo': 'algorand',
        'vet': 'vechain', 'fil': 'filecoin', 'icp': 'internet-computer', 'hbar': 'hedera-hashgraph', 'apt': 'aptos'
      };

      const coinIds = coins.map(coin => coinGeckoIdsMap[coin.toLowerCase()]).filter(id => id).join(',');
      
      const response = await axios.get(`${this.baseUrl}/simple/price`, {
        params: {
          ids: coinIds,
          vs_currencies: 'usd',
          include_24hr_change: true
        }
      });

      return Object.keys(response.data).map(coinId => {
        const originalSymbol = Object.keys(coinGeckoIdsMap).find(key => coinGeckoIdsMap[key] === coinId);
        return {
          symbol: originalSymbol ? originalSymbol.toUpperCase() : coinId.toUpperCase(),
          price: { usd: response.data[coinId].usd },
          change24h: response.data[coinId].usd_24h_change
        };
      });
    } catch (error) {
      console.error('獲取價格失敗:', error.message);
      return [];
    }
  }

  /**
   * 計算多樣化程度
   * @param {Array} items - 投資組合項目
   * @returns {number} 多樣化程度 (0-100)
   */
  calculateDiversification(items) {
    if (items.length <= 1) return 0;
    
    const totalValue = items.reduce((sum, item) => sum + item.currentValue, 0);
    const weights = items.map(item => item.currentValue / totalValue);
    
    // 計算赫芬達爾指數 (Herfindahl Index)
    const herfindahlIndex = weights.reduce((sum, weight) => sum + weight * weight, 0);
    
    // 轉換為多樣化程度 (0-100)
    return Math.round((1 - herfindahlIndex) * 100);
  }

  /**
   * 計算風險等級
   * @param {Array} items - 投資組合項目
   * @param {number} totalGainLossPercent - 總損益百分比
   * @returns {string} 風險等級
   */
  calculateRiskLevel(items, totalGainLossPercent) {
    const highVolatilityCoins = ['shib', 'doge', 'pepe', 'floki'];
    const hasHighVolatility = items.some(item => 
      highVolatilityCoins.includes(item.coin.toLowerCase())
    );

    if (hasHighVolatility && Math.abs(totalGainLossPercent) > 20) {
      return '高風險';
    } else if (Math.abs(totalGainLossPercent) > 10) {
      return '中風險';
    } else {
      return '低風險';
    }
  }

  /**
   * 生成投資建議
   * @param {Array} items - 投資組合項目
   * @param {number} diversification - 多樣化程度
   * @param {string} riskLevel - 風險等級
   * @returns {Array} 建議列表
   */
  generateRecommendations(items, diversification, riskLevel) {
    const recommendations = [];

    // 多樣化建議
    if (diversification < 30) {
      recommendations.push('💡 建議增加投資組合多樣化，降低單一資產風險');
    }

    // 風險建議
    if (riskLevel === '高風險') {
      recommendations.push('⚠️ 投資組合風險較高，建議考慮減倉或分散投資');
    }

    // 表現建議
    const losingItems = items.filter(item => item.gainLossPercent < -10);
    if (losingItems.length > 0) {
      recommendations.push('📉 部分資產表現不佳，建議重新評估投資策略');
    }

    const winningItems = items.filter(item => item.gainLossPercent > 20);
    if (winningItems.length > 0) {
      recommendations.push('📈 部分資產表現優異，可考慮獲利了結');
    }

    // 平衡建議
    if (recommendations.length === 0) {
      recommendations.push('✅ 投資組合表現良好，建議持續關注市場動態');
    }

    return recommendations;
  }

  /**
   * 格式化投資組合分析
   * @param {Object} analysis - 分析結果
   * @returns {string} 格式化訊息
   */
  formatPortfolioAnalysis(analysis) {
    if (analysis.items.length === 0) {
      return '📊 投資組合分析\n\n您還沒有添加任何投資組合項目。\n\n使用 /portfolio add [幣種] [數量] [買入價格] 來添加投資項目。';
    }

    const gainLossEmoji = analysis.totalGainLoss >= 0 ? '📈' : '📉';
    const gainLossColor = analysis.totalGainLoss >= 0 ? '🟢' : '🔴';

    let message = `📊 投資組合分析\n\n`;
    message += `💰 總價值: $${analysis.totalValue.toLocaleString()}\n`;
    message += `${gainLossEmoji} 總損益: ${gainLossColor}${analysis.totalGainLoss >= 0 ? '+' : ''}${analysis.totalGainLoss.toFixed(2)} (${analysis.totalGainLossPercent >= 0 ? '+' : ''}${analysis.totalGainLossPercent.toFixed(2)}%)\n`;
    message += `📊 多樣化程度: ${analysis.diversification}%\n`;
    message += `⚠️ 風險等級: ${analysis.riskLevel}\n\n`;

    message += `📋 投資項目:\n`;
    analysis.items.forEach((item, index) => {
      const itemEmoji = item.gainLoss >= 0 ? '🟢' : '🔴';
      message += `${index + 1}. ${item.coin}: ${item.amount} 枚\n`;
      message += `   買入: $${item.buyPrice.toFixed(2)} | 現價: $${item.currentPrice.toFixed(2)}\n`;
      message += `   損益: ${itemEmoji}${item.gainLoss >= 0 ? '+' : ''}${item.gainLossPercent.toFixed(2)}%\n\n`;
    });

    message += `💡 投資建議:\n`;
    analysis.recommendations.forEach(rec => {
      message += `${rec}\n`;
    });

    message += `\n⏰ 更新時間: ${analysis.lastUpdated}`;

    return message;
  }

  /**
   * 清除用戶投資組合
   * @param {string} userId - 用戶 ID
   * @returns {boolean} 是否清除成功
   */
  clearPortfolio(userId) {
    return this.userPortfolios.delete(userId);
  }
}

module.exports = new PortfolioService();
