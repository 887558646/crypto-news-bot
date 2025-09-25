# 外部 Cron 服務設置指南

由於 Render 免費版會在 15 分鐘無活動後進入睡眠模式，導致內建定時任務無法執行，我們需要設置外部 cron 服務來觸發定時任務。

## 推薦的外部 Cron 服務

### 1. Cron-job.org (免費)
- **網址**: https://cron-job.org/
- **免費配額**: 無限制
- **設置步驟**:
  1. 註冊帳號
  2. 創建新的 cron job
  3. 設置 URL 和時間

### 2. EasyCron (免費版)
- **網址**: https://www.easycron.com/
- **免費配額**: 每月 20 次執行
- **設置步驟**:
  1. 註冊帳號
  2. 創建新的 cron job
  3. 設置 URL 和時間

### 3. UptimeRobot (免費)
- **網址**: https://uptimerobot.com/
- **免費配額**: 50 個監控器
- **設置步驟**:
  1. 註冊帳號
  2. 創建 HTTP(s) 監控器
  3. 設置監控間隔

## 設置步驟

### 1. 設置環境變數

在 Render 控制台中添加以下環境變數：

```
CRON_SECRET=your-secret-key-here
KEEPALIVE_URL=https://your-app.onrender.com/keepalive
```

### 2. 創建 Cron Jobs

#### 每日新聞推播 (08:00 UTC+8)
- **URL**: `https://your-app.onrender.com/trigger/daily-news`
- **方法**: POST
- **Headers**: `Content-Type: application/json`
- **Body**: `{"secret": "your-secret-key-here"}`
- **時間**: `0 0 * * *` (UTC 時間 00:00，對應 UTC+8 的 08:00)

#### 市場總結推播 (18:00 UTC+8)
- **URL**: `https://your-app.onrender.com/trigger/market-summary`
- **方法**: POST
- **Headers**: `Content-Type: application/json`
- **Body**: `{"secret": "your-secret-key-here"}`
- **時間**: `10 0 * * *` (UTC 時間 10:00，對應 UTC+8 的 18:00)

### 3. 設置 Keep-Alive

#### 使用 UptimeRobot 設置 Keep-Alive
- **URL**: `https://your-app.onrender.com/keepalive`
- **方法**: GET
- **監控間隔**: 5 分鐘
- **超時**: 30 秒

## 時區轉換

| 任務 | UTC+8 時間 | UTC 時間 | Cron 表達式 |
|------|------------|----------|-------------|
| 每日新聞 | 08:00 | 00:00 | `0 0 * * *` |
| 市場總結 | 18:00 | 10:00 | `0 10 * * *` |
| Keep-Alive | 每 5 分鐘 | 每 5 分鐘 | `*/5 * * * *` |

## 測試

### 1. 測試 Keep-Alive
```bash
curl https://your-app.onrender.com/keepalive
```

### 2. 測試外部觸發
```bash
curl -X POST https://your-app.onrender.com/trigger/daily-news \
  -H "Content-Type: application/json" \
  -d '{"secret": "your-secret-key-here"}'
```

### 3. 檢查狀態
```bash
curl https://your-app.onrender.com/status
```

## 注意事項

1. **安全性**: 請使用強密碼作為 `CRON_SECRET`
2. **時區**: 確保 cron 服務使用 UTC 時間
3. **監控**: 定期檢查 cron 服務的執行日誌
4. **備用方案**: 建議設置多個 cron 服務作為備用

## 故障排除

### 常見問題

1. **401 Unauthorized**: 檢查 `CRON_SECRET` 是否正確
2. **404 Not Found**: 檢查 URL 是否正確
3. **500 Internal Server Error**: 檢查應用日誌
4. **Timeout**: 檢查 Render 應用是否在睡眠狀態

### 日誌檢查

在 Render 控制台中查看應用日誌：
- 外部觸發日誌
- Keep-Alive 日誌
- 錯誤日誌
