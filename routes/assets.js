/**
 * Express router for asset-related endpoints
 * @module routes/assets
 */

const express = require("express");
const router = express.Router();
const pool = require("../db");
const { getAssetPerformance } = require("../services/performance");

/**
 * @route GET /api/assets/noticias
 * @description Get general market news
 * @access Public
 */
router.get("/noticias", async (req, res, next) => {
  console.log("Noel's news API tests");
  try {
    const news = await financialDataClient.marketNews("general");
    res.json(news);
  } catch (err) { next(err); }
});

/**
 * @route GET /api/assets/types
 * @description Get all supported asset types
 * @returns {string[]} Array of supported asset types
 * @access Public
 */
router.get("/types", async (_req, res) => {
  res.json(["stock", "bond", "crypto", "fund", "cash"]);
});

/**
 * @route GET /api/assets
 * @description Get assets with optional filtering by type and search query
 * @param {string} [type] - Filter assets by type (stock, bond, crypto, fund, cash)
 * @param {string} [q] - Search query for symbol or name
 * @returns {Array} List of assets matching the criteria
 * @access Public
 */
router.get("/", async (req, res, next) => {
  try {
    const { type, q } = req.query;
    const params = [];
    let where = "WHERE 1=1";
    if (type) {
      where += " AND asset_type = ?";
      params.push(type);
    }
    if (q) {
      where += " AND (symbol LIKE ? OR name LIKE ?)";
      params.push(`%${q}%`, `%${q}%`);
    }

    const [rows] = await pool.query(
      `
      SELECT asset_id, symbol, name, asset_type, currency, sector, price, last_updated, created_at
      FROM assets
      ${where}
      ORDER BY symbol ASC
      LIMIT 500
      `,
      params
    );
    res.json(rows);
  } catch (err) { next(err); }
});

/**
 * @route POST /api/assets
 * @description Create a new asset
 * @param {Object} req.body - Asset details
 * @param {string} req.body.symbol - Asset symbol/ticker (required)
 * @param {string} [req.body.name] - Asset name (defaults to symbol if not provided)
 * @param {string} req.body.asset_type - Type of asset (stock, bond, crypto, fund, cash) (required)
 * @param {string} req.body.currency - Currency code (required)
 * @param {string} [req.body.sector] - Sector/industry of the asset
 * @returns {Object} Created asset with its ID
 * @access Public
 */
router.post("/", async (req, res, next) => {
  try {
    let { symbol, name, asset_type, currency, sector } = req.body || {};
    if (!symbol || !asset_type || !currency) {
      return res.status(400).json({ error: "symbol, asset_type y currency son obligatorios" });
    }
    symbol = String(symbol).trim().toUpperCase();
    currency = String(currency).trim().toUpperCase();
    if (!name) name = symbol;

    const VALID = new Set(["stock", "bond", "crypto", "fund", "cash"]);
    if (!VALID.has(asset_type)) {
      return res.status(400).json({ error: "asset_type inválido" });
    }

    const [result] = await pool.query(
      `INSERT INTO assets (symbol, name, asset_type, currency, sector)
       VALUES (?, ?, ?, ?, ?)`,
      [symbol, name, asset_type, currency, sector || null]
    );

    res.status(201).json({
      asset_id: result.insertId,
      symbol, name, asset_type, currency, sector: sector || null
    });
  } catch (err) {
    if (err && err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "El asset ya existe (symbol/currency)" });
    }
    next(err);
  }
});

/**
 * @route GET /api/assets/:portfolioId
 * @description Get all assets in a specific portfolio
 * @param {string} portfolioId - Portfolio ID
 * @returns {Array} Assets in the portfolio
 * @access Public
 */
router.get("/:portfolioId", async (req, res) => {
  console.log("Fetching assets for portfolio:", req.params.portfolioId);
  const [rows] = await pool.query(
    `SELECT DISTINCT a.* 
     FROM transactions t
     JOIN assets a ON t.asset_id = a.asset_id
     WHERE t.portfolio_id = ?`,
    [req.params.portfolioId]
  );
  res.json(rows);
});

/**
 * @route POST /api/assets/add
 * @description Add an asset to portfolio (creates a buy transaction)
 * @param {Object} req.body - Transaction details
 * @param {number} req.body.portfolio_id - Portfolio ID
 * @param {number} req.body.asset_id - Asset ID
 * @param {number} req.body.quantity - Quantity to buy
 * @param {number} req.body.price - Price per unit
 * @returns {Object} Confirmation message
 * @access Public
 */
router.post("/add", async (req, res) => {
  const { portfolio_id, asset_id, quantity, price } = req.body;
  await pool.query(
    `INSERT INTO transactions 
     (portfolio_id, asset_id, date, type, quantity, price) 
     VALUES (?, ?, CURDATE(), 'buy', ?, ?)`,
    [portfolio_id, asset_id, quantity, price]
  );
  res.json({ message: "Asset added to portfolio" });
});

/**
 * @route POST /api/assets/remove
 * @description Remove an asset from portfolio (creates a sell transaction)
 * @param {Object} req.body - Transaction details
 * @param {number} req.body.portfolio_id - Portfolio ID
 * @param {number} req.body.asset_id - Asset ID
 * @param {number} req.body.quantity - Quantity to sell
 * @param {number} req.body.price - Price per unit
 * @returns {Object} Confirmation message
 * @access Public
 */
router.post("/remove", async (req, res) => {
  const { portfolio_id, asset_id, quantity, price } = req.body;
  await pool.query(
    `INSERT INTO transactions 
     (portfolio_id, asset_id, date, type, quantity, price) 
     VALUES (?, ?, CURDATE(), 'sell', ?, ?)`,
    [portfolio_id, asset_id, quantity, price]
  );
  res.json({ message: "Asset removed (sell transaction created)" });
});

/**
 * @route GET /api/assets/:portfolioId/:assetId/performance
 * @description Get performance metrics for a specific asset in a portfolio
 * @param {string} portfolioId - Portfolio ID
 * @param {string} assetId - Asset ID
 * @returns {Object} Asset performance data
 * @access Public
 */
router.get("/:portfolioId/:assetId/performance", async (req, res) => {
  const { portfolioId, assetId } = req.params;
  try {
    const result = await getAssetPerformance(portfolioId, assetId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error calculating asset performance" });
  }
});

/**
 * @route GET /api/assets/stocks-with-prices
 * @description Get all stocks with their current prices and price changes
 * @returns {Array} Enhanced stock objects with price and change data
 * @access Public
 */
router.get("/stocks-with-prices", async (req, res, next) => {
  try {
    const [stocks] = await pool.query(
      `SELECT asset_id, symbol, name, asset_type, currency, sector
       FROM assets
       WHERE asset_type = 'stock'
       ORDER BY symbol ASC`
    );

    if (stocks.length === 0) {
      return res.json([]);
    }

    const symbols = stocks.map(s => s.symbol);
    const marketData = await getMarketData(symbols);
    const enhancedStocks = stocks.map(stock => {
      const marketInfo = marketData[stock.symbol] || {};
      return {
        ...stock,
        price: marketInfo.price || 0,
        change: marketInfo.changePercent || 0
      };
    });

    res.json(enhancedStocks);
  } catch (err) {
    console.error("Error fetching stocks with prices:", err);
    next(err);
  }
});

/**
 * Get current market data for a list of stock symbols
 * @param {string[]} symbols - Array of stock symbols
 * @returns {Object} Object with symbol keys and price/change values
 * @private
 */
async function getMarketData(symbols) {
  try {
    const { getStockPrices } = require("../services/financial-data-client");
    const marketData = await getStockPrices(symbols);
    return marketData;
  } catch (error) {
    console.error("Error fetching market data:", error);
    return symbols.reduce((acc, symbol) => {
      acc[symbol] = { price: 0, changePercent: 0 };
      return acc;
    }, {});
  }
}

module.exports = router;
