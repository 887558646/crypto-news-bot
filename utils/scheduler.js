const cron = require('node-cron');
const config = require('../config');
const newsService = require('../services/newsService');
const priceService = require('../services/priceService');

class Scheduler {
  constructor() {
    this.webhookModule = null;
    this.isRunning = false;
  }

  /**
   * 初始化排程器
   * @param {Object} webhookModule - webhook 模組
   */
  init(webhookModule) {
    this.webhookModule = webhookModule;
    this.startScheduler();
  }

  /**
   * 啟動排程器
   */
  startScheduler() {
    if (this.isRunning) {
      console.log('排程器已在運行中');
      return;
    }

    console.log('啟動排程器...');

    // 每天早上 9:00 推播每日新聞摘要 (UTC+8)
    cron.schedule(config.schedule.newsPushTime, async () => {
      console.log('開始執行每日新聞推播...');
      await this.broadcastDailyNews();
    }, {
      timezone: 'Asia/Taipei'
    });

    // 每小時推播特定幣種新聞（如果有訂閱用戶）(UTC+8)
    cron.schedule(config.schedule.specificNewsTime, async () => {
      console.log('檢查特定幣種新聞推播...');
      await this.broadcastSpecificCoinNews();
    }, {
      timezone: 'Asia/Taipei'
    });

    // 每天 18:00 推播市場總結 (UTC+8)
    cron.schedule(config.schedule.marketSummaryTime, async () => {
      console.log('開始執行市場總結推播...');
      await this.broadcastMarketSummary();
    }, {
      timezone: 'Asia/Taipei'
    });

    this.isRunning = true;
    console.log('排程器已啟動');
  }

  /**
   * 停止排程器
   */
  stopScheduler() {
    if (!this.isRunning) {
      console.log('排程器未在運行');
      return;
    }

    cron.destroy();
    this.isRunning = false;
    console.log('排程器已停止');
  }

  /**
   * 推播每日新聞摘要
   */
  async broadcastDailyNews() {
    try {
      console.log('獲取每日新聞摘要...');
      const news = await newsService.getDailyNewsSummary();
      
      if (news && news.length > 0) {
        console.log(`推播 ${news.length} 條新聞給所有用戶`);
        await this.webhookModule.broadcastDailyNews(news);
      } else {
        console.log('沒有獲取到新聞，跳過推播');
      }
    } catch (error) {
      console.error('推播每日新聞失敗:', error);
    }
  }

  /**
   * 推播特定幣種新聞
   */
  async broadcastSpecificCoinNews() {
    try {
      const userSubscriptions = this.webhookModule.userSubscriptions;
      
      if (userSubscriptions.size === 0) {
        console.log('沒有訂閱用戶，跳過特定幣種新聞推播');
        return;
      }

      // 獲取所有訂閱的幣種
      const subscribedCoins = new Set();
      for (const [userId, coin] of userSubscriptions) {
        subscribedCoins.add(coin);
      }

      // 為每個訂閱的幣種推播新聞
      for (const coin of subscribedCoins) {
        try {
          console.log(`獲取 ${coin.toUpperCase()} 新聞...`);
          const news = await newsService.getCryptoNews(coin, 2);
          
          if (news && news.length > 0) {
            console.log(`推播 ${coin.toUpperCase()} 新聞給訂閱用戶`);
            await this.webhookModule.broadcastNewsToSubscribers(coin, news);
          }
        } catch (error) {
          console.error(`推播 ${coin.toUpperCase()} 新聞失敗:`, error);
        }
      }
    } catch (error) {
      console.error('推播特定幣種新聞失敗:', error);
    }
  }

  /**
   * 推播市場總結
   */
  async broadcastMarketSummary() {
    try {
      const userSubscriptions = this.webhookModule.userSubscriptions;
      
      if (userSubscriptions.size === 0) {
        console.log('沒有訂閱用戶，跳過市場總結推播');
        return;
      }

      console.log('獲取市場總結...');
      
      // 獲取主要幣種價格
      const mainCoins = ['btc', 'eth', 'sol'];
      const prices = await priceService.getMultipleCoinPrices(mainCoins);
      
      // 格式化市場總結
      const summaryText = this.formatMarketSummary(prices);
      
      // 推播給所有用戶
      const allUsers = Array.from(userSubscriptions.keys());
      for (const userId of allUsers) {
        try {
          await this.webhookModule.client.pushMessage(userId, {
            type: 'text',
            text: summaryText
          });
        } catch (error) {
          console.error(`推播市場總結給用戶 ${userId} 失敗:`, error);
        }
      }
      
      console.log('市場總結推播完成');
    } catch (error) {
      console.error('推播市場總結失敗:', error);
    }
  }

  /**
   * 格式化市場總結
   * @param {Array} prices - 價格資料陣列
   * @returns {string} 格式化後的市場總結
   */
  formatMarketSummary(prices) {
    let summary = '📊 今日市場總結 (18:00)\n\n';
    
    prices.forEach(price => {
      const changeEmoji = price.change24h >= 0 ? '📈' : '📉';
      const changeColor = price.change24h >= 0 ? '🟢' : '🔴';
      
      summary += `${changeEmoji} ${price.symbol}\n`;
      summary += `   $${price.price.usd.toFixed(2)} (${changeColor}${price.change24h >= 0 ? '+' : ''}${price.change24h.toFixed(2)}%)\n`;
      summary += `   NT$${price.price.twd.toFixed(0)}\n\n`;
    });
    
    summary += '💡 投資有風險，請謹慎評估！';
    
    return summary;
  }

  /**
   * 手動觸發每日新聞推播（用於測試）
   */
  async triggerDailyNews() {
    console.log('手動觸發每日新聞推播...');
    await this.broadcastDailyNews();
  }

  /**
   * 手動觸發特定幣種新聞推播（用於測試）
   */
  async triggerSpecificCoinNews() {
    console.log('手動觸發特定幣種新聞推播...');
    await this.broadcastSpecificCoinNews();
  }

  /**
   * 手動觸發市場總結推播（用於測試）
   */
  async triggerMarketSummary() {
    console.log('手動觸發市場總結推播...');
    await this.broadcastMarketSummary();
  }

  /**
   * 獲取排程器狀態
   * @returns {Object} 排程器狀態
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      scheduledTasks: [
        {
          name: '每日新聞推播',
          schedule: config.schedule.newsPushTime,
          timezone: 'Asia/Taipei (UTC+8)',
          description: '每天早上 9:00 推播加密貨幣新聞摘要'
        },
        {
          name: '特定幣種新聞推播',
          schedule: '0 * * * *',
          timezone: 'Asia/Taipei (UTC+8)',
          description: '每小時推播訂閱用戶的特定幣種新聞'
        },
        {
          name: '市場總結推播',
          schedule: '0 18 * * *',
          timezone: 'Asia/Taipei (UTC+8)',
          description: '每天 18:00 推播市場總結'
        }
      ]
    };
  }
}

module.exports = new Scheduler();
