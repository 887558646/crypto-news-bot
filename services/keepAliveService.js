const axios = require('axios');

class KeepAliveService {
  constructor() {
    this.isRunning = false;
    this.interval = null;
    this.keepAliveUrl = process.env.KEEPALIVE_URL || 'https://your-app.onrender.com/keepalive';
    this.intervalMinutes = 10; // 每10分鐘ping一次
  }

  /**
   * 啟動 Keep-Alive 服務
   */
  start() {
    if (this.isRunning) {
      console.log('Keep-Alive 服務已在運行中');
      return;
    }

    console.log(`🔄 啟動 Keep-Alive 服務，每 ${this.intervalMinutes} 分鐘 ping 一次`);
    console.log(`📍 Keep-Alive URL: ${this.keepAliveUrl}`);

    this.isRunning = true;
    
    // 立即執行一次
    this.ping();
    
    // 設置定時器
    this.interval = setInterval(() => {
      this.ping();
    }, this.intervalMinutes * 60 * 1000);
  }

  /**
   * 停止 Keep-Alive 服務
   */
  stop() {
    if (!this.isRunning) {
      console.log('Keep-Alive 服務未在運行');
      return;
    }

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    this.isRunning = false;
    console.log('🛑 Keep-Alive 服務已停止');
  }

  /**
   * 發送 ping 請求
   */
  async ping() {
    try {
      const response = await axios.get(this.keepAliveUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'KeepAlive-Service/1.0'
        }
      });

      if (response.status === 200) {
        console.log(`✅ Keep-Alive ping 成功: ${new Date().toLocaleString()}`);
      } else {
        console.log(`⚠️ Keep-Alive ping 異常狀態: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Keep-Alive ping 失敗:`, error.message);
      
      // 如果是網絡錯誤，嘗試重試
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        console.log('🔄 網絡錯誤，將在下次定時器觸發時重試');
      }
    }
  }

  /**
   * 獲取服務狀態
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      keepAliveUrl: this.keepAliveUrl,
      intervalMinutes: this.intervalMinutes,
      nextPing: this.interval ? new Date(Date.now() + this.intervalMinutes * 60 * 1000).toLocaleString() : 'N/A'
    };
  }
}

module.exports = new KeepAliveService();
