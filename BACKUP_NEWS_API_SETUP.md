# 備用新聞 API 設置指南

## 概述

為了確保您的新聞機器人在 NewsAPI 無法使用時仍能穩定運作，我們整合了多個免費的新聞 API 作為備用方案。

## 可用的備用新聞 API

### 1. NewsData.io
- **免費額度**: 200 請求/天
- **功能**: 支援關鍵字、語言、地點搜索
- **適合**: 小型應用
- **註冊**: https://newsdata.io/
- **API 文檔**: https://newsdata.io/docs

### 2. Mediastack
- **免費額度**: 500 請求/月
- **功能**: 50+ 國家, 13 種語言
- **適合**: 初期開發
- **註冊**: https://mediastack.com/
- **API 文檔**: https://mediastack.com/documentation

### 3. Bing 新聞搜索 API
- **免費額度**: 1,000 請求/月
- **功能**: 微軟提供的高品質新聞搜索
- **適合**: 中等規模應用
- **註冊**: https://azure.microsoft.com/zh-tw/services/cognitive-services/bing-news-search-api/
- **API 文檔**: https://docs.microsoft.com/zh-tw/azure/cognitive-services/bing-news-search/

## 設置步驟

### 1. 註冊 API 帳戶

#### NewsData.io
1. 前往 https://newsdata.io/
2. 點擊 "Get Started" 或 "Sign Up"
3. 註冊免費帳戶
4. 在儀表板中獲取 API Key

#### Mediastack
1. 前往 https://mediastack.com/
2. 點擊 "Get Started"
3. 註冊免費帳戶
4. 在儀表板中獲取 Access Key

#### Bing 新聞搜索 API
1. 前往 https://azure.microsoft.com/zh-tw/services/cognitive-services/bing-news-search-api/
2. 點擊 "Get Started"
3. 創建 Azure 帳戶（如果沒有）
4. 創建 Bing 新聞搜索資源
5. 獲取 API Key

### 2. 配置環境變數

在您的 `.env` 文件中添加：

```env
# 備用新聞 API 配置
# NewsData.io (200 請求/天)
NEWSDATA_API_KEY=your_newsdata_api_key_here

# Mediastack (500 請求/月)
MEDIASTACK_API_KEY=your_mediastack_api_key_here

# Bing 新聞搜索 API (1,000 請求/月)
BING_API_KEY=your_bing_api_key_here
```

### 3. 在 Render 中設置環境變數

1. 登入您的 Render 控制台
2. 選擇您的服務
3. 前往 "Environment" 頁面
4. 添加以下環境變數：
   - `NEWSDATA_API_KEY`
   - `MEDIASTACK_API_KEY`
   - `BING_API_KEY`

## 工作原理

1. **主要新聞源**: NewsAPI
2. **備用新聞源**: 當 NewsAPI 返回 403/426 錯誤時，自動切換到備用源
3. **備用源順序**:
   - NewsData.io (優先)
   - Mediastack (次選)
   - Bing 新聞搜索 (最後)

## 優勢

- ✅ **真實新聞**: 所有備用源都提供真實的新聞內容
- ✅ **高可用性**: 多個備用源確保服務穩定
- ✅ **免費使用**: 所有備用源都有免費方案
- ✅ **自動切換**: 無需手動干預，自動處理 API 失敗

## 注意事項

- 請遵守各 API 的使用條款和速率限制
- 建議至少配置一個備用 API Key 以確保服務穩定
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
