INSERT IGNORE INTO assets (symbol, name, asset_type, currency, sector, price) VALUES
-- 📈 Stocks
('AAPL', 'Apple Inc.', 'stock', 'USD', 'Technology', 192.33),
('MSFT', 'Microsoft Corp.', 'stock', 'USD', 'Technology', 414.12),
('TSLA', 'Tesla Inc.', 'stock', 'USD', 'Automotive', 202.70),
('AMZN', 'Amazon.com Inc.', 'stock', 'USD', 'Consumer Discretionary', 182.02),
('GOOGL', 'Alphabet Inc. (Class A)', 'stock', 'USD', 'Technology', 167.80),
('NFLX', 'Netflix Inc.', 'stock', 'USD', 'Entertainment', 645.21),
('NVDA', 'NVIDIA Corp.', 'stock', 'USD', 'Semiconductors', 476.35),
('BABA', 'Alibaba Group Holding Ltd.', 'stock', 'USD', 'E-Commerce', 86.42),
('JPM', 'JPMorgan Chase & Co.', 'stock', 'USD', 'Financials', 195.18),
('KO', 'Coca-Cola Company', 'stock', 'USD', 'Consumer Staples', 68.53),
('WMT', 'Walmart Inc.', 'stock', 'USD', 'Retail', 77.28),
('DIS', 'The Walt Disney Company', 'stock', 'USD', 'Entertainment', 105.64),

-- 🏦 Bonds
('US10Y', 'US Treasury 10Y Bond', 'bond', 'USD', 'Government', 98.75),
('US30Y', 'US Treasury 30Y Bond', 'bond', 'USD', 'Government', 95.43),
('MX10Y', 'Mexican Government Bond 10Y', 'bond', 'MXN', 'Government', 92.18),
('EU5Y', 'European Union 5Y Bond', 'bond', 'EUR', 'Government', 99.35),
('CORP-AA', 'Corporate Bond AA Rated', 'bond', 'USD', 'Corporate', 101.25),

-- 💰 Cash
('USD-CASH', 'US Dollars Cash', 'cash', 'USD', 'Cash', 1.00),
('MXN-CASH', 'Mexican Peso Cash', 'cash', 'MXN', 'Cash', 1.00),
('EUR-CASH', 'Euro Cash', 'cash', 'EUR', 'Cash', 1.00),

-- ₿ Crypto
('BTC', 'Bitcoin', 'crypto', 'USD', 'Cryptocurrency', 62345.67),
('ETH', 'Ethereum', 'crypto', 'USD', 'Cryptocurrency', 3218.43),
('USDT', 'Tether USD', 'crypto', 'USD', 'Stablecoin', 1.00),
('BNB', 'Binance Coin', 'crypto', 'USD', 'Cryptocurrency', 593.21),
('XRP', 'Ripple', 'crypto', 'USD', 'Cryptocurrency', 0.63),
('SOL', 'Solana', 'crypto', 'USD', 'Cryptocurrency', 146.88),
('DOGE', 'Dogecoin', 'crypto', 'USD', 'Meme Coin', 0.12),
('ADA', 'Cardano', 'crypto', 'USD', 'Cryptocurrency', 0.46),

-- 📊 Funds / ETFs
('VFIAX', 'Vanguard 500 Index Fund Admiral Shares', 'fund', 'USD', 'Index Fund', 438.25),
('QQQ', 'Invesco QQQ Trust', 'fund', 'USD', 'ETF', 443.18),
('SPY', 'SPDR S&P 500 ETF Trust', 'fund', 'USD', 'ETF', 518.64),
('ARKK', 'ARK Innovation ETF', 'fund', 'USD', 'ETF', 52.37),
('EFA', 'iShares MSCI EAFE ETF', 'fund', 'USD', 'International Equity', 78.92),
('VNQ', 'Vanguard Real Estate ETF', 'fund', 'USD', 'Real Estate', 85.76);