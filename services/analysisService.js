const axios = require('axios');
const config = require('../config');

class AnalysisService {
  constructor() {
    this.baseUrl = config.coingecko.baseUrl;
  }

  /**
   * 獲取技術分析數據
   * @param {string} coin - 加密貨幣代號
   * @param {number} days - 天數
   * @returns {Promise<Object>} 技術分析數據
   */
  async getTechnicalAnalysis(coin, days = 7) {
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

      // 獲取價格歷史數據
      const response = await axios.get(`${this.baseUrl}/coins/${coinGeckoId}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: days
        }
      });

      const prices = response.data.prices;
      const volumes = response.data.total_volumes;

      // 計算技術指標
      const analysis = this.calculateTechnicalIndicators(prices, volumes);
      
      return {
        coin: coin.toUpperCase(),
        period: `${days}天`,
        currentPrice: prices[prices.length - 1][1],
        analysis: analysis,
        lastUpdated: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
      };

    } catch (error) {
      console.error('獲取技術分析失敗:', error.message);
      return this.getFallbackAnalysis(coin);
    }
  }

  /**
   * 計算技術指標
   * @param {Array} prices - 價格數據
   * @param {Array} volumes - 交易量數據
   * @returns {Object} 技術指標
   */
  calculateTechnicalIndicators(prices, volumes) {
    const priceValues = prices.map(p => p[1]);
    const volumeValues = volumes.map(v => v[1]);

    // 計算移動平均線
    const sma7 = this.calculateSMA(priceValues, 7);
    const sma14 = this.calculateSMA(priceValues, 14);

    // 計算 RSI
    const rsi = this.calculateRSI(priceValues, 14);

    // 計算價格變化
    const priceChange = ((priceValues[priceValues.length - 1] - priceValues[0]) / priceValues[0]) * 100;

    // 計算波動率
    const volatility = this.calculateVolatility(priceValues);

    // 計算支撐阻力位
    const supportResistance = this.calculateSupportResistance(priceValues);

    // 分析趨勢
    const trend = this.analyzeTrend(priceValues, sma7, sma14);

    // 分析交易量
    const volumeAnalysis = this.analyzeVolume(volumeValues);

    return {
      sma7: sma7[sma7.length - 1],
      sma14: sma14[sma14.length - 1],
      rsi: rsi[rsi.length - 1],
      priceChange: priceChange,
      volatility: volatility,
      support: supportResistance.support,
      resistance: supportResistance.resistance,
      trend: trend,
      volumeAnalysis: volumeAnalysis
    };
  }

  /**
   * 計算簡單移動平均線
   * @param {Array} prices - 價格陣列
   * @param {number} period - 週期
   * @returns {Array} SMA 陣列
   */
  calculateSMA(prices, period) {
    const sma = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  }

  /**
   * 計算 RSI
   * @param {Array} prices - 價格陣列
   * @param {number} period - 週期
   * @returns {Array} RSI 陣列
   */
  calculateRSI(prices, period) {
    const rsi = [];
    const gains = [];
    const losses = [];

    // 計算價格變化
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    // 計算初始平均收益和損失
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    for (let i = period; i < gains.length; i++) {
      avgGain = (avgGain * (period - 1) + gains[i]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

      const rs = avgGain / avgLoss;
      const rsiValue = 100 - (100 / (1 + rs));
      rsi.push(rsiValue);
    }

    return rsi;
  }

  /**
   * 計算波動率
   * @param {Array} prices - 價格陣列
   * @returns {number} 波動率
   */
  calculateVolatility(prices) {
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }

    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance) * 100; // 轉換為百分比
  }

  /**
   * 計算支撐阻力位
   * @param {Array} prices - 價格陣列
   * @returns {Object} 支撐阻力位
   */
  calculateSupportResistance(prices) {
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const support = sortedPrices[Math.floor(sortedPrices.length * 0.1)]; // 10% 分位數
    const resistance = sortedPrices[Math.floor(sortedPrices.length * 0.9)]; // 90% 分位數

    return { support, resistance };
  }

  /**
   * 分析趨勢
   * @param {Array} prices - 價格陣列
   * @param {Array} sma7 - 7日移動平均線
   * @param {Array} sma14 - 14日移動平均線
   * @returns {Object} 趨勢分析
   */
  analyzeTrend(prices, sma7, sma14) {
    const currentPrice = prices[prices.length - 1];
    const currentSMA7 = sma7[sma7.length - 1];
    const currentSMA14 = sma14[sma14.length - 1];

    let trend = 'neutral';
    let strength = 'weak';

    if (currentPrice > currentSMA7 && currentSMA7 > currentSMA14) {
      trend = 'bullish';
      strength = currentPrice > currentSMA7 * 1.05 ? 'strong' : 'moderate';
    } else if (currentPrice < currentSMA7 && currentSMA7 < currentSMA14) {
      trend = 'bearish';
      strength = currentPrice < currentSMA7 * 0.95 ? 'strong' : 'moderate';
    }

    return { trend, strength };
  }

  /**
   * 分析交易量
   * @param {Array} volumes - 交易量陣列
   * @returns {Object} 交易量分析
   */
  analyzeVolume(volumes) {
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const currentVolume = volumes[volumes.length - 1];
    const volumeRatio = currentVolume / avgVolume;

    let level = 'normal';
    if (volumeRatio > 2) level = 'high';
    else if (volumeRatio < 0.5) level = 'low';

    return { level, ratio: volumeRatio };
  }

  /**
   * 格式化技術分析訊息
   * @param {Object} data - 技術分析數據
   * @returns {string} 格式化後的訊息
   */
  formatTechnicalAnalysis(data) {
    const { coin, period, currentPrice, analysis, lastUpdated } = data;
    
    const trendEmoji = {
      'bullish': '📈',
      'bearish': '📉',
      'neutral': '➡️'
    };

    const strengthEmoji = {
      'strong': '🔥',
      'moderate': '⚡',
      'weak': '💨'
    };

    const rsiEmoji = analysis.rsi > 70 ? '🔴' : analysis.rsi < 30 ? '🟢' : '🟡';
    const volumeEmoji = analysis.volumeAnalysis.level === 'high' ? '📊' : 
                       analysis.volumeAnalysis.level === 'low' ? '📉' : '📈';

    return `📊 ${coin} 技術分析 (${period})

💰 當前價格: $${currentPrice.toLocaleString()}

📈 趨勢分析:
${trendEmoji[analysis.trend]} 趨勢: ${analysis.trend === 'bullish' ? '看漲' : analysis.trend === 'bearish' ? '看跌' : '中性'}
${strengthEmoji[analysis.trend.strength]} 強度: ${analysis.trend.strength === 'strong' ? '強' : analysis.trend.strength === 'moderate' ? '中等' : '弱'}

📊 技術指標:
• SMA7: $${analysis.sma7.toLocaleString()}
• SMA14: $${analysis.sma14.toLocaleString()}
• RSI: ${analysis.rsi.toFixed(1)} ${rsiEmoji}

📉 價格分析:
• 期間變化: ${analysis.priceChange >= 0 ? '+' : ''}${analysis.priceChange.toFixed(2)}%
• 波動率: ${analysis.volatility.toFixed(2)}%
• 支撐位: $${analysis.support.toLocaleString()}
• 阻力位: $${analysis.resistance.toLocaleString()}

${volumeEmoji} 交易量: ${analysis.volumeAnalysis.level === 'high' ? '高' : analysis.volumeAnalysis.level === 'low' ? '低' : '正常'} (${analysis.volumeAnalysis.ratio.toFixed(1)}x)

⏰ 更新時間: ${lastUpdated}`;
  }

  /**
   * 備用技術分析數據
   * @param {string} coin - 加密貨幣代號
   * @returns {Object} 備用數據
   */
  getFallbackAnalysis(coin) {
    return {
      coin: coin.toUpperCase(),
      period: '7天',
      currentPrice: 50000,
      analysis: {
        sma7: 49500,
        sma14: 49000,
        rsi: 55,
        priceChange: 2.5,
        volatility: 3.2,
        support: 48000,
        resistance: 52000,
        trend: { trend: 'neutral', strength: 'weak' },
        volumeAnalysis: { level: 'normal', ratio: 1.0 }
      },
      lastUpdated: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
    };
  }
}

module.exports = new AnalysisService();
