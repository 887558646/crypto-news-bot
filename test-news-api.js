const axios = require('axios');

// 測試 NewsAPI 是否正常工作
async function testNewsAPI() {
  const apiKey = process.env.NEWS_API_KEY;
  
  if (!apiKey) {
    console.log('❌ NEWS_API_KEY 未設定');
    return;
  }
  
  console.log('🔍 測試 NewsAPI...');
  console.log('API Key:', apiKey.substring(0, 10) + '...');
  
  try {
    // 計算一天前的時間
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const fromDate = oneDayAgo.toISOString().split('T')[0];
    
    console.log('查詢日期範圍:', fromDate, '到今天');
    
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'bitcoin',
        language: 'en',
        sortBy: 'publishedAt',
        from: fromDate,
        pageSize: 3,
        apiKey: apiKey
      }
    });
    
    console.log('✅ NewsAPI 正常！');
    console.log('找到文章數量:', response.data.articles.length);
    
    if (response.data.articles.length > 0) {
      console.log('第一篇文章:');
      console.log('- 標題:', response.data.articles[0].title);
      console.log('- 來源:', response.data.articles[0].source.name);
      console.log('- 發布時間:', response.data.articles[0].publishedAt);
    }
    
  } catch (error) {
    console.log('❌ NewsAPI 失敗:');
    console.log('狀態碼:', error.response?.status);
    console.log('錯誤訊息:', error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('💡 解決方案: 檢查 API Key 是否正確');
    } else if (error.response?.status === 429) {
      console.log('💡 解決方案: API 請求次數已達上限');
    }
  }
}

testNewsAPI();
