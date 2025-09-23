const { SMA, Stochastic, RSI } = require('technicalindicators');
const priceService = require('./priceService');

class SignalService {
  constructor() {
    this.priceService = priceService;
  }

  /**
   * 生成技術分析信號
   * @param {string} coin - 加密貨幣代號
   * @returns {Promise<Object>} 技術分析結果
   */
  async generateTechnicalSignal(coin) {
    try {
      console.log(`🔍 開始分析 ${coin.toUpperCase()} 技術指標...`);

      // 獲取 OHLCV 數據
      const ohlcvData = await this.priceService.getOHLCVData(coin, 30);
      
      if (ohlcvData.length === 0) {
        throw new Error('無法獲取價格數據');
      }

      // 準備技術指標計算所需的數據
      const closes = ohlcvData.map(d => d.close);
      const highs = ohlcvData.map(d => d.high);
      const lows = ohlcvData.map(d => d.low);

      // 計算技術指標
      const maSignal = this.calculateMASignal(closes);
      const kdSignal = this.calculateKDSignal(highs, lows, closes);
      const rsiSignal = this.calculateRSISignal(closes);

      // 生成綜合判斷
      const overall = this.generateOverallSignal(maSignal, kdSignal, rsiSignal);

      const result = {
        coin: coin.toUpperCase(),
        maSignal: maSignal,
        kdSignal: kdSignal,
        rsiSignal: rsiSignal,
        overall: overall,
        currentPrice: closes[closes.length - 1],
        lastUpdated: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
      };

      console.log(`✅ ${coin.toUpperCase()} 技術分析完成`);
      return result;

    } catch (error) {
      console.error('技術分析失敗:', error.message);
      throw new Error(`生成 ${coin.toUpperCase()} 技術分析信號失敗: ${error.message}`);
    }
  }

  /**
   * 計算 MA 信號 (5MA 和 20MA)
   * @param {Array} closes - 收盤價陣列
   * @returns {Object} MA 信號
   */
  calculateMASignal(closes) {
    try {
      // 計算 5MA 和 20MA
      const ma5 = SMA.calculate({ period: 5, values: closes });
      const ma20 = SMA.calculate({ period: 20, values: closes });

      if (ma5.length === 0 || ma20.length === 0) {
        return { signal: "數據不足", ma5: 0, ma20: 0 };
      }

      const currentMa5 = ma5[ma5.length - 1];
      const currentMa20 = ma20[ma20.length - 1];

      let signal;
      if (currentMa5 > currentMa20) {
        signal = "多頭 → 買進";
      } else {
        signal = "空頭 → 賣出";
      }

      return {
        signal: signal,
        ma5: currentMa5,
        ma20: currentMa20
      };

    } catch (error) {
      console.error('MA 計算失敗:', error.message);
      return { signal: "計算失敗", ma5: 0, ma20: 0 };
    }
  }

  /**
   * 計算 KD 信號
   * @param {Array} highs - 最高價陣列
   * @param {Array} lows - 最低價陣列
   * @param {Array} closes - 收盤價陣列
   * @returns {Object} KD 信號
   */
  calculateKDSignal(highs, lows, closes) {
    try {
      // 計算 KD(14,3)
      const kd = Stochastic.calculate({
        high: highs,
        low: lows,
        close: closes,
        period: 14,
        signalPeriod: 3
      });

      if (kd.length === 0) {
        return { signal: "數據不足", k: 0, d: 0 };
      }

      const currentK = kd[kd.length - 1].k;
      const currentD = kd[kd.length - 1].d;

      let signal;
      if (currentK < 20) {
        signal = "超賣 → 買進";
      } else if (currentK > 80) {
        signal = "超買 → 賣出";
      } else {
        signal = "觀望";
      }

      return {
        signal: signal,
        k: currentK,
        d: currentD
      };

    } catch (error) {
      console.error('KD 計算失敗:', error.message);
      return { signal: "計算失敗", k: 0, d: 0 };
    }
  }

  /**
   * 計算 RSI 信號
   * @param {Array} closes - 收盤價陣列
   * @returns {Object} RSI 信號
   */
  calculateRSISignal(closes) {
    try {
      // 計算 RSI(14)
      const rsi = RSI.calculate({ period: 14, values: closes });

      if (rsi.length === 0) {
        return { signal: "數據不足", rsi: 0 };
      }

      const currentRsi = rsi[rsi.length - 1];

      let signal;
      if (currentRsi < 30) {
        signal = "超賣 → 買進";
      } else if (currentRsi > 70) {
        signal = "超買 → 賣出";
      } else {
        signal = "觀望";
      }

      return {
        signal: signal,
        rsi: currentRsi
      };

    } catch (error) {
      console.error('RSI 計算失敗:', error.message);
      return { signal: "計算失敗", rsi: 0 };
    }
  }

  /**
   * 生成綜合判斷
   * @param {Object} maSignal - MA 信號
   * @param {Object} kdSignal - KD 信號
   * @param {Object} rsiSignal - RSI 信號
   * @returns {Object} 綜合判斷
   */
  generateOverallSignal(maSignal, kdSignal, rsiSignal) {
    let bullishCount = 0;
    let bearishCount = 0;

    // 統計看多和看空信號
    if (maSignal.signal.includes("買進")) bullishCount++;
    else if (maSignal.signal.includes("賣出")) bearishCount++;

    if (kdSignal.signal.includes("買進")) bullishCount++;
    else if (kdSignal.signal.includes("賣出")) bearishCount++;

    if (rsiSignal.signal.includes("買進")) bullishCount++;
    else if (rsiSignal.signal.includes("賣出")) bearishCount++;

    // 生成綜合判斷
    let overall;
    if (bullishCount > bearishCount) {
      if (bullishCount >= 2) {
        overall = "偏多 → 建議觀察進場";
      } else {
        overall = "略微偏多 → 謹慎觀察";
      }
    } else if (bearishCount > bullishCount) {
      if (bearishCount >= 2) {
        overall = "偏空 → 建議觀望或減倉";
      } else {
        overall = "略微偏空 → 謹慎觀察";
      }
    } else {
      overall = "中性 → 建議觀望";
    }

    return {
      signal: overall,
      bullishCount: bullishCount,
      bearishCount: bearishCount,
      neutralCount: 3 - bullishCount - bearishCount
    };
  }

  /**
   * 格式化技術分析結果
   * @param {Object} result - 技術分析結果
   * @returns {string} 格式化訊息
   */
  formatTechnicalSignal(result) {
    const { coin, maSignal, kdSignal, rsiSignal, overall, currentPrice, lastUpdated } = result;

    let message = `📊 ${coin} 技術指標 (日線)\n\n`;
    
    // MA 信號
    message += `📈 MA(5/20)：${maSignal.signal}\n`;
    if (maSignal.ma5 > 0) {
      message += `   5MA: $${maSignal.ma5.toFixed(2)}\n`;
      message += `   20MA: $${maSignal.ma20.toFixed(2)}\n\n`;
    }

    // KD 信號
    message += `📊 KD(14,3)：${kdSignal.signal}\n`;
    if (kdSignal.k > 0) {
      message += `   K: ${kdSignal.k.toFixed(1)}\n`;
      message += `   D: ${kdSignal.d.toFixed(1)}\n\n`;
    }

    // RSI 信號
    message += `📉 RSI(14)：${rsiSignal.signal}\n`;
    if (rsiSignal.rsi > 0) {
      message += `   RSI: ${rsiSignal.rsi.toFixed(1)}\n\n`;
    }

    // 當前價格
    message += `💰 當前價格: $${currentPrice.toLocaleString()}\n\n`;

    // 綜合判斷
    message += `📌 綜合判斷：${overall.signal}\n`;
    message += `   看多: ${overall.bullishCount} | 看空: ${overall.bearishCount} | 中性: ${overall.neutralCount}\n\n`;

    message += `⏰ 更新時間: ${lastUpdated}`;

    return message;
  }

  /**
   * 備用信號（當計算失敗時使用）
   * @param {string} coin - 加密貨幣代號
   * @returns {Object} 備用信號
   */
  getFallbackSignal(coin) {
    return {
      coin: coin.toUpperCase(),
      maSignal: { signal: "數據不足", ma5: 0, ma20: 0 },
      kdSignal: { signal: "數據不足", k: 0, d: 0 },
      rsiSignal: { signal: "數據不足", rsi: 0 },
      overall: { signal: "無法分析 → 請稍後再試", bullishCount: 0, bearishCount: 0, neutralCount: 3 },
      currentPrice: 0,
      lastUpdated: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
    };
  }
}

module.exports = new SignalService();