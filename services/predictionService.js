const axios = require('axios');
const config = require('../config');

class PredictionService {
  constructor() {
    this.baseUrl = config.coingecko.baseUrl;
  }

  /**
   * 生成價格預測
   * @param {string} coin - 加密貨幣代號
   * @param {number} days - 預測天數
   * @returns {Promise<Object>} 價格預測
   */
  async generatePricePrediction(coin, days = 7) {
    try {
      // 移除支援幣種限制，支援所有 CoinGecko 上的加密貨幣

      // 獲取歷史數據
      const historicalData = await this.getHistoricalData(coin, 30);
      
      // 分析趨勢
      const trendAnalysis = this.analyzeTrend(historicalData);
      
      // 計算技術指標
      const technicalIndicators = this.calculateTechnicalIndicators(historicalData);
      
      // 生成預測
      const predictions = this.generatePredictions(historicalData, trendAnalysis, technicalIndicators, days);
      
      // 計算信心度
      const confidence = this.calculatePredictionConfidence(historicalData, trendAnalysis, technicalIndicators);
      
      return {
        coin: coin.toUpperCase(),
        predictions: predictions,
        trendAnalysis: trendAnalysis,
        technicalIndicators: technicalIndicators,
        confidence: confidence,
        riskFactors: this.identifyRiskFactors(historicalData, trendAnalysis),
        lastUpdated: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
      };

    } catch (error) {
      console.error('生成價格預測失敗:', error.message);
      return this.getFallbackPrediction(coin, days);
    }
  }

  /**
   * 獲取歷史數據
   * @param {string} coin - 加密貨幣代號
   * @param {number} days - 天數
   * @returns {Promise<Array>} 歷史數據
   */
  async getHistoricalData(coin, days) {
    try {
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

      const response = await axios.get(`${this.baseUrl}/coins/${coinGeckoId}/market_chart`, {
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
      console.error('獲取歷史數據失敗:', error.message);
      return [];
    }
  }

  /**
   * 分析趨勢
   * @param {Array} data - 歷史數據
   * @returns {Object} 趨勢分析
   */
  analyzeTrend(data) {
    if (data.length < 2) {
      return { direction: 'neutral', strength: 0, volatility: 0 };
    }

    const prices = data.map(d => d.price);
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const totalChange = ((lastPrice - firstPrice) / firstPrice) * 100;

    // 計算趨勢強度
    let trendStrength = 0;
    for (let i = 1; i < prices.length; i++) {
      const change = (prices[i] - prices[i - 1]) / prices[i - 1];
      trendStrength += change;
    }
    trendStrength = (trendStrength / (prices.length - 1)) * 100;

    // 計算波動率
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    const variance = returns.reduce((a, b) => a + Math.pow(b, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance) * 100;

    // 確定趨勢方向
    let direction = 'neutral';
    if (totalChange > 5) direction = 'bullish';
    else if (totalChange < -5) direction = 'bearish';

    return {
      direction: direction,
      strength: Math.abs(trendStrength),
      volatility: volatility,
      totalChange: totalChange
    };
  }

  /**
   * 計算技術指標
   * @param {Array} data - 歷史數據
   * @returns {Object} 技術指標
   */
  calculateTechnicalIndicators(data) {
    if (data.length < 14) {
      return { sma: 0, rsi: 50, momentum: 0 };
    }

    const prices = data.map(d => d.price);
    
    // 計算移動平均線
    const sma = prices.slice(-7).reduce((a, b) => a + b, 0) / 7;
    
    // 計算 RSI
    const rsi = this.calculateRSI(prices, 14);
    
    // 計算動量
    const momentum = ((prices[prices.length - 1] - prices[prices.length - 5]) / prices[prices.length - 5]) * 100;

    return {
      sma: sma,
      rsi: rsi,
      momentum: momentum
    };
  }

  /**
   * 計算 RSI
   * @param {Array} prices - 價格陣列
   * @param {number} period - 週期
   * @returns {number} RSI 值
   */
  calculateRSI(prices, period) {
    if (prices.length < period + 1) return 50;

    const gains = [];
    const losses = [];

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;

    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  /**
   * 生成預測
   * @param {Array} data - 歷史數據
   * @param {Object} trend - 趨勢分析
   * @param {Object} technical - 技術指標
   * @param {number} days - 預測天數
   * @returns {Array} 預測結果
   */
  generatePredictions(data, trend, technical, days) {
    if (data.length === 0) return [];

    const currentPrice = data[data.length - 1].price;
    const predictions = [];

    for (let i = 1; i <= days; i++) {
      // 基於趨勢的預測
      let trendPrediction = currentPrice;
      if (trend.direction === 'bullish') {
        trendPrediction *= (1 + (trend.strength / 100) * i);
      } else if (trend.direction === 'bearish') {
        trendPrediction *= (1 - (trend.strength / 100) * i);
      }

      // 基於技術指標的調整
      let technicalAdjustment = 1;
      if (technical.rsi > 70) {
        technicalAdjustment *= 0.98; // RSI 超買，可能回調
      } else if (technical.rsi < 30) {
        technicalAdjustment *= 1.02; // RSI 超賣，可能反彈
      }

      // 基於動量的調整
      if (technical.momentum > 5) {
        technicalAdjustment *= 1.01;
      } else if (technical.momentum < -5) {
        technicalAdjustment *= 0.99;
      }

      // 添加隨機波動
      const volatility = trend.volatility / 100;
      const randomFactor = 1 + (Math.random() - 0.5) * volatility * 0.1;

      const predictedPrice = trendPrediction * technicalAdjustment * randomFactor;
      
      predictions.push({
        day: i,
        price: predictedPrice,
        change: ((predictedPrice - currentPrice) / currentPrice) * 100,
        confidence: Math.max(0, 100 - (i * 5)) // 信心度隨天數遞減
      });
    }

    return predictions;
  }

  /**
   * 計算預測信心度
   * @param {Array} data - 歷史數據
   * @param {Object} trend - 趨勢分析
   * @param {Object} technical - 技術指標
   * @returns {number} 信心度
   */
  calculatePredictionConfidence(data, trend, technical) {
    let confidence = 50; // 基礎信心度

    // 基於數據量
    if (data.length > 20) confidence += 10;
    else if (data.length < 10) confidence -= 10;

    // 基於趨勢一致性
    if (trend.strength > 2) confidence += 15;
    else if (trend.strength < 0.5) confidence -= 10;

    // 基於波動率
    if (trend.volatility < 5) confidence += 10;
    else if (trend.volatility > 15) confidence -= 15;

    // 基於技術指標
    if (technical.rsi > 30 && technical.rsi < 70) confidence += 5;
    else confidence -= 5;

    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * 識別風險因素
   * @param {Array} data - 歷史數據
   * @param {Object} trend - 趨勢分析
   * @returns {Array} 風險因素
   */
  identifyRiskFactors(data, trend) {
    const risks = [];

    if (trend.volatility > 15) {
      risks.push('高波動率可能導致價格劇烈波動');
    }

    if (trend.strength > 5) {
      risks.push('強趨勢可能面臨反轉風險');
    }

    if (data.length < 15) {
      risks.push('歷史數據不足可能影響預測準確性');
    }

    if (trend.direction === 'neutral' && trend.strength < 1) {
      risks.push('缺乏明確趨勢，價格可能橫盤整理');
    }

    if (risks.length === 0) {
      risks.push('風險因素較少，預測相對可靠');
    }

    return risks;
  }

  /**
   * 格式化價格預測
   * @param {Object} prediction - 預測結果
   * @returns {string} 格式化訊息
   */
  formatPricePrediction(prediction) {
    const { coin, predictions, trendAnalysis, technicalIndicators, confidence, riskFactors } = prediction;

    let message = `🔮 ${coin} 價格預測分析\n\n`;
    
    // 趨勢分析
    message += `📈 趨勢分析:\n`;
    message += `   方向: ${trendAnalysis.direction === 'bullish' ? '📈 看漲' : trendAnalysis.direction === 'bearish' ? '📉 看跌' : '➡️ 中性'}\n`;
    message += `   強度: ${trendAnalysis.strength.toFixed(2)}%\n`;
    message += `   波動率: ${trendAnalysis.volatility.toFixed(2)}%\n`;
    message += `   總變化: ${trendAnalysis.totalChange >= 0 ? '+' : ''}${trendAnalysis.totalChange.toFixed(2)}%\n\n`;

    // 技術指標
    message += `📊 技術指標:\n`;
    message += `   SMA7: $${technicalIndicators.sma.toFixed(2)}\n`;
    message += `   RSI: ${technicalIndicators.rsi.toFixed(1)} ${technicalIndicators.rsi > 70 ? '🔴' : technicalIndicators.rsi < 30 ? '🟢' : '🟡'}\n`;
    message += `   動量: ${technicalIndicators.momentum >= 0 ? '+' : ''}${technicalIndicators.momentum.toFixed(2)}%\n\n`;

    // 預測結果
    message += `🔮 價格預測:\n`;
    predictions.forEach(pred => {
      const changeEmoji = pred.change >= 0 ? '📈' : '📉';
      const changeColor = pred.change >= 0 ? '🟢' : '🔴';
      message += `   第${pred.day}天: $${pred.price.toFixed(2)} ${changeEmoji} ${changeColor}${pred.change >= 0 ? '+' : ''}${pred.change.toFixed(2)}% (信心度: ${pred.confidence}%)\n`;
    });

    message += `\n🎯 預測信心度: ${confidence}%\n\n`;

    // 風險因素
    message += `⚠️ 風險因素:\n`;
    riskFactors.forEach((risk, index) => {
      message += `   ${index + 1}. ${risk}\n`;
    });

    message += `\n⏰ 更新時間: ${prediction.lastUpdated}`;

    return message;
  }

  /**
   * 備用預測
   * @param {string} coin - 加密貨幣代號
   * @param {number} days - 預測天數
   * @returns {Object} 備用數據
   */
  getFallbackPrediction(coin, days) {
    const predictions = [];
    for (let i = 1; i <= days; i++) {
      predictions.push({
        day: i,
        price: 50000,
        change: 0,
        confidence: 0
      });
    }

    return {
      coin: coin.toUpperCase(),
      predictions: predictions,
      trendAnalysis: { direction: 'neutral', strength: 0, volatility: 0, totalChange: 0 },
      technicalIndicators: { sma: 0, rsi: 50, momentum: 0 },
      confidence: 0,
      riskFactors: ['無法獲取預測數據'],
      lastUpdated: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
    };
  }
}

module.exports = new PredictionService();
