# 備用新聞 API 設置指南

## 概述

為了確保您的新聞機器人在 NewsAPI 無法使用時仍能穩定運作，我們整合了 NewsData.io 作為備用方案。

## 可用的備用新聞 API

### NewsData.io
- **免費額度**: 200 請求/天
- **功能**: 支援關鍵字、語言、地點搜索
- **適合**: 小型到中型應用
- **註冊**: https://newsdata.io/
- **API 文檔**: https://newsdata.io/docs

## 設置步驟

### 1. 註冊 API 帳戶

#### NewsData.io
1. 前往 https://newsdata.io/
2. 點擊 "Get Started" 或 "Sign Up"
3. 註冊免費帳戶
4. 在儀表板中獲取 API Key

### 2. 配置環境變數

在您的 `.env` 文件中添加：

```env
# 備用新聞 API 配置
# NewsData.io (200 請求/天)
NEWSDATA_API_KEY=your_newsdata_api_key_here
```

### 3. 在 Render 中設置環境變數

1. 登入您的 Render 控制台
2. 選擇您的服務
3. 前往 "Environment" 頁面
4. 添加以下環境變數：
   - `NEWSDATA_API_KEY`

## 工作原理

1. **主要新聞源**: NewsAPI
2. **備用新聞源**: 當 NewsAPI 返回 403/426 錯誤時，自動切換到備用源
3. **備用源**: NewsData.io

## 優勢

- ✅ **真實新聞**: 備用源提供真實的新聞內容
- ✅ **高可用性**: 備用源確保服務穩定
- ✅ **免費使用**: 備用源有免費方案
- ✅ **自動切換**: 無需手動干預，自動處理 API 失敗

## 注意事項

- 請遵守 API 的使用條款和速率限制
- 建議配置 NewsData.io API Key 以確保服務穩定
- 定期檢查 API 使用量，避免超出免費額度

## 測試

配置完成後，您可以測試備用新聞功能：

```bash
# 測試熱門新聞
curl -X POST https://your-bot-url.com/webhook \
  -H "Content-Type: application/json" \
  -d '{"events":[{"type":"message","message":{"type":"text","text":"/news"}}]}'

# 測試關鍵字搜尋
curl -X POST https://your-bot-url.com/webhook \
  -H "Content-Type: application/json" \
  -d '{"events":[{"type":"message","message":{"type":"text","text":"/searchnews bitcoin"}}]}'
```

## 支援

如果您在設置過程中遇到問題，請檢查：
1. API Key 是否正確
2. 環境變數是否已正確設置
3. API 額度是否已用完
4. 網路連接是否正常
