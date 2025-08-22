/**
 * Performance Calculation Service
 * 
 * Provides functionality to calculate asset and portfolio performance metrics
 * including PnL (Profit and Loss), market value, and OHLCV data.
 * 
 * @module services/performance
 */

const pool = require("../db");
const axios = require("axios");

/**
 * Check if a value is a finite number
 * @param {any} v - Value to check
 * @returns {boolean} True if value is a finite number
 * @private
 */
const isFiniteNum = (v) => typeof v === "number" && Number.isFinite(v);

/**
 * Convert a value to a number or null if not valid
 * @param {any} v - Value to convert
 * @returns {number|null} Number or null
 * @private
 */
const toNumOrNull = (v) => (isFiniteNum(v) ? Number(v) : null);

/**
 * Convert a value to a number or zero if not valid
 * @param {any} v - Value to convert
 * @returns {number} Number or zero
 * @private
 */
const toNumOrZero = (v) => (isFiniteNum(v) ? Number(v) : 0);

/**
 * Convert a timestamp to ISO date format (YYYY-MM-DD)
 * @param {string|number} ts - Timestamp (string format 'YYYY-MM-DD HH:mm:ss' or epoch ms/s)
 * @returns {string|null} ISO date or null if invalid
 * @private
 */
const toISODate = (ts) => {
  // Handle format 'YYYY-MM-DD HH:mm:ss'
  if (typeof ts === "string") return ts.split(" ")[0];
  
  // Handle epoch milliseconds/seconds
  try {
    const d = new Date(Number(ts));
    if (!isNaN(d)) return d.toISOString().split("T")[0];
  } catch (_) {}
  
  return null;
};

/**
 * Calculate performance metrics for a specific asset in a portfolio
 * 
 * @param {number} portfolioId - Portfolio ID
 * @param {number} assetId - Asset ID
 * @returns {Promise<Object>} Asset performance data including history or error
 */
async function getAssetPerformance(portfolioId, assetId) {
  // 1. Get asset and transaction data
  const [[asset]] = await pool.query(
    "SELECT * FROM assets WHERE asset_id = ?",
    [assetId]
  );
  const [transactions] = await pool.query(
    "SELECT * FROM transactions WHERE portfolio_id = ? AND asset_id = ? ORDER BY date ASC",
    [portfolioId, assetId]
  );

  if (!asset || transactions.length === 0) {
    return { error: "No transactions found for asset" };
  }

  // 2. Get price data from API
  let priceData;
  try {
    const resp = await axios.get(
      `https://c4rm9elh30.execute-api.us-east-1.amazonaws.com/default/cachedPriceData?ticker=${asset.symbol}`
    );
    const data = resp.data || {};
    if (!data.price_data || typeof data.price_data !== "object") {
      return { error: `Price data missing for ${asset.symbol}` };
    }
    priceData = data.price_data;
  } catch (e) {
    return { error: `Price API error for ${asset?.symbol || assetId}: ${e.message}` };
  }

  // 3. Validate OHLCV arrays
  const { low, open, high, close, volume, timestamp } = priceData;
  const arraysOk =
    Array.isArray(timestamp) &&
    Array.isArray(open) &&
    Array.isArray(high) &&
    Array.isArray(low) &&
    Array.isArray(close) &&
    Array.isArray(volume);

  if (!arraysOk) {
    return { error: `Malformed OHLCV arrays for ${asset.symbol}` };
  }

  // Use the minimum length in case arrays are mismatched
  const len = Math.min(
    timestamp.length,
    open.length,
    high.length,
    low.length,
    close.length,
    volume.length
  );
  
  if (len === 0) {
    return { error: `Empty price series for ${asset.symbol}` };
  }

  // 4. Calculate PnL (Profit and Loss) for each bar
  let position = 0;    // Current position size
  let cashFlow = 0;    // Net cash flow from transactions

  const history = [];
  for (let i = 0; i < len; i++) {
    const ts = timestamp[i];
    const date = toISODate(ts);
    if (!date) continue; // Skip invalid timestamps
    
    // Apply same-day transactions to position and cash flow
    // Note: If transactions are in local timezone, adjust comparison here
    for (const tx of transactions) {
      const txDate = tx.date.toISOString().split("T")[0];
      if (txDate === date) {
        const qty = Number(tx.quantity);
        const px = Number(tx.price);
        if (tx.type === "buy") {
          position += qty;
          cashFlow -= qty * px;
        } else if (tx.type === "sell") {
          position -= qty;
          cashFlow += qty * px;
        }
      }
    }

    // Get normalized OHLCV values
    const o = toNumOrNull(open[i]);
    const h = toNumOrNull(high[i]);
    const l = toNumOrNull(low[i]);
    const c = toNumOrNull(close[i]);
    const v = toNumOrZero(volume[i]);

    // Calculate market value and PnL
    let marketValue = 0;
    let pnl = cashFlow;

    if (c !== null) {
      marketValue = position * c;
      pnl = marketValue + cashFlow;
    }

    history.push({
      date,
      ohlcv: { open: o, high: h, low: l, close: c, volume: v },
      pnl,
      marketValue,
      position,
    });
  }

  if (history.length === 0) {
    return { error: `No usable bars for ${asset.symbol}` };
  }

  return {
    ticker: asset.symbol,
    history,
  };
}

/**
 * Calculate performance metrics for an entire portfolio
 * 
 * Aggregates performance across all assets in the portfolio
 * 
 * @param {number} portfolioId - Portfolio ID
 * @returns {Promise<Object>} Portfolio performance data including history
 */
async function getPortfolioPerformance(portfolioId) {
  // Get all assets in the portfolio that have transactions
  const [assets] = await pool.query(
    `SELECT DISTINCT a.asset_id, a.symbol
     FROM transactions t
     JOIN assets a ON t.asset_id = a.asset_id
     WHERE t.portfolio_id = ?`,
    [portfolioId]
  );

  // Group performance data by date
  const perDay = Object.create(null);

  // Process each asset's performance data
  for (const asset of assets) {
    const result = await getAssetPerformance(portfolioId, asset.asset_id);
    if (!result || result.error || !Array.isArray(result.history)) continue;

    // Aggregate asset data into the portfolio data by date
    for (const h of result.history) {
      if (!perDay[h.date]) {
        // Initialize daily data if this is the first asset for this date
        perDay[h.date] = {
          open: null,
          high: -Infinity,
          low: Infinity,
          close: null,
          volume: 0,
          pnl: 0,
          marketValue: 0,
        };
      }
      const acc = perDay[h.date];

      // Use first valid open price for the day
      if (acc.open === null && isFiniteNum(h.ohlcv.open)) {
        acc.open = h.ohlcv.open;
      }
      
      // Use max/min for high/low values
      if (isFiniteNum(h.ohlcv.high)) acc.high = Math.max(acc.high, h.ohlcv.high);
      if (isFiniteNum(h.ohlcv.low)) acc.low = Math.min(acc.low, h.ohlcv.low);

      // Use last valid close price
      if (isFiniteNum(h.ohlcv.close)) acc.close = h.ohlcv.close;

      // Sum volumes
      if (isFiniteNum(h.ohlcv.volume)) acc.volume += h.ohlcv.volume;

      // Sum PnL and market values
      if (isFiniteNum(h.pnl)) acc.pnl += h.pnl;
      if (isFiniteNum(h.marketValue)) acc.marketValue += h.marketValue;
    }
  }

  // Convert object to array and normalize data
  const history = Object.entries(perDay)
    .map(([date, v]) => ({
      date,
      ohlcv: {
        open: v.open,
        // Reset extreme values to null if no valid data was found
        high: v.high === -Infinity ? null : v.high,
        low: v.low === Infinity ? null : v.low,
        close: v.close,
        volume: v.volume,
      },
      pnl: v.pnl,
      marketValue: v.marketValue,
    }))
    // Sort by date chronologically
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return { portfolioId, history };
}

/**
 * @exports Performance calculation methods
 */
module.exports = { 
  getAssetPerformance, 
  getPortfolioPerformance 
};
