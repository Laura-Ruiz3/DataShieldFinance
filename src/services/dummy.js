export const DUMMY_ASSETS = [
  // Stocks
  { asset_id: 1, symbol: 'AAPL', name: 'Apple Inc.', asset_type: 'stock', currency: 'USD', sector: 'Technology', price: 192.33, change: +0.84 },
  { asset_id: 2, symbol: 'MSFT', name: 'Microsoft Corp.', asset_type: 'stock', currency: 'USD', sector: 'Technology', price: 414.12, change: -1.12 },
  { asset_id: 3, symbol: 'TSLA', name: 'Tesla Inc.', asset_type: 'stock', currency: 'USD', sector: 'Automotive', price: 202.70, change: -0.90 },
  { asset_id: 4, symbol: 'AMZN', name: 'Amazon.com Inc.', asset_type: 'stock', currency: 'USD', sector: 'Consumer Discretionary', price: 182.02, change: +2.10 },
  { asset_id: 5, symbol: 'GOOGL', name: 'Alphabet Inc. (Class A)', asset_type: 'stock', currency: 'USD', sector: 'Technology', price: 167.80, change: +0.35 },
  
  // Bonds
  { asset_id: 6, symbol: 'US10Y', name: 'US Treasury 10Y Bond', asset_type: 'bond', currency: 'USD', sector: 'Government', price: 98.75, change: -0.15 },
  { asset_id: 7, symbol: 'MX10Y', name: 'Mexican Government Bond 10Y', asset_type: 'bond', currency: 'MXN', sector: 'Government', price: 92.18, change: +0.22 },
  
  // Cash
  { asset_id: 8, symbol: 'USD-CASH', name: 'US Dollars Cash', asset_type: 'cash', currency: 'USD', sector: 'Cash', price: 1.00, change: 0.00 },
  { asset_id: 9, symbol: 'MXN-CASH', name: 'Mexican Peso Cash', asset_type: 'cash', currency: 'MXN', sector: 'Cash', price: 1.00, change: 0.00 },
  
  // Crypto
  { asset_id: 10, symbol: 'BTC', name: 'Bitcoin', asset_type: 'crypto', currency: 'USD', sector: 'Cryptocurrency', price: 62345.67, change: +1.25 },
  { asset_id: 11, symbol: 'ETH', name: 'Ethereum', asset_type: 'crypto', currency: 'USD', sector: 'Cryptocurrency', price: 3218.43, change: -0.78 },
  
  // Funds
  { asset_id: 12, symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', asset_type: 'fund', currency: 'USD', sector: 'ETF', price: 518.64, change: +0.45 },
  { asset_id: 13, symbol: 'QQQ', name: 'Invesco QQQ Trust', asset_type: 'fund', currency: 'USD', sector: 'ETF', price: 443.18, change: +0.32 },
];

export const DUMMY = {
  portfolios: [
    { id: 1, name: 'My Portfolio' },
    { id: 2, name: '60/40 Growth' },
  ],
  holdingsByPortfolio: {
    1: [
      { id: 1, asset_id: 1, quantity: 10, avg_price: 190 },
      { id: 2, asset_id: 6, quantity: 5000, avg_price: 1 },
      { id: 3, asset_id: 9, quantity: 15000, avg_price: null },
    ],
    2: [
      { id: 4, asset_id: 2, quantity: 6, avg_price: 410 },
      { id: 5, asset_id: 7, quantity: 12, avg_price: 95 },
      { id: 6, asset_id: 8, quantity: 800, avg_price: null },
    ],
  },
}

export const DUMMY_MARKET = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 192.33, change: +0.84 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 414.12, change: -1.12 },
  { symbol: 'GOOGL', name: 'Alphabet Inc. (Class A)', price: 167.8, change: +0.35 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 182.02, change: +2.1 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 202.7, change: -0.9 },
]

export const DUMMY_NEWS_MX = [
  { title: 'Banxico mantiene tasa; mercado espera guía para 2025', url: '#', source: 'Economía MX', published_at: '2025-08-01T14:30:00Z' },
  { title: 'BMV cierra con ganancias; impulso en industriales', url: '#', source: 'Mercados Hoy', published_at: '2025-08-02T10:05:00Z' },
  { title: 'Peso se fortalece frente al dólar previo a datos de inflación', url: '#', source: 'Finanzas MX', published_at: '2025-08-03T09:00:00Z' },
]