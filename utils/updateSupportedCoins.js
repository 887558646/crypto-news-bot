const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config');

/**
 * 從 CoinGecko API 獲取市值前50大的加密貨幣
 * @returns {Promise<Array>} 幣種代號列表
 */
async function getTop50CoinsFromCoinGecko() {
  try {
    console.log('正在從 CoinGecko API 獲取市值前50大幣種...');
    
    const response = await axios.get(`${config.coingecko.baseUrl}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 50,
        page: 1,
        sparkline: false,
        x_cg_demo_api_key: config.coingecko.apiKey
      }
    });
    
    if (response.data && Array.isArray(response.data)) {
      const coins = response.data.map(coin => coin.symbol.toLowerCase());
      console.log(`✅ 成功獲取 ${coins.length} 個幣種:`, coins);
      return coins;
    }
    
    throw new Error('CoinGecko API 返回的數據格式不正確');
  } catch (error) {
    console.error('❌ 從 CoinGecko 獲取幣種失敗:', error.message);
    throw error;
  }
}

/**
 * 更新 config.js 中的 supportedCoins
 * @param {Array} coins - 新的幣種列表
 */
async function updateConfigFile(coins) {
  try {
    const configPath = path.join(__dirname, '..', 'config.js');
    const configContent = await fs.readFile(configPath, 'utf8');
    
    // 創建新的幣種配置
    const coinsConfig = [
      '// 前10大',
      `'${coins.slice(0, 10).join("', '")}',`,
      '// 11-20大',
      `'${coins.slice(10, 20).join("', '")}',`,
      '// 21-30大',
      `'${coins.slice(20, 30).join("', '")}',`,
      '// 31-40大',
      `'${coins.slice(30, 40).join("', '")}',`,
      '// 41-50大',
      `'${coins.slice(40, 50).join("', '")}'`
    ].join('\n    ');
    
    // 替換 supportedCoins 配置
    const updatedContent = configContent.replace(
      /supportedCoins:\s*\[[\s\S]*?\]/,
      `supportedCoins: [\n    ${coinsConfig}\n  ]`
    );
    
    await fs.writeFile(configPath, updatedContent, 'utf8');
    console.log('✅ 已更新 config.js 文件');
  } catch (error) {
    console.error('❌ 更新 config.js 失敗:', error.message);
    throw error;
  }
}

/**
 * 主函數：更新支援幣種列表
 */
async function updateSupportedCoins() {
  try {
    console.log('🔄 開始更新支援幣種列表...');
    
    // 獲取市值前50大幣種
    const top50Coins = await getTop50CoinsFromCoinGecko();
    
    // 更新配置文件
    await updateConfigFile(top50Coins);
    
    console.log('🎉 支援幣種列表更新完成！');
    console.log('📊 更新後的幣種數量:', top50Coins.length);
    console.log('📝 前10大幣種:', top50Coins.slice(0, 10));
    
    return top50Coins;
  } catch (error) {
    console.error('❌ 更新支援幣種失敗:', error.message);
    throw error;
  }
}

// 如果直接執行此文件，則執行更新
if (require.main === module) {
  updateSupportedCoins()
    .then(() => {
      console.log('✅ 更新完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 更新失敗:', error.message);
      process.exit(1);
    });
}

module.exports = {
  updateSupportedCoins,
  getTop50CoinsFromCoinGecko,
  updateConfigFile
};
