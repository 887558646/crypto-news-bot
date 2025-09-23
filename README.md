# 🤖 Crypto News Bot

一個功能豐富的 LINE Bot，提供加密貨幣新聞、即時價格查詢、市場分析和技術指標等功能。

## ✨ 功能特色

### 📰 新聞功能
- **每日新聞摘要**：每天早上 9:00 (UTC+8) 自動推播前 3 條加密貨幣新聞
- **特定幣種新聞**：輸入幣種代號即可獲取 24 小時內最新相關新聞
- **熱門新聞**：使用 `/news` 獲取今日前 5 條熱門新聞
- **關鍵字搜尋**：使用 `/searchnews [關鍵字]` 搜尋相關新聞

### 💰 價格查詢
- **即時價格**：支援市值前30大加密貨幣
- **多幣種支援**：同時顯示 USD 和 TWD 價格
- **24小時變化**：顯示價格變化和交易量資訊
- **幣種資訊**：使用 `/info [幣種]` 查看詳細資訊

### 📊 市場分析
- **市場總覽**：使用 `/market` 查看全球加密貨幣市場概況
- **趨勢幣種**：使用 `/trending` 查看當前熱門幣種
- **恐懼貪婪指數**：使用 `/feargreed` 查看市場情緒指標
- **技術分析**：使用 `/signal [幣種]` 獲取技術指標分析

### 🔔 訂閱管理
- **個人化訂閱**：每個用戶可獨立管理訂閱狀態
- **靈活控制**：使用 `/subscribe [幣種]` 訂閱特定幣種新聞
- **取消訂閱**：使用 `/unsubscribe` 取消訂閱
- **狀態查詢**：使用 `/status` 查看當前訂閱狀態

## 🛠 技術棧

- **Node.js** + **Express** - 後端框架
- **LINE Messaging API SDK** - LINE Bot 整合
- **Axios** - HTTP 請求處理
- **node-cron** - 定時任務排程
- **technicalindicators** - 技術分析指標計算
- **CoinGecko API** - 加密貨幣價格和市場數據
- **NewsAPI** - 新聞數據
- **Alternative.me API** - 恐懼貪婪指數

## 📂 專案結構

```
crypto-news-bot/
├── index.js              # 主伺服器入口
├── config.js             # 配置檔案
├── package.json          # 專案依賴
├── README.md             # 專案說明
├── .env                  # 環境變數配置
├── services/             # 服務層
│   ├── newsService.js    # 新聞服務
│   ├── priceService.js   # 價格服務
│   ├── marketService.js  # 市場分析服務
│   ├── signalService.js  # 技術分析服務
│   └── infoService.js    # 幣種資訊服務
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
| `/news` | 獲取今日熱門新聞 | `/news` |
| `/market` | 查看全球市場總覽 | `/market` |
| `/trending` | 查看趨勢幣種 | `/trending` |
| `/feargreed` | 查看恐懼貪婪指數 | `/feargreed` |
| `/signal btc` | 獲取 BTC 技術分析 | `/signal btc` |
| `/info btc` | 查看 BTC 詳細資訊 | `/info btc` |
| `/searchnews defi` | 搜尋 DeFi 相關新聞 | `/searchnews defi` |
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

## 📊 功能狀態

### ✅ 完全正常的功能
- **基礎查詢** - 直接輸入幣種代號查詢價格和新聞
- **新聞功能** - 熱門新聞、關鍵字搜尋、特定幣種新聞
- **趨勢分析** - 趨勢幣種、恐懼貪婪指數
- **訂閱管理** - 訂閱、取消訂閱、狀態查詢

### ⚠️ 受 API 限制影響的功能
- **市場總覽** - 受 CoinGecko 免費版速率限制影響
- **技術分析** - 受 CoinGecko 免費版速率限制影響  
- **幣種資訊** - 受 CoinGecko 免費版速率限制影響

> **注意**: 受限制的功能在 API 速率限制期間會顯示具體錯誤信息，不會提供假的備用數據。

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
| 09:00 | 每日新聞推播 | 推播前 3 條加密貨幣新聞給所有訂閱用戶 |
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

2. **API 速率限制錯誤 (429)**
   - **CoinGecko API**: 免費版每分鐘 30 次請求限制
   - **解決方案**: 等待速率限制重置或升級到付費版
   - **影響功能**: 市場總覽、技術分析、幣種資訊

3. **新聞 API 失敗**
   - 檢查 NewsAPI Key 是否有效
   - 確認 API 請求次數未超限
   - **狀態**: 目前正常運作

4. **價格查詢失敗**
   - 檢查 CoinGecko API 是否正常
   - 確認支援的幣種代號正確
   - **狀態**: 目前正常運作

5. **推播功能異常**
   - 檢查排程器是否正常啟動
   - 確認用戶訂閱狀態正確

### API 狀態監控
- **CoinGecko API**: ⚠️ 免費版速率限制
- **NewsAPI**: ✅ 正常運作
- **Alternative.me API**: ✅ 正常運作

### 日誌查看

```bash
# 查看應用程式日誌
npm start

# 開發模式（自動重啟）
npm run dev
```

## 📝 更新日誌

### v2.0.0 (2025-09-23)
- ✅ **新增功能**:
  - 市場總覽 (`/market`)
  - 趨勢幣種 (`/trending`) 
  - 恐懼貪婪指數 (`/feargreed`)
  - 技術分析 (`/signal [幣種]`)
  - 幣種資訊 (`/info [幣種]`)
  - 關鍵字新聞搜尋 (`/searchnews [關鍵字]`)
  - 熱門新聞 (`/news`)

- 🔧 **修復問題**:
  - 修復恐懼貪婪指數 API (改用 Alternative.me)
  - 修復新聞時間範圍 (限制為24小時內)
  - 統一時間格式為 UTC+8
  - 移除備用數據機制，提供透明錯誤處理

- 📊 **功能狀態**:
  - 核心功能: 8/8 正常 (100%)
  - 進階功能: 3/3 受 CoinGecko 速率限制影響
  - 支援幣種: 市值前30大加密貨幣

### v1.0.0 (初始版本)
- 基礎價格查詢功能
- 新聞推播功能
- 訂閱管理功能

## 📄 授權

MIT License

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

---

**最後更新**: 2025-09-23
