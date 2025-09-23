const express = require('express');
const line = require('@line/bot-sdk');
const config = require('../config');
const newsService = require('../services/newsService');
const priceService = require('../services/priceService');
const chartService = require('../services/chartService');

const router = express.Router();

// LINE Bot 配置
const lineConfig = {
  channelAccessToken: config.line.channelAccessToken,
  channelSecret: config.line.channelSecret
};

const client = new line.Client(lineConfig);

// 用戶訂閱狀態管理（實際應用中應使用資料庫）
const userSubscriptions = new Map();

/**
 * 處理 LINE Webhook
 */
router.post('/', line.middleware(lineConfig), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error('Webhook 處理錯誤:', err);
      res.status(500).end();
    });
});

/**
 * 處理單一事件
 * @param {Object} event - LINE 事件
 */
async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const userId = event.source.userId;
  const messageText = event.message.text.toLowerCase().trim();

  try {
    // 處理不同類型的訊息
    if (messageText.startsWith('/chart ')) {
      return await handleChartCommand(event, messageText);
    } else if (messageText.startsWith('/subscribe ')) {
      return await handleSubscribeCommand(event, messageText, userId);
    } else if (messageText === '/unsubscribe') {
      return await handleUnsubscribeCommand(event, userId);
    } else if (messageText === '/help') {
      return await handleHelpCommand(event);
    } else if (messageText === '/status') {
      return await handleStatusCommand(event, userId);
    } else if (isValidCoinSymbol(messageText)) {
      return await handleCoinQuery(event, messageText);
    } else {
      return await handleDefaultMessage(event);
    }
  } catch (error) {
    console.error('處理訊息錯誤:', error);
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '抱歉，處理您的請求時發生錯誤，請稍後再試。'
    });
  }
}

/**
 * 處理圖表指令
 * @param {Object} event - LINE 事件
 * @param {string} messageText - 訊息文字
 */
async function handleChartCommand(event, messageText) {
  const coin = messageText.replace('/chart ', '').trim();
  
  if (!isValidCoinSymbol(coin)) {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: `不支援的加密貨幣: ${coin}\n支援的幣種: ${Object.keys(config.supportedCoins).join(', ')}`
    });
  }

  try {
    const chartUrl = await chartService.generatePriceChart(coin, 7);
    
    return client.replyMessage(event.replyToken, {
      type: 'image',
      originalContentUrl: chartUrl,
      previewImageUrl: chartUrl
    });
  } catch (error) {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: `無法生成 ${coin.toUpperCase()} 的價格圖表，請稍後再試。`
    });
  }
}

/**
 * 處理訂閱指令
 * @param {Object} event - LINE 事件
 * @param {string} messageText - 訊息文字
 * @param {string} userId - 用戶 ID
 */
async function handleSubscribeCommand(event, messageText, userId) {
  const coin = messageText.replace('/subscribe ', '').trim();
  
  if (!isValidCoinSymbol(coin)) {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: `不支援的加密貨幣: ${coin}\n支援的幣種: ${Object.keys(config.supportedCoins).join(', ')}`
    });
  }

  // 設定用戶訂閱
  userSubscriptions.set(userId, coin.toLowerCase());
  
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: `✅ 已成功訂閱 ${coin.toUpperCase()} 新聞推播！\n每天早上 9:00 會收到最新消息。\n\n使用 /unsubscribe 可取消訂閱。`
  });
}

/**
 * 處理取消訂閱指令
 * @param {Object} event - LINE 事件
 * @param {string} userId - 用戶 ID
 */
async function handleUnsubscribeCommand(event, userId) {
  if (userSubscriptions.has(userId)) {
    const coin = userSubscriptions.get(userId);
    userSubscriptions.delete(userId);
    
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: `✅ 已取消訂閱 ${coin.toUpperCase()} 新聞推播。\n\n使用 /subscribe [幣種] 可重新訂閱。`
    });
  } else {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '您目前沒有訂閱任何新聞推播。\n\n使用 /subscribe [幣種] 可訂閱特定幣種的新聞。'
    });
  }
}

/**
 * 處理幫助指令
 * @param {Object} event - LINE 事件
 */
async function handleHelpCommand(event) {
  const helpText = `🤖 Crypto News Bot 使用說明

📊 查詢價格：
直接輸入幣種代號 (btc, eth, sol, bnb, sui)

📈 查看圖表：
/chart [幣種] - 查看過去 7 天價格走勢

📰 訂閱功能：
/subscribe [幣種] - 訂閱特定幣種新聞
/unsubscribe - 取消訂閱

ℹ️ 其他指令：
/help - 顯示此說明
/status - 查看訂閱狀態

支援的加密貨幣：
${Object.keys(config.supportedCoins).map(coin => `• ${coin.toUpperCase()}`).join('\n')}`;

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: helpText
  });
}

/**
 * 處理狀態查詢指令
 * @param {Object} event - LINE 事件
 * @param {string} userId - 用戶 ID
 */
async function handleStatusCommand(event, userId) {
  if (userSubscriptions.has(userId)) {
    const coin = userSubscriptions.get(userId);
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: `📊 您的訂閱狀態：\n✅ 已訂閱 ${coin.toUpperCase()} 新聞推播\n\n每天早上 9:00 會收到最新消息。`
    });
  } else {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '📊 您的訂閱狀態：\n❌ 目前沒有訂閱任何新聞推播\n\n使用 /subscribe [幣種] 可訂閱特定幣種的新聞。'
    });
  }
}

/**
 * 處理加密貨幣查詢
 * @param {Object} event - LINE 事件
 * @param {string} coin - 加密貨幣代號
 */
async function handleCoinQuery(event, coin) {
  try {
    // 獲取價格資訊
    const priceData = await priceService.getCoinPrice(coin);
    
    // 獲取最新新聞
    const news = await newsService.getCryptoNews(coin, 2);
    
    // 格式化價格資訊
    const priceText = formatPriceMessage(priceData);
    
    // 格式化新聞資訊
    const newsText = formatNewsMessage(news);
    
    const responseText = `${priceText}\n\n${newsText}`;
    
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: responseText
    });
  } catch (error) {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: `無法獲取 ${coin.toUpperCase()} 的資訊，請稍後再試。`
    });
  }
}

/**
 * 處理預設訊息
 * @param {Object} event - LINE 事件
 */
async function handleDefaultMessage(event) {
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: `歡迎使用 Crypto News Bot！🤖\n\n請輸入幣種代號查詢價格，或輸入 /help 查看完整指令說明。\n\n支援的幣種：${Object.keys(config.supportedCoins).join(', ')}`
  });
}

/**
 * 檢查是否為有效的加密貨幣代號
 * @param {string} coin - 加密貨幣代號
 * @returns {boolean} 是否有效
 */
function isValidCoinSymbol(coin) {
  return config.supportedCoins.hasOwnProperty(coin.toLowerCase());
}

/**
 * 格式化價格訊息
 * @param {Object} priceData - 價格資料
 * @returns {string} 格式化後的價格訊息
 */
function formatPriceMessage(priceData) {
  const changeEmoji = priceData.change24h >= 0 ? '📈' : '📉';
  const changeColor = priceData.change24h >= 0 ? '🟢' : '🔴';
  
  return `💰 ${priceData.symbol} 即時價格
${changeEmoji} $${priceData.price.usd.toFixed(2)} USD
💱 NT$${priceData.price.twd.toFixed(0)} TWD
${changeColor} 24h 變化: ${priceData.change24h >= 0 ? '+' : ''}${priceData.change24h.toFixed(2)}%
📊 24h 交易量: $${(priceData.volume24h / 1000000).toFixed(1)}M
💎 市值: $${(priceData.marketCap / 1000000000).toFixed(1)}B
⏰ 更新時間: ${priceData.lastUpdated}`;
}

/**
 * 格式化新聞訊息
 * @param {Array} news - 新聞陣列
 * @returns {string} 格式化後的新聞訊息
 */
function formatNewsMessage(news) {
  if (news.length === 0) {
    return '📰 暫無最新新聞';
  }
  
  let newsText = '📰 最新新聞：\n\n';
  
  news.forEach((article, index) => {
    newsText += `${index + 1}. ${article.title}\n`;
    newsText += `   ${article.description}\n`;
    newsText += `   📅 ${article.publishedAt}\n`;
    newsText += `   🔗 ${article.url}\n\n`;
  });
  
  return newsText.trim();
}

/**
 * 推播訊息給所有訂閱用戶
 * @param {string} coin - 加密貨幣代號
 * @param {Array} news - 新聞陣列
 */
async function broadcastNewsToSubscribers(coin, news) {
  const subscribers = Array.from(userSubscriptions.entries())
    .filter(([userId, subscribedCoin]) => subscribedCoin === coin.toLowerCase())
    .map(([userId]) => userId);
  
  if (subscribers.length === 0) {
    return;
  }
  
  const newsText = formatNewsMessage(news);
  const message = `🌅 早安！${coin.toUpperCase()} 新聞摘要\n\n${newsText}`;
  
  for (const userId of subscribers) {
    try {
      await client.pushMessage(userId, {
        type: 'text',
        text: message
      });
    } catch (error) {
      console.error(`推播給用戶 ${userId} 失敗:`, error);
    }
  }
}

/**
 * 推播每日新聞摘要給所有用戶
 * @param {Array} news - 新聞陣列
 */
async function broadcastDailyNews(news) {
  const allUsers = Array.from(userSubscriptions.keys());
  
  if (allUsers.length === 0) {
    return;
  }
  
  const newsText = formatNewsMessage(news);
  const message = `🌅 早安！今日加密貨幣新聞摘要\n\n${newsText}`;
  
  for (const userId of allUsers) {
    try {
      await client.pushMessage(userId, {
        type: 'text',
        text: message
      });
    } catch (error) {
      console.error(`推播給用戶 ${userId} 失敗:`, error);
    }
  }
}

// 匯出 router 和函數供排程器使用
module.exports = router;
module.exports.broadcastNewsToSubscribers = broadcastNewsToSubscribers;
module.exports.broadcastDailyNews = broadcastDailyNews;
module.exports.userSubscriptions = userSubscriptions;
