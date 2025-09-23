const axios = require('axios');
const config = require('../config');
const priceService = require('./priceService');

class ChartService {
  constructor() {
    this.baseUrl = config.quickchart.baseUrl;
  }

  /**
   * 生成加密貨幣價格走勢圖
   * @param {string} coin - 加密貨幣代號
   * @param {number} days - 天數
   * @returns {Promise<string>} 圖表 URL
   */
  async generatePriceChart(coin, days = 7) {
    try {
      // 獲取價格歷史資料
      const priceHistory = await priceService.getPriceHistory(coin, days);
      
      if (priceHistory.length === 0) {
        throw new Error('無法獲取價格歷史資料');
      }

      // 準備圖表資料
      const chartData = this.prepareChartData(priceHistory, coin);
      
      // 生成圖表 URL
      const chartUrl = await this.createChartUrl(chartData);
      
      return chartUrl;
    } catch (error) {
      console.error('生成圖表失敗:', error.message);
      return this.getFallbackChartUrl(coin);
    }
  }

  /**
   * 準備圖表資料
   * @param {Array} priceHistory - 價格歷史資料
   * @param {string} coin - 加密貨幣代號
   * @returns {Object} 圖表資料
   */
  prepareChartData(priceHistory, coin) {
    const labels = priceHistory.map(item => 
      item.timestamp.toLocaleDateString('zh-TW', { 
        month: 'short', 
        day: 'numeric' 
      })
    );
    
    const prices = priceHistory.map(item => item.price);
    
    // 計算顏色（根據漲跌）
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const isPositive = lastPrice >= firstPrice;
    const color = isPositive ? '#00C851' : '#FF4444';

    return {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: `${coin.toUpperCase()} 價格 (USD)`,
          data: prices,
          borderColor: color,
          backgroundColor: `${color}20`,
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `${coin.toUpperCase()} 過去 ${priceHistory.length} 天價格走勢`,
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: {
              color: '#E0E0E0'
            },
            ticks: {
              callback: function(value) {
                return '$' + value.toFixed(2);
              }
            }
          },
          x: {
            grid: {
              color: '#E0E0E0'
            }
          }
        }
      }
    };
  }

  /**
   * 建立圖表 URL
   * @param {Object} chartData - 圖表資料
   * @returns {string} 圖表 URL
   */
  async createChartUrl(chartData) {
    try {
      // 使用 GET 方式建立圖表 URL（更穩定）
      const encodedData = encodeURIComponent(JSON.stringify(chartData));
      return `${this.baseUrl}/chart?c=${encodedData}&w=800&h=400&bkg=white&f=png`;
    } catch (error) {
      console.error('建立圖表 URL 失敗:', error.message);
      return null;
    }
  }

  /**
   * 備用圖表 URL（當 API 失敗時使用）
   * @param {string} coin - 加密貨幣代號
   * @returns {string} 備用圖表 URL
   */
  getFallbackChartUrl(coin) {
    // 使用 QuickChart 的簡單圖表作為備用
    const fallbackData = {
      type: 'line',
      data: {
        labels: ['7天前', '6天前', '5天前', '4天前', '3天前', '2天前', '昨天', '今天'],
        datasets: [{
          label: `${coin.toUpperCase()} 價格`,
          data: [100, 102, 98, 105, 103, 107, 110, 108],
          borderColor: '#00C851',
          backgroundColor: '#00C85120',
          borderWidth: 2,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `${coin.toUpperCase()} 價格走勢 (範例資料)`,
            font: { size: 16, weight: 'bold' }
          }
        }
      }
    };

    const encodedData = encodeURIComponent(JSON.stringify(fallbackData));
    return `${this.baseUrl}/chart?c=${encodedData}&w=800&h=400&bkg=white&f=png`;
  }

  /**
   * 生成多幣種比較圖表
   * @param {Array} coins - 加密貨幣代號陣列
   * @param {number} days - 天數
   * @returns {Promise<string>} 圖表 URL
   */
  async generateComparisonChart(coins, days = 7) {
    try {
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
      const datasets = [];

      for (let i = 0; i < coins.length; i++) {
        const coin = coins[i];
        const priceHistory = await priceService.getPriceHistory(coin, days);
        
        if (priceHistory.length > 0) {
          const prices = priceHistory.map(item => item.price);
          const labels = priceHistory.map(item => 
            item.timestamp.toLocaleDateString('zh-TW', { 
              month: 'short', 
              day: 'numeric' 
            })
          );

          datasets.push({
            label: `${coin.toUpperCase()}`,
            data: prices,
            borderColor: colors[i % colors.length],
            backgroundColor: `${colors[i % colors.length]}20`,
            borderWidth: 2,
            fill: false,
            tension: 0.4
          });
        }
      }

      const chartData = {
        type: 'line',
        data: {
          labels: datasets[0] ? datasets[0].data.map((_, index) => 
            new Date(Date.now() - (datasets[0].data.length - 1 - index) * 24 * 60 * 60 * 1000)
              .toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })
          ) : [],
          datasets: datasets
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: `加密貨幣價格比較 (過去 ${days} 天)`,
              font: { size: 16, weight: 'bold' }
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              grid: { color: '#E0E0E0' },
              ticks: {
                callback: function(value) {
                  return '$' + value.toFixed(2);
                }
              }
            },
            x: {
              grid: { color: '#E0E0E0' }
            }
          }
        }
      };

      return await this.createChartUrl(chartData);
    } catch (error) {
      console.error('生成比較圖表失敗:', error.message);
      return this.getFallbackChartUrl('BTC');
    }
  }
}

module.exports = new ChartService();
