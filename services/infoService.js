const axios = require('axios');
const config = require('../config');

class InfoService {
  constructor() {
    this.baseUrl = config.coingecko.baseUrl;
  }

  /**
   * 獲取幣種詳細資訊
   * @param {string} coin - 加密貨幣代號
   * @returns {Promise<Object>} 幣種資訊
   */
  async getCoinInfo(coin) {
    try {
      if (!config.supportedCoins.includes(coin.toLowerCase())) {
        throw new Error(`不支援的加密貨幣: ${coin}`);
      }

      console.log(`🔍 開始獲取 ${coin.toUpperCase()} 詳細資訊...`);

      // 映射到 CoinGecko 的實際 ID
      const coinGeckoIds = {
        'btc': 'bitcoin', 'eth': 'ethereum', 'usdt': 'tether', 'bnb': 'binancecoin', 'sol': 'solana',
        'xrp': 'ripple', 'usdc': 'usd-coin', 'steth': 'staked-ether', 'ada': 'cardano', 'avax': 'avalanche-2',
        'trx': 'tron', 'wbtc': 'wrapped-bitcoin', 'link': 'chainlink', 'dot': 'polkadot', 'matic': 'matic-network',
        'dai': 'dai', 'shib': 'shiba-inu', 'ltc': 'litecoin', 'bch': 'bitcoin-cash', 'uni': 'uniswap',
        'atom': 'cosmos', 'etc': 'ethereum-classic', 'xlm': 'stellar', 'near': 'near', 'algo': 'algorand',
        'vet': 'vechain', 'fil': 'filecoin', 'icp': 'internet-computer', 'hbar': 'hedera-hashgraph', 'apt': 'aptos'
      };

      const coinGeckoId = coinGeckoIds[coin.toLowerCase()];
      if (!coinGeckoId) {
        throw new Error(`不支援的加密貨幣: ${coin}`);
      }

      // 調用 CoinGecko API 獲取詳細資訊
      const response = await axios.get(`${this.baseUrl}/coins/${coinGeckoId}`, {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: false,
          developer_data: false,
          sparkline: false,
          x_cg_demo_api_key: config.coingecko.apiKey
        }
      });

      const data = response.data;
      const marketData = data.market_data;

      // 處理幣種資訊
      const coinInfo = {
        name: data.name,
        symbol: data.symbol.toUpperCase(),
        marketCapRank: marketData.market_cap_rank || 'N/A',
        marketCap: marketData.market_cap?.usd || 0,
        volume24h: marketData.total_volume?.usd || 0,
        genesisDate: data.genesis_date || null,
        description: this.extractDescription(data.description?.en || ''),
        lastUpdated: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
      };

      console.log(`✅ ${coin.toUpperCase()} 資訊獲取完成`);
      return coinInfo;

    } catch (error) {
      console.error('獲取幣種資訊失敗:', error.message);
      throw new Error(`獲取 ${coin.toUpperCase()} 幣種資訊失敗: ${error.message}`);
    }
  }

  /**
   * 提取簡介描述
   * @param {string} description - 原始描述
   * @returns {string} 簡化描述
   */
  extractDescription(description) {
    if (!description) {
      return '暫無詳細介紹';
    }

    // 移除 HTML 標籤
    const cleanDescription = description.replace(/<[^>]*>/g, '');
    
    // 取前兩句話
    const sentences = cleanDescription.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length >= 2) {
      return sentences.slice(0, 2).join('. ').trim() + '.';
    } else if (sentences.length === 1) {
      return sentences[0].trim() + '.';
    } else {
      return '暫無詳細介紹';
    }
  }

  /**
   * 格式化市值
   * @param {number} marketCap - 市值
   * @returns {string} 格式化市值
   */
  formatMarketCap(marketCap) {
    if (marketCap >= 1e12) {
      return `約 $${(marketCap / 1e12).toFixed(1)}T`;
    } else if (marketCap >= 1e9) {
      return `約 $${(marketCap / 1e9).toFixed(1)}B`;
    } else if (marketCap >= 1e6) {
      return `約 $${(marketCap / 1e6).toFixed(1)}M`;
    } else {
      return `約 $${marketCap.toLocaleString()}`;
    }
  }

  /**
   * 格式化交易量
   * @param {number} volume - 交易量
   * @returns {string} 格式化交易量
   */
  formatVolume(volume) {
    if (volume >= 1e12) {
      return `約 $${(volume / 1e12).toFixed(1)}T`;
    } else if (volume >= 1e9) {
      return `約 $${(volume / 1e9).toFixed(1)}B`;
    } else if (volume >= 1e6) {
      return `約 $${(volume / 1e6).toFixed(1)}M`;
    } else {
      return `約 $${volume.toLocaleString()}`;
    }
  }

  /**
   * 格式化上線年份
   * @param {string} genesisDate - 創世日期
   * @returns {string} 上線年份
   */
  formatGenesisDate(genesisDate) {
    if (!genesisDate) {
      return 'N/A';
    }
    
    try {
      const year = new Date(genesisDate).getFullYear();
      return year.toString();
    } catch (error) {
      return 'N/A';
    }
  }

  /**
   * 格式化完整幣種資訊卡 (包含價格和詳細資訊)
   * @param {Object} priceData - 價格資料
   * @param {Object} coinInfo - 幣種資訊
   * @returns {string} 格式化訊息
   */
  formatCoinInfoCard(priceData, coinInfo) {
    const { name, symbol, marketCapRank, marketCap, volume24h, genesisDate, description, lastUpdated } = coinInfo;
    const { price, change24h, marketCap: priceMarketCap } = priceData;
    const priceUSD = price?.usd;
    const priceTWD = price?.twd;

    let message = `📌 ${name} (${symbol}) 資訊卡\n\n`;
    
    // 價格資訊
    message += `💰 價格資訊\n`;
    message += `USD: $${priceUSD ? priceUSD.toLocaleString() : 'N/A'}\n`;
    message += `TWD: NT$${priceTWD ? priceTWD.toLocaleString() : 'N/A'}\n`;
    
    // 漲跌幅
    const changeEmoji = change24h >= 0 ? '📈' : '📉';
    const changeColor = change24h >= 0 ? '+' : '';
    message += `${changeEmoji} 24h 變化: ${changeColor}${change24h ? change24h.toFixed(2) : '0.00'}%\n\n`;
    
    // 基本資訊
    message += `📊 基本資訊\n`;
    message += `市值排名：#${marketCapRank}\n`;
    message += `市值：${this.formatMarketCap(marketCap)}\n`;
    message += `24h 交易量：${this.formatVolume(volume24h)}\n`;
    message += `上線年份：${this.formatGenesisDate(genesisDate)}\n\n`;
    
    // 簡介
    message += `📝 簡介\n${description}\n\n`;
    
    // 詳細資訊連結
    message += `📄 詳細資訊\n`;
    message += `https://coinmarketcap.com/currencies/${this.getCoinSlug(symbol)}/\n\n`;
    
    // 更新時間
    message += `⏰ 更新時間：${lastUpdated}`;

    return message;
  }

  /**
   * 格式化幣種資訊卡 (舊版本，保留向後兼容)
   * @param {Object} coinInfo - 幣種資訊
   * @returns {string} 格式化訊息
   */
  formatCoinInfo(coinInfo) {
    const { name, symbol, marketCapRank, marketCap, volume24h, genesisDate, description, lastUpdated } = coinInfo;

    let message = `📌 幣種資訊卡\n\n`;
    
    // 名稱和縮寫
    message += `名稱：${name} (${symbol})\n`;
    
    // 市值排名
    message += `市值排名：#${marketCapRank}\n`;
    
    // 市值
    message += `市值：${this.formatMarketCap(marketCap)}\n`;
    
    // 24h 交易量
    message += `24h 交易量：${this.formatVolume(volume24h)}\n`;
    
    // 上線年份
    message += `上線年份：${this.formatGenesisDate(genesisDate)}\n`;
    
    // 簡介
    message += `簡介：${description}\n\n`;
    
    // 更新時間
    message += `⏰ 更新時間：${lastUpdated}`;

    return message;
  }

  /**
   * 獲取幣種的 CoinMarketCap slug
   * @param {string} symbol - 幣種符號
   * @returns {string} slug
   */
  getCoinSlug(symbol) {
    const slugMap = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'USDT': 'tether',
      'BNB': 'binancecoin',
      'SOL': 'solana',
      'XRP': 'xrp',
      'USDC': 'usd-coin',
      'STETH': 'staked-ether',
      'ADA': 'cardano',
      'AVAX': 'avalanche-2',
      'TRX': 'tron',
      'WBTC': 'wrapped-bitcoin',
      'LINK': 'chainlink',
      'DOT': 'polkadot',
      'MATIC': 'matic-network',
      'DAI': 'dai',
      'SHIB': 'shiba-inu',
      'LTC': 'litecoin',
      'BCH': 'bitcoin-cash',
      'UNI': 'uniswap',
      'ATOM': 'cosmos',
      'ETC': 'ethereum-classic',
      'XLM': 'stellar',
      'NEAR': 'near',
      'ALGO': 'algorand',
      'VET': 'vechain',
      'FIL': 'filecoin',
      'ICP': 'internet-computer',
      'HBAR': 'hedera-hashgraph',
      'APT': 'aptos'
    };
    
    return slugMap[symbol.toUpperCase()] || symbol.toLowerCase();
  }

  /**
   * 備用幣種資訊
   * @param {string} coin - 加密貨幣代號
   * @returns {Object} 備用資訊
   */
  getFallbackInfo(coin) {
    const fallbackInfos = {
      'btc': {
        name: 'Bitcoin',
        symbol: 'BTC',
        marketCapRank: 1,
        marketCap: 2250000000000,
        volume24h: 50000000000,
        genesisDate: '2009-01-03',
        description: 'Bitcoin 是第一個也是最著名的加密貨幣，被稱為數位黃金。',
        lastUpdated: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
      },
      'eth': {
        name: 'Ethereum',
        symbol: 'ETH',
        marketCapRank: 2,
        marketCap: 400000000000,
        volume24h: 20000000000,
        genesisDate: '2015-07-30',
        description: 'Ethereum 是一個智能合約平台，支援去中心化應用程式開發。',
        lastUpdated: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
      },
      'sol': {
        name: 'Solana',
        symbol: 'SOL',
        marketCapRank: 5,
        marketCap: 20000000000,
        volume24h: 1200000000,
        genesisDate: '2020-03-16',
        description: 'Solana 是一個高效能公鏈，特色為低交易成本與高 TPS，常被用於 DeFi 與 NFT。',
        lastUpdated: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
      }
    };

    return fallbackInfos[coin.toLowerCase()] || {
      name: coin.toUpperCase(),
      symbol: coin.toUpperCase(),
      marketCapRank: 'N/A',
      marketCap: 0,
      volume24h: 0,
      genesisDate: null,
      description: '暫無詳細資訊',
      lastUpdated: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
    };
  }
}

module.exports = new InfoService();
