const config = require('../config');

class AlertService {
  constructor() {
    // 用戶價格警報 (實際應用中應使用資料庫)
    this.userAlerts = new Map();
  }

  /**
   * 設定價格警報
   * @param {string} userId - 用戶 ID
   * @param {string} coin - 加密貨幣代號
   * @param {number} targetPrice - 目標價格
   * @param {string} condition - 條件 ('above' 或 'below')
   * @returns {boolean} 是否設定成功
   */
  setPriceAlert(userId, coin, targetPrice, condition) {
    // 移除支援幣種限制，支援所有 CoinGecko 上的加密貨幣
    if (false) {
      return false;
    }

    if (!['above', 'below'].includes(condition)) {
      return false;
    }

    if (targetPrice <= 0) {
      return false;
    }

    const alertId = `${userId}_${coin.toLowerCase()}_${Date.now()}`;
    const alert = {
      id: alertId,
      userId,
      coin: coin.toLowerCase(),
      targetPrice,
      condition,
      createdAt: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
      isActive: true
    };

    // 如果用戶已有該幣種的警報，先移除舊的
    this.removeUserCoinAlert(userId, coin);
    
    this.userAlerts.set(alertId, alert);
    return true;
  }

  /**
   * 移除用戶特定幣種的警報
   * @param {string} userId - 用戶 ID
   * @param {string} coin - 加密貨幣代號
   * @returns {boolean} 是否移除成功
   */
  removeUserCoinAlert(userId, coin) {
    let removed = false;
    for (const [alertId, alert] of this.userAlerts) {
      if (alert.userId === userId && alert.coin === coin.toLowerCase()) {
        this.userAlerts.delete(alertId);
        removed = true;
      }
    }
    return removed;
  }

  /**
   * 移除用戶所有警報
   * @param {string} userId - 用戶 ID
   * @returns {number} 移除的警報數量
   */
  removeAllUserAlerts(userId) {
    let removedCount = 0;
    for (const [alertId, alert] of this.userAlerts) {
      if (alert.userId === userId) {
        this.userAlerts.delete(alertId);
        removedCount++;
      }
    }
    return removedCount;
  }

  /**
   * 獲取用戶的警報列表
   * @param {string} userId - 用戶 ID
   * @returns {Array} 警報列表
   */
  getUserAlerts(userId) {
    const userAlerts = [];
    for (const [alertId, alert] of this.userAlerts) {
      if (alert.userId === userId && alert.isActive) {
        userAlerts.push(alert);
      }
    }
    return userAlerts;
  }

  /**
   * 檢查價格警報
   * @param {string} coin - 加密貨幣代號
   * @param {number} currentPrice - 當前價格
   * @returns {Array} 觸發的警報列表
   */
  checkPriceAlerts(coin, currentPrice) {
    const triggeredAlerts = [];
    
    for (const [alertId, alert] of this.userAlerts) {
      if (alert.coin === coin.toLowerCase() && alert.isActive) {
        let shouldTrigger = false;
        
        if (alert.condition === 'above' && currentPrice >= alert.targetPrice) {
          shouldTrigger = true;
        } else if (alert.condition === 'below' && currentPrice <= alert.targetPrice) {
          shouldTrigger = true;
        }
        
        if (shouldTrigger) {
          triggeredAlerts.push(alert);
          // 觸發後停用警報
          alert.isActive = false;
        }
      }
    }
    
    return triggeredAlerts;
  }

  /**
   * 格式化警報訊息
   * @param {Object} alert - 警報物件
   * @param {number} currentPrice - 當前價格
   * @returns {string} 格式化後的警報訊息
   */
  formatAlertMessage(alert, currentPrice) {
    const conditionText = alert.condition === 'above' ? '上漲至' : '下跌至';
    const emoji = alert.condition === 'above' ? '🚀' : '📉';
    
    return `${emoji} 價格警報觸發！

${alert.coin.toUpperCase()} 已${conditionText} $${alert.targetPrice.toLocaleString()}
當前價格: $${currentPrice.toLocaleString()}

警報設定時間: ${alert.createdAt}

💡 如需重新設定警報，請使用 /alert 指令`;
  }

  /**
   * 格式化用戶警報列表
   * @param {Array} alerts - 警報列表
   * @returns {string} 格式化後的警報列表
   */
  formatUserAlerts(alerts) {
    if (alerts.length === 0) {
      return '📊 您目前沒有設定任何價格警報。\n\n使用 /alert [幣種] [價格] [above/below] 來設定警報';
    }

    let message = '📊 您的價格警報列表：\n\n';
    
    alerts.forEach((alert, index) => {
      const conditionText = alert.condition === 'above' ? '上漲至' : '下跌至';
      const emoji = alert.condition === 'above' ? '🚀' : '📉';
      
      message += `${index + 1}. ${emoji} ${alert.coin.toUpperCase()}\n`;
      message += `   ${conditionText} $${alert.targetPrice.toLocaleString()}\n`;
      message += `   設定時間: ${alert.createdAt}\n\n`;
    });

    message += '💡 使用 /alert remove [幣種] 可移除特定警報\n';
    message += '💡 使用 /alert clear 可清除所有警報';

    return message;
  }

  /**
   * 獲取所有活躍警報
   * @returns {Array} 所有活躍警報
   */
  getAllActiveAlerts() {
    const activeAlerts = [];
    for (const [alertId, alert] of this.userAlerts) {
      if (alert.isActive) {
        activeAlerts.push(alert);
      }
    }
    return activeAlerts;
  }

  /**
   * 獲取需要檢查的幣種列表
   * @returns {Array} 幣種列表
   */
  getCoinsToCheck() {
    const coins = new Set();
    for (const [alertId, alert] of this.userAlerts) {
      if (alert.isActive) {
        coins.add(alert.coin);
      }
    }
    return Array.from(coins);
  }
}

module.exports = new AlertService();
