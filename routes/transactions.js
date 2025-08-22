/**
 * Express router for transaction-related endpoints
 * @module routes/transactions
 */

const express = require("express");
const router = express.Router();
const pool = require("../db");

/**
 * @route GET /api/transactions/:portfolioId
 * @description Get transaction history for a specific portfolio
 * @param {number} portfolioId - Portfolio ID
 * @returns {Array} List of transactions with asset details, ordered by date
 * @access Public
 */
router.get("/:portfolioId", async (req, res) => {
  const [rows] = await pool.query(
    `SELECT t.*, a.symbol, a.name 
     FROM transactions t
     JOIN assets a ON t.asset_id = a.asset_id
     WHERE portfolio_id = ?
     ORDER BY date ASC`,
    [req.params.portfolioId]
  );
  res.json(rows);
});


/**
 * @route POST /api/transactions
 * @description Create a new transaction (buy/sell/dividend/deposit/withdrawal)
 * @param {Object} req.body - Transaction details
 * @param {number} req.body.portfolio_id - Portfolio ID
 * @param {number} req.body.asset_id - Asset ID
 * @param {string} req.body.date - Transaction date (YYYY-MM-DD)
 * @param {string} req.body.type - Transaction type (buy, sell, dividend, deposit, withdrawal)
 * @param {number} req.body.quantity - Amount of asset
 * @param {number} req.body.price - Price per unit
 * @param {number} [req.body.fees=0] - Transaction fees
 * @param {string} [req.body.notes] - Additional notes
 * @returns {Object} Created transaction with ID
 * @throws {400} If required fields are missing or invalid
 * @access Public
 */
router.post("/", async (req, res, next) => {
  try {
    const { portfolio_id, asset_id, date, type, quantity, price, fees, notes } = req.body || {};

    if (!portfolio_id || !asset_id || !date || !type || quantity === undefined || price === undefined) {
      return res.status(400).json({ 
        error: "portfolio_id, asset_id, date, type, quantity, price are required" 
      });
    }
    
    const VALID_TYPES = new Set(['buy', 'sell', 'dividend', 'deposit', 'withdrawal']);
    if (!VALID_TYPES.has(type)) {
      return res.status(400).json({ error: "invalid type" });
    }

    const qty = Number(quantity);
    const prc = Number(price);
    if (!(qty >= 0) || !(prc >= 0)) {
      return res.status(400).json({ error: "quantity >= 0 y price >= 0" });
    }

    const [result] = await pool.query(
      `INSERT INTO transactions (portfolio_id, asset_id, date, type, quantity, price, fees, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [portfolio_id, asset_id, date, type, qty, prc, Number(fees ?? 0), notes ?? null]
    );

    res.status(201).json({
      transaction_id: result.insertId,
      portfolio_id, 
      asset_id, 
      date, 
      type,
      quantity: qty, 
      price: prc, 
      fees: Number(fees ?? 0), 
      notes: notes ?? null
    });
  } catch (err) { 
    next(err); 
  }
});

/**
 * Transactions router
 * @exports router
 */
module.exports = router;
