# 🤖 Crypto News Bot

一個功能豐富的 LINE Bot，提供加密貨幣新聞和即時價格查詢功能。

## ✨ 功能特色

### 📰 新聞推播
- **每日新聞摘要**：每天早上 9:00 自動推播前 3 條加密貨幣新聞
- **特定幣種訂閱**：支援訂閱特定加密貨幣的新聞推播
- **即時新聞查詢**：輸入幣種代號即可獲取 24 小時內最新相關新聞

### 💰 價格查詢
- **即時價格**：支援市值前30大加密貨幣
- **多幣種支援**：同時顯示 USD 和 TWD 價格
- **24小時變化**：顯示價格變化和交易量資訊

### 🔔 訂閱管理
- **個人化訂閱**：每個用戶可獨立管理訂閱狀態
- **靈活控制**：隨時訂閱或取消訂閱特定幣種
- **狀態查詢**：使用 `/status` 查看當前訂閱狀態

## 🛠 技術棧

- **Node.js** + **Express** - 後端框架
- **LINE Messaging API SDK** - LINE Bot 整合
- **Axios** - HTTP 請求處理
- **node-cron** - 定時任務排程
- **CoinGecko API** - 加密貨幣價格數據
- **NewsAPI** - 新聞數據

## 📂 專案結構

```
crypto-news-bot/
├── index.js              # 主伺服器入口
├── config.js             # 配置檔案
├── package.json          # 專案依賴
├── README.md             # 專案說明
├── services/             # 服務層
│   ├── newsService.js    # 新聞服務
│   └── priceService.js   # 價格服務
├── routes/               # 路由層
│   └── webhook.js        # LINE webhook 處理
└── utils/                # 工具層
    └── scheduler.js      # 定時推播排程
```

## 🚀 快速開始

### 1. 環境準備

確保您的系統已安裝：
- Node.js (>= 16.0.0)
- npm (>= 8.0.0)

### 2. 安裝依賴

```bash
npm install
```

### 3. 環境變數設定

建立 `.env` 檔案並設定以下變數：

```env
# LINE Bot 配置
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
LINE_CHANNEL_SECRET=your_line_channel_secret

# NewsAPI 配置
NEWS_API_KEY=your_news_api_key

# 伺服器配置
PORT=3000
NODE_ENV=development
```

### 4. 啟動服務

```bash
# 開發模式
npm run dev

# 生產模式
npm start
```

### 5. 設定 LINE Webhook

將您的伺服器 URL 設定到 LINE Developer Console：
```
https://your-domain.com/webhook
```

## 📱 使用說明

### 基本指令

| 指令 | 說明 | 範例 |
|------|------|------|
| `btc` | 查詢 BTC 價格和新聞 | `btc` |
| `/subscribe btc` | 訂閱 BTC 新聞推播 | `/subscribe btc` |
| `/unsubscribe` | 取消所有訂閱 | `/unsubscribe` |
| `/help` | 顯示幫助資訊 | `/help` |
| `/status` | 查看訂閱狀態 | `/status` |

### 支援的加密貨幣 (市值前30大)

| 代號 | 全名 | 代號 | 全名 | 代號 | 全名 |
|------|------|------|------|------|------|
| **BTC** | Bitcoin | **USDT** | Tether | **XRP** | Ripple |
| **ETH** | Ethereum | **USDC** | USD Coin | **STETH** | Staked Ether |
| **BNB** | Binance Coin | **ADA** | Cardano | **AVAX** | Avalanche |
| **SOL** | Solana | **TRX** | TRON | **WBTC** | Wrapped Bitcoin |
| **LINK** | Chainlink | **DOT** | Polkadot | **MATIC** | Polygon |
| **DAI** | Dai | **SHIB** | Shiba Inu | **LTC** | Litecoin |
| **BCH** | Bitcoin Cash | **UNI** | Uniswap | **ATOM** | Cosmos |
| **ETC** | Ethereum Classic | **XLM** | Stellar | **NEAR** | NEAR Protocol |
| **ALGO** | Algorand | **VET** | VeChain | **FIL** | Filecoin |
| **ICP** | Internet Computer | **HBAR** | Hedera | **APT** | Aptos |

## 🔧 API 端點

### 健康檢查
```
GET /
```

### 狀態查詢
```
GET /status
```

### 測試推播
```
POST /test
Content-Type: application/json

{
  "type": "daily-news" | "specific-news" | "market-summary"
}
```

### LINE Webhook
```
POST /webhook
```

## 📊 排程設定 (UTC+8)

| 時間 | 功能 | 說明 |
|------|------|------|
| 09:00 | 每日新聞推播 | 推播前 3 條加密貨幣新聞 |
| 每小時 | 特定幣種新聞 | 推播訂閱用戶的特定幣種新聞 |
| 18:00 | 市場總結 | 推播主要幣種的市場總結 |

## 🌐 部署指南

### Render 部署

1. 將專案推送到 GitHub
2. 在 Render 建立新的 Web Service
3. 連接 GitHub 儲存庫
4. 設定環境變數
5. 部署完成後設定 LINE Webhook URL

### Railway 部署

1. 將專案推送到 GitHub
2. 在 Railway 建立新專案
3. 連接 GitHub 儲存庫
4. 設定環境變數
5. 部署完成後設定 LINE Webhook URL

## 🔑 API 金鑰申請

### LINE Developer Console
1. 前往 [LINE Developer Console](https://developers.line.biz/)
2. 建立新的 Provider 和 Channel
3. 選擇 Messaging API
4. 獲取 Channel Access Token 和 Channel Secret

### NewsAPI
1. 前往 [NewsAPI](https://newsapi.org/)
2. 註冊帳號並申請 API Key
3. 免費版本每天 1000 次請求

### CoinGecko API
- 免費使用，無需申請 API Key
- 有速率限制，建議適度使用
- 提供市值前30大加密貨幣數據

## 🐛 故障排除

### 常見問題

1. **Webhook 驗證失敗**
   - 檢查 Channel Secret 是否正確
   - 確認伺服器 URL 可正常訪問

2. **新聞 API 失敗**
   - 檢查 NewsAPI Key 是否有效
   - 確認 API 請求次數未超限

3. **價格查詢失敗**
   - 檢查 CoinGecko API 是否正常
   - 確認支援的幣種代號正確

4. **推播功能異常**
   - 檢查排程器是否正常啟動
   - 確認用戶訂閱狀態正確

### 日誌查看

```bash
# 查看應用程式日誌
npm start

# 開發模式（自動重啟）
npm run dev
```

