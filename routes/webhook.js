const express = require('express');
const line = require('@line/bot-sdk');
const config = require('../config');
const newsService = require('../services/newsService');
const priceService = require('../services/priceService');
const marketService = require('../services/marketService');
const signalService = require('../services/signalService');
const infoService = require('../services/infoService');

const router = express.Router();

// LINE Bot 配置
const lineConfig = {
  channelAccessToken: config.line.channelAccessToken,
  channelSecret: config.line.channelSecret
};

const client = new line.Client(lineConfig);

// 簡單的用戶列表管理（用於新聞推播）
const activeUsers = new Set();


/**
 * 處理 LINE Webhook
 */
router.post('/', (req, res) => {
  console.log('收到 LINE Webhook 請求');
  
  try {
    // 手動驗證簽名
    const signature = req.get('X-Line-Signature');
    if (!signature) {
      console.log('缺少簽名，可能是測試請求');
      return res.status(200).json({ status: 'ok' });
    }

    // 驗證簽名
    const crypto = require('crypto');
    const body = JSON.stringify(req.body);
    const hash = crypto
      .createHmac('SHA256', lineConfig.channelSecret)
      .update(body)
      .digest('base64');

    if (hash !== signature) {
      console.log('簽名驗證失敗');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('簽名驗證成功');
    
    // 確保回應狀態碼 200
    res.status(200).json({ status: 'ok' });
    
    // 異步處理事件
    if (req.body && req.body.events) {
      Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => {
          console.log('事件處理完成:', result.length, '個事件');
        })
        .catch((err) => {
          console.error('Webhook 處理錯誤:', err);
        });
    }
  } catch (error) {
    console.error('Webhook 處理異常:', error);
    res.status(200).json({ status: 'ok' });
  }
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
  
  // 記錄活躍用戶（用於新聞推播）
  if (userId) {
    activeUsers.add(userId);
  }

       try {
         // 處理不同類型的訊息
         if (messageText === '/help') {
      return await handleHelpCommand(event);
         } else if (messageText === '/market') {
           return await handleMarketCommand(event);
         } else if (messageText === '/trending') {
           return await handleTrendingCommand(event);
         } else if (messageText === '/news') {
           return await handleNewsCommand(event);
         } else if (messageText.startsWith('/signal ')) {
           return await handleSignalCommand(event, messageText);
         } else if (messageText === '/signal') {
           return await handleSignalHelpCommand(event);
         } else if (messageText === '/token') {
           return await handleTokenHelpCommand(event);
         } else if (messageText.startsWith('/') && isValidCoinSymbol(messageText.substring(1))) {
           return await handleCoinQueryHelpCommand(event, messageText.substring(1));
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
 * 處理幫助指令
 * @param {Object} event - LINE 事件
 */
async function handleHelpCommand(event) {
     const helpText = `🤖 Crypto News Bot 使用說明

     📊 查詢價格：
     直接輸入幣種代號 (${config.supportedCoins.slice(0, 5).join(', ')}...)

     📈 市場功能：
     /market - 全球市場總覽 (包含恐懼貪婪指數)
     /trending - 趨勢幣種
     /news - 今日熱門新聞
     /signal [幣種] - 技術分析信號

     ℹ️ 其他指令：
     /help - 顯示此說明

     支援的加密貨幣 (市值前30大)：
     ${config.supportedCoins.join(', ')}`;

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: helpText
  });
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
    
    // 獲取詳細資訊
    const coinInfo = await infoService.getCoinInfo(coin);
    
    // 格式化完整資訊卡
    const infoText = infoService.formatCoinInfoCard(priceData, coinInfo);
    
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: infoText
    });
  } catch (error) {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: `無法獲取 ${coin.toUpperCase()} 的資訊，請稍後再試。`
    });
  }
}

/**
 * 處理技術分析幫助指令
 * @param {Object} event - LINE 事件
 */
async function handleSignalHelpCommand(event) {
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: `📈 技術分析功能說明

請輸入 /signal [幣種] 查詢幣種簡易技術分析

範例：
/signal btc - 查詢 BTC 技術分析
/signal eth - 查詢 ETH 技術分析
/signal sol - 查詢 SOL 技術分析

支援的幣種：${config.supportedCoins.join(', ')}`
  });
}

/**
 * 處理幣種查詢幫助指令
 * @param {Object} event - LINE 事件
 */
async function handleTokenHelpCommand(event) {
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: `💰 幣種查詢功能說明

請直接輸入 [幣種] 查詢幣種相關資訊

範例：
btc - 查詢 BTC 完整資訊卡
eth - 查詢 ETH 完整資訊卡
sol - 查詢 SOL 完整資訊卡

支援的幣種：${config.supportedCoins.join(', ')}`
  });
}

/**
 * 處理幣種查詢幫助指令 (舊版本，保留向後兼容)
 * @param {Object} event - LINE 事件
 * @param {string} coin - 幣種代號
 */
async function handleCoinQueryHelpCommand(event, coin) {
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: `💰 幣種查詢功能說明

請直接輸入 [幣種] 查詢幣種相關資訊

範例：
btc - 查詢 BTC 完整資訊卡
eth - 查詢 ETH 完整資訊卡
sol - 查詢 SOL 完整資訊卡

支援的幣種：${config.supportedCoins.join(', ')}`
  });
}

/**
 * 處理預設訊息
 * @param {Object} event - LINE 事件
 */
async function handleDefaultMessage(event) {
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: `歡迎使用 Crypto News Bot！🤖\n\n請輸入幣種代號查詢價格，或輸入 /help 查看完整指令說明。\n\n支援的幣種：${config.supportedCoins.join(', ')}`
  });
}

/**
 * 檢查是否為有效的加密貨幣代號
 * @param {string} coin - 加密貨幣代號
 * @returns {boolean} 是否有效
 */
function isValidCoinSymbol(coin) {
  return config.supportedCoins.includes(coin.toLowerCase());
}

/**
 * 格式化價格顯示
 * @param {number} price - 價格
 * @returns {string} 格式化後的價格字串
 */
function formatPrice(price) {
  if (!price || price === 0) return 'N/A';
  
  // 如果價格小於1，顯示到小數點後8位
  if (price < 1) {
    return price.toFixed(8);
  }
  
  // 如果價格大於等於1，使用原本的格式
  return price.toLocaleString();
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
${changeEmoji} $${formatPrice(priceData.price.usd)} USD
💱 NT$${formatPrice(priceData.price.twd)} TWD
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
 * 處理市場總覽指令
 * @param {Object} event - LINE 事件
 */
async function handleMarketCommand(event) {
  try {
    const marketData = await marketService.getMarketOverview();
    
    // 嘗試獲取恐懼貪婪指數
    let fearGreedData = null;
    try {
      fearGreedData = await marketService.getFearGreedIndex();
      console.log('恐懼貪婪指數數據:', fearGreedData);
    } catch (error) {
      console.log('恐懼貪婪指數獲取失敗，將不顯示該資訊:', error.message);
    }
    
    const marketText = marketService.formatMarketOverview(marketData, fearGreedData);
    
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: marketText
    });
  } catch (error) {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '無法獲取市場數據，請稍後再試。'
    });
  }
}

/**
 * 處理趨勢幣種指令
 * @param {Object} event - LINE 事件
 */
async function handleTrendingCommand(event) {
  try {
    const trendingCoins = await marketService.getTrendingCoins();
    const trendingText = marketService.formatTrendingCoins(trendingCoins);
    
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: trendingText
    });
  } catch (error) {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '無法獲取趨勢數據，請稍後再試。'
    });
  }
}

/**
 * 處理恐懼貪婪指數指令
 * @param {Object} event - LINE 事件
 */
async function handleFearGreedCommand(event) {
  try {
    const fearGreedData = await marketService.getFearGreedIndex();
    const fearGreedText = marketService.formatFearGreedIndex(fearGreedData);
    
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: fearGreedText
    });
  } catch (error) {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '無法獲取恐懼貪婪指數，請稍後再試。'
    });
  }
}

/**
 * 處理新聞指令
 * @param {Object} event - LINE 事件
 */
async function handleNewsCommand(event) {
  try {
    const news = await newsService.getTopCryptoNews(5);
    const newsText = newsService.formatNewsMessage(news);
    
    const message = `📰 今日熱門加密貨幣新聞\n\n${newsText}`;
    
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: message
    });
  } catch (error) {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '無法獲取新聞，請稍後再試。'
    });
  }
}

/**
 * 處理技術分析信號指令
 * @param {Object} event - LINE 事件
 * @param {string} messageText - 訊息文字
 */
async function handleSignalCommand(event, messageText) {
  try {
    const coin = messageText.replace('/signal ', '').trim().toLowerCase();
    
    if (!coin) {
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: '請輸入幣種代號，例如：/signal btc'
      });
    }

    if (!isValidCoinSymbol(coin)) {
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: `不支援的加密貨幣: ${coin}\n支援的幣種: ${config.supportedCoins.join(', ')}`
      });
    }

    // 生成技術分析信號
    const signalResult = await signalService.generateTechnicalSignal(coin);
    const signalText = signalService.formatTechnicalSignal(signalResult);
    
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: signalText
    });
  } catch (error) {
    console.error('技術分析信號處理失敗:', error);
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '無法生成技術分析信號，請稍後再試。'
    });
  }
}



/**
 * 推播每日新聞摘要給所有活躍用戶
 * @param {Array} news - 新聞陣列
 */
async function broadcastDailyNews(news) {
  try {
    if (!news || news.length === 0) {
      console.log('沒有新聞可推播');
      return;
    }

    if (activeUsers.size === 0) {
      console.log('沒有活躍用戶，跳過新聞推播');
      return;
    }

    // 格式化新聞訊息
    const newsText = formatNewsMessage(news);
    const message = `🌅 早安！今日加密貨幣新聞摘要\n\n${newsText}\n\n💡 使用 /news 可隨時查看最新新聞`;

    console.log(`開始推播新聞給 ${activeUsers.size} 個活躍用戶...`);

    // 推播給所有活躍用戶
    let successCount = 0;
    let failCount = 0;

    for (const userId of activeUsers) {
      try {
        await client.pushMessage(userId, {
          type: 'text',
          text: message
        });
        successCount++;
        console.log(`✅ 成功推播給用戶: ${userId}`);
      } catch (error) {
        failCount++;
        console.error(`❌ 推播給用戶 ${userId} 失敗:`, error.message);
        
        // 如果用戶封鎖了 Bot 或帳號不存在，從列表中移除
        if (error.statusCode === 403 || error.statusCode === 400) {
          activeUsers.delete(userId);
          console.log(`🗑️ 已移除無效用戶: ${userId}`);
        }
      }
    }

    console.log(`📊 新聞推播完成: 成功 ${successCount} 個，失敗 ${failCount} 個`);
  } catch (error) {
    console.error('推播每日新聞失敗:', error);
  }
}

/**
 * 獲取活躍用戶統計
 * @returns {Object} 用戶統計資訊
 */
function getActiveUsersStats() {
  return {
    totalUsers: activeUsers.size,
    users: Array.from(activeUsers)
  };
}

// 匯出 router 和函數供排程器使用
module.exports = router;
module.exports.broadcastDailyNews = broadcastDailyNews;
module.exports.getActiveUsersStats = getActiveUsersStats;
