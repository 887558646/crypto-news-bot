const axios = require('axios');
const config = require('../config');

class SentimentService {
  constructor() {
    this.baseUrl = config.coingecko.baseUrl;
  }

  /**
   * 分析市場情緒
   * @param {string} coin - 加密貨幣代號
   * @returns {Promise<Object>} 情緒分析結果
   */
  async analyzeMarketSentiment(coin) {
    try {
      if (!config.supportedCoins.includes(coin.toLowerCase())) {
        throw new Error(`不支援的加密貨幣: ${coin}`);
      }

      // 獲取多個數據源
      const [priceData, socialData, fearGreedData] = await Promise.all([
        this.getPriceSentiment(coin),
        this.getSocialSentiment(coin),
        this.getFearGreedIndex()
      ]);

      // 綜合分析情緒
      const sentiment = this.calculateOverallSentiment(priceData, socialData, fearGreedData);

      return {
        coin: coin.toUpperCase(),
        sentiment: sentiment,
        priceSentiment: priceData,
        socialSentiment: socialData,
        fearGreedIndex: fearGreedData,
        confidence: this.calculateConfidence(priceData, socialData, fearGreedData),
        lastUpdated: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
      };

    } catch (error) {
      console.error('情緒分析失敗:', error.message);
      return this.getFallbackSentiment(coin);
    }
  }

  /**
   * 獲取價格情緒
   * @param {string} coin - 加密貨幣代號
   * @returns {Promise<Object>} 價格情緒
   */
  async getPriceSentiment(coin) {
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

      // 獲取價格歷史數據
      const response = await axios.get(`${this.baseUrl}/coins/${coinGeckoId}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: 7
        }
      });

      const prices = response.data.prices.map(p => p[1]);
      const volumes = response.data.total_volumes.map(v => v[1]);

      // 分析價格趨勢
      const priceChange1h = ((prices[prices.length - 1] - prices[prices.length - 2]) / prices[prices.length - 2]) * 100;
      const priceChange24h = ((prices[prices.length - 1] - prices[prices.length - 25]) / prices[prices.length - 25]) * 100;
      const priceChange7d = ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100;

      // 分析交易量
      const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
      const currentVolume = volumes[volumes.length - 1];
      const volumeRatio = currentVolume / avgVolume;

      // 計算價格情緒分數 (-100 到 100)
      let sentimentScore = 0;
      
      // 短期趨勢權重 40%
      sentimentScore += priceChange1h * 0.4;
      
      // 中期趨勢權重 35%
      sentimentScore += priceChange24h * 0.35;
      
      // 長期趨勢權重 25%
      sentimentScore += priceChange7d * 0.25;

      // 交易量影響
      if (volumeRatio > 1.5) {
        sentimentScore *= 1.2; // 高交易量放大情緒
      } else if (volumeRatio < 0.5) {
        sentimentScore *= 0.8; // 低交易量降低情緒
      }

      return {
        score: Math.max(-100, Math.min(100, sentimentScore)),
        trend: this.getTrendDirection(priceChange24h),
        volume: volumeRatio > 1.2 ? 'high' : volumeRatio < 0.8 ? 'low' : 'normal',
        volatility: this.calculateVolatility(prices)
      };

    } catch (error) {
      console.error('獲取價格情緒失敗:', error.message);
      return { score: 0, trend: 'neutral', volume: 'normal', volatility: 'medium' };
    }
  }

  /**
   * 獲取社群情緒
   * @param {string} coin - 加密貨幣代號
   * @returns {Promise<Object>} 社群情緒
   */
  async getSocialSentiment(coin) {
    try {
      // 模擬社群情緒分析 (實際應用中可整合 Twitter API, Reddit API 等)
      const socialMetrics = {
        mentions: Math.floor(Math.random() * 10000) + 1000,
        sentiment: Math.random() * 2 - 1, // -1 到 1
        engagement: Math.random() * 100,
        influence: Math.random() * 100
      };

      return {
        score: socialMetrics.sentiment * 100, // 轉換為 -100 到 100
        mentions: socialMetrics.mentions,
        engagement: socialMetrics.engagement,
        influence: socialMetrics.influence,
        trend: socialMetrics.sentiment > 0.1 ? 'positive' : socialMetrics.sentiment < -0.1 ? 'negative' : 'neutral'
      };

    } catch (error) {
      console.error('獲取社群情緒失敗:', error.message);
      return { score: 0, mentions: 0, engagement: 0, influence: 0, trend: 'neutral' };
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
          classification: latest.value_classification,
          score: (latest.value - 50) * 2 // 轉換為 -100 到 100
        };
      }
      throw new Error('無法獲取恐懼貪婪指數');
    } catch (error) {
      console.error('獲取恐懼貪婪指數失敗:', error.message);
      return { value: 50, classification: 'Neutral', score: 0 };
    }
  }

  /**
   * 計算整體情緒
   * @param {Object} priceSentiment - 價格情緒
   * @param {Object} socialSentiment - 社群情緒
   * @param {Object} fearGreedIndex - 恐懼貪婪指數
   * @returns {Object} 整體情緒
   */
  calculateOverallSentiment(priceSentiment, socialSentiment, fearGreedIndex) {
    // 加權計算整體情緒分數
    const overallScore = (
      priceSentiment.score * 0.5 +      // 價格情緒權重 50%
      socialSentiment.score * 0.3 +     // 社群情緒權重 30%
      fearGreedIndex.score * 0.2        // 恐懼貪婪指數權重 20%
    );

    return {
      score: Math.max(-100, Math.min(100, overallScore)),
      level: this.getSentimentLevel(overallScore),
      emoji: this.getSentimentEmoji(overallScore),
      description: this.getSentimentDescription(overallScore)
    };
  }

  /**
   * 計算信心度
   * @param {Object} priceSentiment - 價格情緒
   * @param {Object} socialSentiment - 社群情緒
   * @param {Object} fearGreedIndex - 恐懼貪婪指數
   * @returns {number} 信心度 (0-100)
   */
  calculateConfidence(priceSentiment, socialSentiment, fearGreedIndex) {
    // 基於數據一致性計算信心度
    const scores = [priceSentiment.score, socialSentiment.score, fearGreedIndex.score];
    const variance = this.calculateVariance(scores);
    const confidence = Math.max(0, 100 - variance);
    
    return Math.round(confidence);
  }

  /**
   * 計算方差
   * @param {Array} scores - 分數陣列
   * @returns {number} 方差
   */
  calculateVariance(scores) {
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
    return Math.sqrt(variance);
  }

  /**
   * 獲取趨勢方向
   * @param {number} change - 價格變化
   * @returns {string} 趨勢方向
   */
  getTrendDirection(change) {
    if (change > 5) return 'strong_bullish';
    if (change > 1) return 'bullish';
    if (change > -1) return 'neutral';
    if (change > -5) return 'bearish';
    return 'strong_bearish';
  }

  /**
   * 計算波動率
   * @param {Array} prices - 價格陣列
   * @returns {string} 波動率等級
   */
  calculateVolatility(prices) {
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    
    const variance = returns.reduce((a, b) => a + Math.pow(b, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance) * 100;
    
    if (volatility > 10) return 'high';
    if (volatility > 5) return 'medium';
    return 'low';
  }

  /**
   * 獲取情緒等級
   * @param {number} score - 情緒分數
   * @returns {string} 情緒等級
   */
  getSentimentLevel(score) {
    if (score > 60) return '極度樂觀';
    if (score > 30) return '樂觀';
    if (score > 10) return '略微樂觀';
    if (score > -10) return '中性';
    if (score > -30) return '略微悲觀';
    if (score > -60) return '悲觀';
    return '極度悲觀';
  }

  /**
   * 獲取情緒表情符號
   * @param {number} score - 情緒分數
   * @returns {string} 表情符號
   */
  getSentimentEmoji(score) {
    if (score > 60) return '🚀';
    if (score > 30) return '😊';
    if (score > 10) return '🙂';
    if (score > -10) return '😐';
    if (score > -30) return '😕';
    if (score > -60) return '😰';
    return '😱';
  }

  /**
   * 獲取情緒描述
   * @param {number} score - 情緒分數
   * @returns {string} 情緒描述
   */
  getSentimentDescription(score) {
    if (score > 60) return '市場情緒極度樂觀，投資者信心滿滿';
    if (score > 30) return '市場情緒樂觀，多數投資者看好';
    if (score > 10) return '市場情緒略微樂觀，謹慎看好';
    if (score > -10) return '市場情緒中性，投資者觀望';
    if (score > -30) return '市場情緒略微悲觀，投資者謹慎';
    if (score > -60) return '市場情緒悲觀，投資者擔憂';
    return '市場情緒極度悲觀，投資者恐慌';
  }

  /**
   * 格式化情緒分析
   * @param {Object} analysis - 情緒分析結果
   * @returns {string} 格式化訊息
   */
  formatSentimentAnalysis(analysis) {
    const { coin, sentiment, priceSentiment, socialSentiment, fearGreedIndex, confidence } = analysis;

    let message = `🧠 ${coin} 市場情緒分析\n\n`;
    
    // 整體情緒
    message += `🎯 整體情緒: ${sentiment.emoji} ${sentiment.level}\n`;
    message += `📊 情緒分數: ${sentiment.score.toFixed(1)}/100\n`;
    message += `💭 描述: ${sentiment.description}\n`;
    message += `🎯 信心度: ${confidence}%\n\n`;

    // 價格情緒
    message += `💰 價格情緒:\n`;
    message += `   趨勢: ${this.getTrendEmoji(priceSentiment.trend)} ${this.getTrendText(priceSentiment.trend)}\n`;
    message += `   分數: ${priceSentiment.score.toFixed(1)}/100\n`;
    message += `   交易量: ${priceSentiment.volume === 'high' ? '📈 高' : priceSentiment.volume === 'low' ? '📉 低' : '📊 正常'}\n`;
    message += `   波動率: ${priceSentiment.volatility === 'high' ? '🔥 高' : priceSentiment.volatility === 'medium' ? '⚡ 中' : '💨 低'}\n\n`;

    // 社群情緒
    message += `👥 社群情緒:\n`;
    message += `   趨勢: ${socialSentiment.trend === 'positive' ? '😊 正面' : socialSentiment.trend === 'negative' ? '😞 負面' : '😐 中性'}\n`;
    message += `   分數: ${socialSentiment.score.toFixed(1)}/100\n`;
    message += `   提及次數: ${socialSentiment.mentions.toLocaleString()}\n`;
    message += `   參與度: ${socialSentiment.engagement.toFixed(1)}%\n\n`;

    // 恐懼貪婪指數
    message += `😨😊 恐懼貪婪指數:\n`;
    message += `   指數: ${fearGreedIndex.value}/100\n`;
    message += `   分類: ${fearGreedIndex.classification}\n`;
    message += `   分數: ${fearGreedIndex.score.toFixed(1)}/100\n\n`;

    message += `⏰ 更新時間: ${analysis.lastUpdated}`;

    return message;
  }

  /**
   * 獲取趨勢表情符號
   * @param {string} trend - 趨勢
   * @returns {string} 表情符號
   */
  getTrendEmoji(trend) {
    const emojis = {
      'strong_bullish': '🚀',
      'bullish': '📈',
      'neutral': '➡️',
      'bearish': '📉',
      'strong_bearish': '💥'
    };
    return emojis[trend] || '➡️';
  }

  /**
   * 獲取趨勢文字
   * @param {string} trend - 趨勢
   * @returns {string} 趨勢文字
   */
  getTrendText(trend) {
    const texts = {
      'strong_bullish': '強勢看漲',
      'bullish': '看漲',
      'neutral': '中性',
      'bearish': '看跌',
      'strong_bearish': '強勢看跌'
    };
    return texts[trend] || '中性';
  }

  /**
   * 備用情緒分析
   * @param {string} coin - 加密貨幣代號
   * @returns {Object} 備用數據
   */
  getFallbackSentiment(coin) {
    return {
      coin: coin.toUpperCase(),
      sentiment: {
        score: 0,
        level: '中性',
        emoji: '😐',
        description: '無法獲取情緒數據'
      },
      priceSentiment: { score: 0, trend: 'neutral', volume: 'normal', volatility: 'medium' },
      socialSentiment: { score: 0, mentions: 0, engagement: 0, influence: 0, trend: 'neutral' },
      fearGreedIndex: { value: 50, classification: 'Neutral', score: 0 },
      confidence: 0,
      lastUpdated: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
    };
  }
}

module.exports = new SentimentService();
