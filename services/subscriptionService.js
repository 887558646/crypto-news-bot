const fs = require('fs').promises;
const path = require('path');

class SubscriptionService {
  constructor() {
    this.dataFile = path.join(__dirname, '..', 'data', 'subscriptions.json');
    this.subscriptions = new Map();
    this.initializeData();
  }

  /**
   * 初始化數據
   */
  async initializeData() {
    try {
      // 確保 data 目錄存在
      const dataDir = path.dirname(this.dataFile);
      try {
        await fs.access(dataDir);
      } catch {
        await fs.mkdir(dataDir, { recursive: true });
      }

      // 讀取現有數據
      try {
        const data = await fs.readFile(this.dataFile, 'utf8');
        const subscriptionsData = JSON.parse(data);
        
        // 將 JSON 數據轉換回 Map
        this.subscriptions = new Map(Object.entries(subscriptionsData));
        console.log(`✅ 已載入 ${this.subscriptions.size} 個用戶的訂閱狀態`);
      } catch (error) {
        // 如果檔案不存在或讀取失敗，創建空檔案
        console.log('📝 創建新的訂閱狀態檔案');
        await this.saveToFile();
      }
    } catch (error) {
      console.error('初始化訂閱服務失敗:', error.message);
    }
  }

  /**
   * 保存數據到檔案
   */
  async saveToFile() {
    try {
      // 將 Map 轉換為普通物件
      const subscriptionsData = Object.fromEntries(this.subscriptions);
      await fs.writeFile(this.dataFile, JSON.stringify(subscriptionsData, null, 2), 'utf8');
      console.log('💾 訂閱狀態已保存到檔案');
    } catch (error) {
      console.error('保存訂閱狀態失敗:', error.message);
    }
  }

  /**
   * 獲取用戶訂閱的幣種
   * @param {string} userId - 用戶 ID
   * @returns {Array} 訂閱的幣種陣列
   */
  getSubscriptions(userId) {
    return this.subscriptions.get(userId) || [];
  }

  /**
   * 添加用戶訂閱
   * @param {string} userId - 用戶 ID
   * @param {string} coin - 幣種代號
   * @returns {boolean} 是否成功添加
   */
  async addSubscription(userId, coin) {
    try {
      const currentSubscriptions = this.getSubscriptions(userId);
      
      // 檢查是否已經訂閱
      if (currentSubscriptions.includes(coin)) {
        return false; // 已經訂閱
      }

      // 添加新訂閱
      currentSubscriptions.push(coin);
      this.subscriptions.set(userId, currentSubscriptions);
      
      // 保存到檔案
      await this.saveToFile();
      
      console.log(`✅ 用戶 ${userId} 已訂閱 ${coin}`);
      return true;
    } catch (error) {
      console.error('添加訂閱失敗:', error.message);
      return false;
    }
  }

  /**
   * 移除用戶訂閱
   * @param {string} userId - 用戶 ID
   * @param {string} coin - 幣種代號（可選，如果不提供則移除所有訂閱）
   * @returns {boolean} 是否成功移除
   */
  async removeSubscription(userId, coin = null) {
    try {
      if (coin === null) {
        // 移除所有訂閱
        this.subscriptions.delete(userId);
        console.log(`✅ 用戶 ${userId} 已取消所有訂閱`);
      } else {
        // 移除特定幣種訂閱
        const currentSubscriptions = this.getSubscriptions(userId);
        const index = currentSubscriptions.indexOf(coin);
        
        if (index === -1) {
          return false; // 沒有訂閱該幣種
        }

        currentSubscriptions.splice(index, 1);
        
        if (currentSubscriptions.length === 0) {
          this.subscriptions.delete(userId);
        } else {
          this.subscriptions.set(userId, currentSubscriptions);
        }
        
        console.log(`✅ 用戶 ${userId} 已取消訂閱 ${coin}`);
      }

      // 保存到檔案
      await this.saveToFile();
      return true;
    } catch (error) {
      console.error('移除訂閱失敗:', error.message);
      return false;
    }
  }

  /**
   * 獲取所有訂閱用戶
   * @returns {Map} 所有用戶訂閱狀態
   */
  getAllSubscriptions() {
    return new Map(this.subscriptions);
  }

  /**
   * 獲取訂閱特定幣種的所有用戶
   * @param {string} coin - 幣種代號
   * @returns {Array} 用戶 ID 陣列
   */
  getSubscribersForCoin(coin) {
    const subscribers = [];
    
    for (const [userId, subscribedCoins] of this.subscriptions) {
      if (subscribedCoins.includes(coin)) {
        subscribers.push(userId);
      }
    }
    
    return subscribers;
  }

  /**
   * 獲取訂閱統計
   * @returns {Object} 統計資訊
   */
  getStats() {
    const totalUsers = this.subscriptions.size;
    let totalSubscriptions = 0;
    const coinCounts = {};

    for (const [userId, subscribedCoins] of this.subscriptions) {
      totalSubscriptions += subscribedCoins.length;
      
      for (const coin of subscribedCoins) {
        coinCounts[coin] = (coinCounts[coin] || 0) + 1;
      }
    }

    return {
      totalUsers,
      totalSubscriptions,
      coinCounts,
      averageSubscriptionsPerUser: totalUsers > 0 ? (totalSubscriptions / totalUsers).toFixed(2) : 0
    };
  }
}

module.exports = new SubscriptionService();
