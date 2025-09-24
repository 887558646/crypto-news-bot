const axios = require('axios');
const config = require('../config');
const mappingService = require('./mappingService');

class PriceService {
  constructor() {
    this.baseUrl = config.coingecko.baseUrl;
    this.priceEndpoint = config.coingecko.priceEndpoint;
    this.chartEndpoint = config.coingecko.chartEndpoint;
  }

  /**
   * 獲取加密貨幣即時價格
   * @param {string} coin - 加密貨幣代號 (btc, eth, sol, bnb, sui)
   * @returns {Promise<Object>} 價格資訊
   */
  async getCoinPrice(coin) {
    try {
      // 移除支援幣種限制，支援所有 CoinGecko 上的加密貨幣

      // 映射到 CoinGecko 的實際 ID (市值前30大)
      const coinGeckoIds = {
        'btc': 'bitcoin',
        'eth': 'ethereum',
        'usdt': 'tether',
        'bnb': 'binancecoin',
        'sol': 'solana',
        'xrp': 'ripple',
        'usdc': 'usd-coin',
        'steth': 'staked-ether',
        'ada': 'cardano',
        'avax': 'avalanche-2',
        'trx': 'tron',
        'wbtc': 'wrapped-bitcoin',
        'link': 'chainlink',
        'dot': 'polkadot',
        'matic': 'matic-network',
        'dai': 'dai',
        'shib': 'shiba-inu',
        'doge': 'dogecoin',
        'op': 'optimism',
        'enj': 'enjin-coin',
        'mana': 'decentraland',
        'sand': 'the-sandbox',
        'axs': 'axie-infinity',
        'gala': 'gala',
        'chz': 'chiliz',
        'flow': 'flow',
        'theta': 'theta-token',
        'aave': 'aave',
        'ltc': 'litecoin',
        'bch': 'bitcoin-cash',
        'uni': 'uniswap',
        'atom': 'cosmos',
        'etc': 'ethereum-classic',
        'xlm': 'stellar',
        'near': 'near',
        'algo': 'algorand',
        'vet': 'vechain',
        'fil': 'filecoin',
        'icp': 'internet-computer',
        'hbar': 'hedera-hashgraph',
        'apt': 'aptos',
        // 更多熱門幣種映射
        'arb': 'arbitrum',
        'inj': 'injective-protocol',
        'sei': 'sei-network',
        'sui': 'sui',
        'rndr': 'render-token',
        'imx': 'immutable-x',
        'bat': 'basic-attention-token',
        'zec': 'zcash',
        'dash': 'dash',
        'xmr': 'monero',
        'eos': 'eos',
        'xtz': 'tezos',
        'qtum': 'qtum',
        'neo': 'neo',
        'ont': 'ontology',
        'zil': 'zilliqa',
        'waves': 'waves',
        'omg': 'omg',
        'knc': 'kyber-network-crystal',
        'ren': 'republic-protocol',
        'lrc': 'loopring',
        'zrx': '0x',
        'rep': 'augur',
        'gnt': 'golem',
        'sushi': 'sushi',
        'cake': 'pancakeswap-token',
        'bake': 'bakerytoken',
        'alpaca': 'alpaca-finance',
        'auto': 'auto',
        'bunny': 'pancakebunny',
        'ven': 'vechain',
        'hot': 'holo',
        'dent': 'dent',
        'win': 'wink',
        'btt': 'bittorrent',
        'usdd': 'usdd',
        'tusd': 'true-usd',
        'busd': 'binance-usd',
        'frax': 'frax',
        'lusd': 'liquity-usd',
        'gusd': 'gemini-dollar',
        'paxg': 'pax-gold',
        'tgold': 'tether-gold',
        'reth': 'rocket-pool-eth',
        'cbeth': 'coinbase-wrapped-staked-eth',
        'wsteth': 'wrapped-steth',
        'rpl': 'rocket-pool',
        'frxeth': 'frax-ether',
        'sfrxeth': 'staked-frax-ether',
        'ankr': 'ankr',
        'cvx': 'convex-finance',
        'bal': 'balancer',
        'dydx': 'dydx',
        'gmx': 'gmx',
        'gains': 'gains-network',
        'perp': 'perpetual-protocol',
        'mux': 'mux-protocol',
        'cap': 'cap',
        'lev': 'leverfi',
        'lyra': 'lyra-finance',
        'kwenta': 'kwenta',
        'cream': 'cream-2',
        'venus': 'venus',
        'pancake': 'pancakeswap-token',
        'bakery': 'bakerytoken',
        'compound': 'compound-governance-token',
        'yearn': 'yearn-finance',
        'maker': 'maker',
        'synthetix': 'havven',
        'balancer': 'balancer',
        'curve': 'curve-dao-token',
        'convex': 'convex-finance',
        'lido': 'lido-dao',
        'rocket': 'rocket-pool',
        // 更多幣種映射
        'ftm': 'fantom',
        'one': 'harmony',
        'celo': 'celo',
        'klay': 'klay-token',
        'iotx': 'iotex',
        'rune': 'thorchain',
        'kava': 'kava',
        'scrt': 'secret',
        'mina': 'mina-protocol',
        'rose': 'oasis-network',
        'grt': 'the-graph',
        'luna': 'terra-luna-2',
        'lunc': 'terra-luna',
        'ustc': 'terrausd-classic',
        'ust': 'terrausd',
        'luna2': 'terra-luna-2',
        'luna1': 'terra-luna',
        'ust2': 'terrausd',
        'ust1': 'terrausd-classic',
        'osmo': 'osmosis',
        'juno': 'juno-network',
        'evmos': 'evmos',
        'strd': 'stride',
        'tia': 'celestia',
        'sei': 'sei-network',
        'saga': 'saga',
        'w': 'wormhole',
        'pyth': 'pyth-network',
        'jup': 'jupiter-exchange-solana',
        'ray': 'raydium',
        'orca': 'orca',
        'srm': 'serum',
        'step': 'step-finance',
        'mango': 'mango-markets',
        'port': 'port-finance',
        'slnd': 'solend',
        'mnde': 'marinade',
        'lido': 'lido-staked-sol',
        'msol': 'marinade-staked-sol',
        'stsol': 'lido-staked-sol',
        'scnsol': 'socean-staked-sol',
        'cwsol': 'wrapped-staked-sol',
        'bsol': 'blazestake-staked-sol',
        'jsol': 'jito-staked-sol',
        'daosol': 'daopool',
        'lst': 'lido-staked-ether',
        'weth': 'weth',
        'ankreth': 'ankreth',
        'sweth': 'swell-ethereum',
        'oseth': 'origin-ether',
        'rseth': 'kelp-dao-restaked-eth',
        'ezeth': 'renzo-restaked-eth',
        'pufeth': 'puffer-finance',
        'ethx': 'stader-ethx',
        'manta': 'manta-network',
        'alt': 'altlayer',
        'pixel': 'pixels',
        'portal': 'portal',
        // 更多熱門幣種
        'pepe': 'pepe',
        'floki': 'floki',
        'bonk': 'bonk',
        'wif': 'dogwifcoin',
        'bome': 'book-of-meme',
        'meme': 'memecoin',
        'akita': 'akita-inu',
        'kishu': 'kishu-inu',
        'elon': 'dogelon-mars',
        'baby': 'baby-doge-coin',
        'safemoon': 'safemoon',
        // 更多 DeFi 代幣
        'crv': 'curve-dao-token',
        'comp': 'compound-governance-token',
        'mkr': 'maker',
        'snx': 'havven',
        'yfi': 'yearn-finance',
        '1inch': '1inch',
        'bat': 'basic-attention-token',
        'zec': 'zcash',
        'dash': 'dash',
        'xmr': 'monero',
        'eos': 'eos',
        'xtz': 'tezos',
        'qtum': 'qtum',
        'neo': 'neo',
        'ont': 'ontology',
        'zil': 'zilliqa',
        'waves': 'waves',
        'omg': 'omg',
        'knc': 'kyber-network-crystal',
        'ren': 'republic-protocol',
        'lrc': 'loopring',
        'zrx': '0x',
        'rep': 'augur',
        'gnt': 'golem',
        'sushi': 'sushi',
        'cake': 'pancakeswap-token',
        'bake': 'bakerytoken',
        'alpaca': 'alpaca-finance',
        'auto': 'auto',
        'bunny': 'pancakebunny',
        'ven': 'vechain',
        'hot': 'holo',
        'dent': 'dent',
        'win': 'wink',
        'btt': 'bittorrent',
        'usdd': 'usdd',
        'tusd': 'true-usd',
        'busd': 'binance-usd',
        'frax': 'frax',
        'lusd': 'liquity-usd',
        'gusd': 'gemini-dollar',
        'paxg': 'pax-gold',
        'tgold': 'tether-gold',
        'reth': 'rocket-pool-eth',
        'cbeth': 'coinbase-wrapped-staked-eth',
        'wsteth': 'wrapped-steth',
        'rpl': 'rocket-pool',
        'frxeth': 'frax-ether',
        'sfrxeth': 'staked-frax-ether',
        'ankr': 'ankr',
        'cvx': 'convex-finance',
        'bal': 'balancer',
        'dydx': 'dydx',
        'gmx': 'gmx',
        'gains': 'gains-network',
        'perp': 'perpetual-protocol',
        'mux': 'mux-protocol',
        'cap': 'cap',
        'lev': 'leverfi',
        'lyra': 'lyra-finance',
        'kwenta': 'kwenta',
        'cream': 'cream-2',
        'venus': 'venus',
        'pancake': 'pancakeswap-token',
        'bakery': 'bakerytoken',
        'compound': 'compound-governance-token',
        'yearn': 'yearn-finance',
        'maker': 'maker',
        'synthetix': 'havven',
        'balancer': 'balancer',
        'curve': 'curve-dao-token',
        'convex': 'convex-finance',
        'lido': 'lido-dao',
        'rocket': 'rocket-pool'
      };

      // 先嘗試使用硬編碼映射
      let coinGeckoId = coinGeckoIds[coin.toLowerCase()];
      
      if (!coinGeckoId) {
        // 如果沒有硬編碼映射，嘗試動態映射
        console.log(`🔍 幣種 ${coin} 未在映射表中，嘗試動態映射...`);
        coinGeckoId = await mappingService.findCoinId(coin);
        
        if (!coinGeckoId) {
          // 如果動態映射也失敗，使用幣種代號作為最後嘗試
          coinGeckoId = coin.toLowerCase();
          console.log(`⚠️ 動態映射失敗，使用原始代號: ${coinGeckoId}`);
        }
      }

      const response = await axios.get(`${this.baseUrl}${this.priceEndpoint}`, {
        params: {
          ids: coinGeckoId,
          vs_currencies: 'usd,twd',
          include_24hr_change: true,
          include_24hr_vol: true,
          include_market_cap: true,
          x_cg_demo_api_key: config.coingecko.apiKey
        }
      });

      if (response.data[coinGeckoId]) {
        return this.formatPriceData(coin.toUpperCase(), response.data[coinGeckoId]);
      } else {
        throw new Error('無法獲取價格資料');
      }
    } catch (error) {
      console.error('獲取價格失敗:', error.message);
      throw new Error(`獲取 ${coin.toUpperCase()} 價格失敗: ${error.message}`);
    }
  }

  /**
   * 獲取多個加密貨幣價格
   * @param {Array} coins - 加密貨幣代號陣列
   * @returns {Promise<Array>} 價格資訊陣列
   */
  async getMultipleCoinPrices(coins) {
    try {
      // 移除支援幣種限制，支援所有 CoinGecko 上的加密貨幣
      const coinIds = coins.join(',');
      
      const response = await axios.get(`${this.baseUrl}${this.priceEndpoint}`, {
        params: {
          ids: coinIds,
          vs_currencies: 'usd,twd',
          include_24hr_change: true,
          include_24hr_vol: true,
          include_market_cap: true,
          x_cg_demo_api_key: config.coingecko.apiKey
        }
      });

      return Object.keys(response.data).map(coinId => {
        return this.formatPriceData(coinId.toUpperCase(), response.data[coinId]);
      });
    } catch (error) {
      console.error('獲取多個價格失敗:', error.message);
      throw new Error(`獲取多個幣種價格失敗: ${error.message}`);
    }
  }

  /**
   * 格式化價格資料
   * @param {string} symbol - 加密貨幣符號
   * @param {Object} data - 原始價格資料
   * @returns {Object} 格式化後的價格資料
   */
  formatPriceData(symbol, data) {
    return {
      symbol,
      price: {
        usd: data.usd,
        twd: data.twd
      },
      change24h: data.usd_24h_change,
      volume24h: data.usd_24h_vol,
      marketCap: data.usd_market_cap,
      lastUpdated: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
    };
  }

  /**
   * 格式化價格訊息
   * @param {Object} priceData - 價格資料
   * @returns {string} 格式化後的價格訊息
   */
  formatPrice(priceData) {
    if (!priceData) {
      return '無法獲取價格資訊';
    }

    const { symbol, price, change24h } = priceData;
    const changeEmoji = change24h >= 0 ? '📈' : '📉';
    const changeText = change24h >= 0 ? `+${change24h.toFixed(2)}%` : `${change24h.toFixed(2)}%`;

    return `${symbol} 即時價格\n\n💵 USD: $${price.usd.toString()}\n💱 TWD: NT$${price.twd.toString()}\n\n${changeEmoji} 24h 變化: ${changeText}`;
  }

  /**
   * 備用價格資料（當 API 失敗時使用）
   * @param {string} coin - 加密貨幣代號
   * @returns {Object} 備用價格資料
   */
  getFallbackPrice(coin) {
    const fallbackPrices = {
      'BTC': { usd: 45000, twd: 1350000, change: 2.5 },
      'ETH': { usd: 3000, twd: 90000, change: 1.8 },
      'SOL': { usd: 100, twd: 3000, change: 3.2 },
      'BNB': { usd: 300, twd: 9000, change: 1.5 },
      'SUI': { usd: 1.5, twd: 45, change: 4.1 }
    };

    const price = fallbackPrices[coin.toUpperCase()] || { usd: 0, twd: 0, change: 0 };

    return {
      symbol: coin.toUpperCase(),
      price: {
        usd: price.usd,
        twd: price.twd
      },
      change24h: price.change,
      volume24h: 0,
      marketCap: 0,
      lastUpdated: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
      isFallback: true
    };
  }

  /**
   * 獲取價格歷史資料（用於圖表）
   * @param {string} coin - 加密貨幣代號
   * @param {number} days - 天數
   * @returns {Promise<Array>} 歷史價格資料
   */
  async getPriceHistory(coin, days = 7) {
    try {
      // 移除支援幣種限制，支援所有 CoinGecko 上的加密貨幣

      const response = await axios.get(`${this.baseUrl}${this.chartEndpoint}/${coin.toLowerCase()}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: days
        }
      });

      return response.data.prices.map(([timestamp, price]) => ({
        timestamp: new Date(timestamp),
        price: price
      }));
    } catch (error) {
      console.error('獲取價格歷史失敗:', error.message);
      return [];
    }
  }

  /**
   * 獲取 OHLCV 數據（用於技術分析）
   * @param {string} coin - 加密貨幣代號
   * @param {number} days - 天數
   * @returns {Promise<Array>} OHLCV 數據
   */
  async getOHLCVData(coin, days = 30) {
    try {
      // 移除支援幣種限制，支援所有 CoinGecko 上的加密貨幣

      const coinGeckoIds = {
        'btc': 'bitcoin', 'eth': 'ethereum', 'usdt': 'tether', 'bnb': 'binancecoin', 'sol': 'solana',
        'xrp': 'ripple', 'usdc': 'usd-coin', 'steth': 'staked-ether', 'ada': 'cardano', 'avax': 'avalanche-2',
        'trx': 'tron', 'wbtc': 'wrapped-bitcoin', 'link': 'chainlink', 'dot': 'polkadot', 'matic': 'matic-network',
        'dai': 'dai', 'shib': 'shiba-inu', 'ltc': 'litecoin', 'bch': 'bitcoin-cash', 'uni': 'uniswap',
        'atom': 'cosmos', 'etc': 'ethereum-classic', 'xlm': 'stellar', 'near': 'near', 'algo': 'algorand',
        'vet': 'vechain', 'fil': 'filecoin', 'icp': 'internet-computer', 'hbar': 'hedera-hashgraph', 'apt': 'aptos'
      };
      
      // 先嘗試使用硬編碼映射，如果沒有就使用幣種代號
      let coinGeckoId = coinGeckoIds[coin.toLowerCase()];
      if (!coinGeckoId) {
        coinGeckoId = coin.toLowerCase();
      }

      const response = await axios.get(`${this.baseUrl}${this.chartEndpoint}/${coinGeckoId}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: days,
          x_cg_demo_api_key: config.coingecko.apiKey
        }
      });

      const prices = response.data.prices;
      const volumes = response.data.total_volumes;

      // 轉換為 OHLCV 格式
      const ohlcvData = [];
      for (let i = 0; i < prices.length; i++) {
        const price = prices[i][1];
        const volume = volumes[i][1];
        
        // 由於 CoinGecko 只提供收盤價，我們用收盤價作為 OHLC
        ohlcvData.push({
          timestamp: new Date(prices[i][0]),
          open: price,
          high: price * (1 + Math.random() * 0.02), // 模擬高價
          low: price * (1 - Math.random() * 0.02),  // 模擬低價
          close: price,
          volume: volume
        });
      }

      return ohlcvData;
    } catch (error) {
      console.error('獲取 OHLCV 數據失敗:', error.message);
      return [];
    }
  }
}

module.exports = new PriceService();
