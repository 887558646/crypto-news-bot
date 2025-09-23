# 🧪 本地測試指南

本指南將協助您完整測試 Crypto News Bot 的所有功能。

## 📋 測試前準備

### 1. 確保環境設定
```bash
# 檢查 Node.js 版本
node --version

# 檢查 npm 版本
npm --version

# 安裝依賴
npm install
```

### 2. 設定環境變數
編輯 `.env` 檔案，填入您的 API 金鑰：
```env
LINE_CHANNEL_ACCESS_TOKEN=您的Token
LINE_CHANNEL_SECRET=您的Secret
NEWS_API_KEY=您的API Key
PORT=3000
NODE_ENV=development
```

## 🚀 測試步驟

### 步驟 1: 啟動伺服器
```bash
npm start
```

您應該看到：
```
🚀 Crypto News Bot 已啟動！
📡 伺服器運行在 http://localhost:3000
🔗 Webhook 端點: http://localhost:3000/webhook
📊 狀態檢查: http://localhost:3000/status
🧪 測試端點: http://localhost:3000/test
⏰ 排程器將在啟動後開始運行
啟動排程器...
排程器已啟動
✅ 所有服務已就緒！
```

### 步驟 2: 執行自動化測試
開啟新的終端機視窗，執行：
```bash
node test-local.js
```

### 步驟 3: 手動測試 API 端點

#### 3.1 健康檢查
```bash
curl http://localhost:3000
```
預期回應：
```json
{
  "message": "Crypto News Bot 正在運行中！",
  "version": "1.0.0",
  "timestamp": "2025-09-23T07:29:35.468Z",
  "status": "healthy"
}
```

#### 3.2 狀態查詢
```bash
curl http://localhost:3000/status
```
預期回應：
```json
{
  "bot": {
    "name": "Crypto News Bot",
    "version": "1.0.0",
    "status": "running"
  },
  "supportedCoins": ["btc", "eth", "sol", "bnb", "sui"]
}
```

#### 3.3 測試推播功能
```bash
curl -X POST http://localhost:3000/test \
  -H "Content-Type: application/json" \
  -d '{"type": "daily-news"}'
```

### 步驟 4: 測試 LINE Bot 功能

#### 4.1 使用 LINE Webhook 測試工具
1. 前往 [LINE Webhook 測試工具](https://developers.line.biz/console/)
2. 輸入您的 Webhook URL: `http://localhost:3000/webhook`
3. 發送測試訊息

#### 4.2 使用 ngrok 進行本地測試
```bash
# 安裝 ngrok
npm install -g ngrok

# 啟動 ngrok
ngrok http 3000
```

然後使用 ngrok 提供的 URL 設定 LINE Webhook。

## 🔍 測試項目檢查清單

### ✅ 基本功能測試
- [ ] 伺服器啟動正常
- [ ] 健康檢查端點回應
- [ ] 狀態查詢端點回應
- [ ] 新聞服務正常運作
- [ ] 價格服務正常運作
- [ ] 圖表服務正常運作

### ✅ LINE Bot 功能測試
- [ ] Webhook 端點可接收訊息
- [ ] 價格查詢指令正常
- [ ] 圖表生成指令正常
- [ ] 訂閱功能正常
- [ ] 幫助指令正常
- [ ] 狀態查詢指令正常

### ✅ 推播功能測試
- [ ] 每日新聞推播
- [ ] 特定幣種新聞推播
- [ ] 市場總結推播

## 🐛 常見問題排除

### 問題 1: 伺服器無法啟動
**錯誤訊息**: `Error: listen EADDRINUSE :::3000`
**解決方案**:
```bash
# 檢查端口占用
netstat -ano | findstr :3000

# 終止占用進程
taskkill /PID <進程ID> /F

# 或更改端口
# 在 .env 檔案中設定 PORT=3001
```

### 問題 2: API 請求失敗
**錯誤訊息**: `Request failed with status code 401`
**解決方案**:
1. 檢查 `.env` 檔案中的 API 金鑰
2. 確認 API 金鑰有效
3. 檢查 API 請求次數限制

### 問題 3: LINE Webhook 驗證失敗
**錯誤訊息**: `Webhook verification failed`
**解決方案**:
1. 檢查 `LINE_CHANNEL_SECRET` 是否正確
2. 確認 Webhook URL 可訪問
3. 使用 ngrok 進行本地測試

## 📊 測試結果範例

### 成功測試結果
```
🧪 開始本地測試 Crypto News Bot...

1️⃣ 測試伺服器健康檢查...
✅ 伺服器運行正常
   狀態: healthy
   版本: 1.0.0

2️⃣ 測試狀態端點...
✅ 狀態端點正常
   Bot 名稱: Crypto News Bot
   支援的幣種: btc, eth, sol, bnb, sui

3️⃣ 測試新聞服務...
✅ 新聞服務正常
   獲取到 2 條新聞
   第一條新聞: Bitcoin 價格突破新高...

4️⃣ 測試價格服務...
✅ 價格服務正常
   BTC 價格: $45000
   24h 變化: 2.5%

5️⃣ 測試圖表服務...
✅ 圖表服務正常
   圖表 URL: https://quickchart.io/chart?c=%7B%22type%22%3A%22line%22...

6️⃣ 測試多幣種價格...
✅ 多幣種價格服務正常
   獲取到 3 個幣種價格
   BTC: $45000
   ETH: $3000
   SOL: $100

7️⃣ 測試 Webhook 端點...
⚠️  Webhook 端點需要 LINE 驗證（這是正常的）

8️⃣ 測試推播功能...
⚠️  推播功能測試失敗（可能是因為沒有 LINE 配置）

🎉 本地測試完成！
📋 測試結果摘要:
   ✅ 伺服器健康檢查 - 正常
   ✅ 狀態端點 - 正常
   ✅ 新聞服務 - 正常
   ✅ 價格服務 - 正常
   ✅ 圖表服務 - 正常
   ✅ 多幣種服務 - 正常
   ⚠️  Webhook 端點 - 需要 LINE 配置
   ⚠️  推播功能 - 需要 LINE 配置

🚀 您的 Crypto News Bot 本地測試通過！
💡 下一步：設定 LINE API 金鑰並部署到雲端
```

## 🎯 測試完成後

### 如果所有測試通過
1. ✅ 您的 Bot 功能正常
2. 🚀 可以進行雲端部署
3. 🔗 設定 LINE Webhook URL

### 如果有測試失敗
1. 🔍 檢查錯誤訊息
2. 🔧 參考故障排除指南
3. 📞 尋求技術支援

## 💡 進階測試

### 負載測試
```bash
# 安裝 artillery
npm install -g artillery

# 執行負載測試
artillery quick --count 10 --num 5 http://localhost:3000/
```

### 效能監控
```bash
# 監控記憶體使用
node --inspect index.js

# 使用 Chrome DevTools 監控
# 開啟 chrome://inspect
```

---

🎉 恭喜！您已完成本地測試！

如果所有測試都通過，您的 Crypto News Bot 就準備好部署到雲端了！
