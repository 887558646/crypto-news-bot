# 🚀 部署指南

本指南將協助您將 Crypto News Bot 部署到各種雲端平台。

## 📋 部署前準備

### 1. 環境變數設定

建立 `.env` 檔案並設定以下變數：

```env
# LINE Bot 配置
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
LINE_CHANNEL_SECRET=your_line_channel_secret

# NewsAPI 配置
NEWS_API_KEY=your_news_api_key

# 伺服器配置
PORT=3000
NODE_ENV=production
```

### 2. API 金鑰申請

#### LINE Developer Console
1. 前往 [LINE Developer Console](https://developers.line.biz/)
2. 建立新的 Provider 和 Channel
3. 選擇 Messaging API
4. 獲取 Channel Access Token 和 Channel Secret
5. 設定 Webhook URL（部署後填入）

#### NewsAPI
1. 前往 [NewsAPI](https://newsapi.org/)
2. 註冊帳號並申請 API Key
3. 免費版本每天 1000 次請求

## 🌐 平台部署

### Render 部署

1. **準備儲存庫**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/crypto-news-bot.git
   git push -u origin main
   ```

2. **建立 Render 服務**
   - 前往 [Render](https://render.com/)
   - 點擊 "New" → "Web Service"
   - 連接 GitHub 儲存庫
   - 選擇 `crypto-news-bot` 儲存庫

3. **設定部署參數**
   ```
   Name: crypto-news-bot
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **設定環境變數**
   - 在 Render 控制台中找到 "Environment" 頁籤
   - 新增以下環境變數：
     ```
     LINE_CHANNEL_ACCESS_TOKEN=your_token
     LINE_CHANNEL_SECRET=your_secret
     NEWS_API_KEY=your_key
     NODE_ENV=production
     ```

5. **部署完成**
   - 點擊 "Create Web Service"
   - 等待部署完成
   - 複製生成的 URL（例如：`https://crypto-news-bot.onrender.com`）

6. **設定 LINE Webhook**
   - 回到 LINE Developer Console
   - 在 Webhook URL 欄位填入：`https://your-app-name.onrender.com/webhook`
   - 啟用 "Use webhook"

### Railway 部署

1. **準備儲存庫**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/crypto-news-bot.git
   git push -u origin main
   ```

2. **建立 Railway 專案**
   - 前往 [Railway](https://railway.app/)
   - 點擊 "New Project"
   - 選擇 "Deploy from GitHub repo"
   - 選擇 `crypto-news-bot` 儲存庫

3. **設定環境變數**
   - 在 Railway 控制台中找到 "Variables" 頁籤
   - 新增以下環境變數：
     ```
     LINE_CHANNEL_ACCESS_TOKEN=your_token
     LINE_CHANNEL_SECRET=your_secret
     NEWS_API_KEY=your_key
     NODE_ENV=production
     ```

4. **部署完成**
   - Railway 會自動部署
   - 等待部署完成
   - 複製生成的 URL（例如：`https://crypto-news-bot-production.up.railway.app`）

5. **設定 LINE Webhook**
   - 回到 LINE Developer Console
   - 在 Webhook URL 欄位填入：`https://your-app-name.up.railway.app/webhook`
   - 啟用 "Use webhook"

### Heroku 部署

1. **準備儲存庫**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/crypto-news-bot.git
   git push -u origin main
   ```

2. **建立 Heroku 應用程式**
   ```bash
   # 安裝 Heroku CLI
   npm install -g heroku
   
   # 登入 Heroku
   heroku login
   
   # 建立應用程式
   heroku create crypto-news-bot
   ```

3. **設定環境變數**
   ```bash
   heroku config:set LINE_CHANNEL_ACCESS_TOKEN=your_token
   heroku config:set LINE_CHANNEL_SECRET=your_secret
   heroku config:set NEWS_API_KEY=your_key
   heroku config:set NODE_ENV=production
   ```

4. **部署應用程式**
   ```bash
   git push heroku main
   ```

5. **設定 LINE Webhook**
   - 回到 LINE Developer Console
   - 在 Webhook URL 欄位填入：`https://crypto-news-bot.herokuapp.com/webhook`
   - 啟用 "Use webhook"

## 🔧 部署後設定

### 1. 驗證部署

訪問以下 URL 確認部署成功：

```
https://your-app-url.com/
https://your-app-url.com/status
```

### 2. 測試 Webhook

在 LINE Developer Console 中：
1. 點擊 "Verify" 按鈕測試 Webhook
2. 確認顯示 "Success" 狀態

### 3. 測試 Bot 功能

1. 掃描 QR Code 或搜尋 LINE Bot
2. 發送 `/help` 指令測試基本功能
3. 發送 `btc` 測試價格查詢
4. 發送 `/chart btc` 測試圖表功能

## 🐛 故障排除

### 常見問題

1. **Webhook 驗證失敗**
   - 檢查 URL 是否正確
   - 確認伺服器正在運行
   - 檢查 Channel Secret 是否正確

2. **環境變數未生效**
   - 確認環境變數名稱正確
   - 重新部署應用程式
   - 檢查平台環境變數設定

3. **API 請求失敗**
   - 檢查 API Key 是否有效
   - 確認 API 請求次數未超限
   - 檢查網路連線

4. **排程器未啟動**
   - 檢查應用程式日誌
   - 確認時區設定正確
   - 檢查 cron 表達式

### 日誌查看

#### Render
- 在控制台中找到 "Logs" 頁籤
- 查看即時日誌

#### Railway
- 在控制台中找到 "Deployments" 頁籤
- 點擊部署記錄查看日誌

#### Heroku
```bash
heroku logs --tail
```

## 📊 監控與維護

### 1. 健康檢查

定期訪問健康檢查端點：
```
GET https://your-app-url.com/status
```

### 2. 效能監控

- 監控 API 請求次數
- 檢查回應時間
- 監控錯誤率

### 3. 定期更新

- 更新依賴套件
- 檢查 API 變更
- 更新 LINE Bot SDK

## 🔒 安全考量

1. **環境變數保護**
   - 不要將 `.env` 檔案提交到版本控制
   - 使用平台提供的環境變數功能

2. **API 金鑰管理**
   - 定期輪換 API 金鑰
   - 監控 API 使用情況

3. **存取控制**
   - 限制 Webhook 端點存取
   - 實作適當的錯誤處理

## 📈 擴展建議

1. **資料庫整合**
   - 使用 PostgreSQL 或 MongoDB
   - 儲存用戶訂閱狀態
   - 記錄使用統計

2. **快取機制**
   - 實作 Redis 快取
   - 減少 API 請求次數
   - 提升回應速度

3. **監控告警**
   - 整合監控服務
   - 設定異常告警
   - 實作健康檢查

---

🎉 恭喜！您已成功部署 Crypto News Bot！

如有任何問題，請參考 [README.md](README.md) 或建立 Issue。
