const axios = require('axios');

class KeepAliveService {
  constructor() {
    this.intervalId = null;
    this.intervalMinutes = 10; // 每10分鐘ping一次
    this.keepAliveUrl = process.env.KEEPALIVE_URL;
    this.isRunning = false;
    this.nextPingTime = 'N/A';
  }

  start() {
    if (this.isRunning) {
      console.log('Keep-Alive 服務已在運行中');
      return;
    }

    if (!this.keepAliveUrl) {
      console.warn('⚠️ KEEPALIVE_URL 未設定，Keep-Alive 服務無法啟動。');
      return;
    }

    console.log(`🔄 啟動 Keep-Alive 服務，每 ${this.intervalMinutes} 分鐘 ping 一次`);
    console.log(`📍 Keep-Alive URL: ${this.keepAliveUrl}`);

    this.isRunning = true;
    this.scheduleNextPing();
    this.ping(); // 立即執行第一次ping
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    this.nextPingTime = 'N/A';
    console.log('Keep-Alive 服務已停止');
  }

  scheduleNextPing() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.intervalId = setInterval(() => this.ping(), this.intervalMinutes * 60 * 1000);
    this.updateNextPingTime();
  }

  updateNextPingTime() {
    const now = new Date();
    const nextPing = new Date(now.getTime() + this.intervalMinutes * 60 * 1000);
    this.nextPingTime = nextPing.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
  }

  async ping() {
    try {
      const response = await axios.get(this.keepAliveUrl, { timeout: 5000 }); // 5秒超時
      if (response.status === 200) {
        console.log(`✅ Keep-Alive ping 成功: ${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}`);
      } else {
        console.warn(`⚠️ Keep-Alive ping 收到非 200 狀態碼: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Keep-Alive ping 失敗: ${error.message}`);
    } finally {
      this.updateNextPingTime();
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      keepAliveUrl: this.keepAliveUrl,
      intervalMinutes: this.intervalMinutes,
      nextPing: this.nextPingTime
    };
  }
}

module.exports = new KeepAliveService();
