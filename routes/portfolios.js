/**
 * Express router for portfolio-related endpoints
 * @module routes/portfolios
 */

const express = require("express");
const router = express.Router();
const pool = require("../db");
const { body, param } = require("express-validator");
const { runValidations } = require("../src/middlewares/validate");

/**
 * @route GET /api/portfolios/user/:userId
 * @description Get all portfolios for a specific user
 * @param {number} userId - User ID
 * @returns {Array} User's portfolios sorted by creation date (newest first)
 * @access Public
 */
router.get("/user/:userId",
  runValidations([param("userId").isInt({ min: 1 }).withMessage("userId inválido")]),
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const [rows] = await pool.query(
        `SELECT portfolio_id, user_id, name, description, created_at
         FROM portfolios WHERE user_id = ? ORDER BY created_at DESC`,
        [userId]
      );
      res.json(rows);
    } catch (err) { next(err); }
  }
);

/**
 * @route POST /api/portfolios
 * @description Create a new portfolio for a user
 * @param {Object} req.body - Portfolio details
 * @param {number} req.body.user_id - User ID
 * @param {string} req.body.name - Portfolio name (1-100 characters)
 * @param {string} [req.body.description] - Optional portfolio description (max 255 characters)
 * @returns {Object} Object containing the ID of the created portfolio
 * @throws {409} If user already has a portfolio with the same name
 * @access Public
 */
router.post("/",
  runValidations([
    body("user_id").isInt({ min: 1 }).withMessage("user_id inválido"),
    body("name").isString().trim().isLength({ min: 1, max: 100 }).withMessage("name requerido (1-100)"),
    body("description").optional().isString().trim().isLength({ max: 255 })
  ]),
  async (req, res, next) => {
    const { user_id, name, description } = req.body;
    try {
      const [[exists]] = await pool.query(
        `SELECT 1 FROM portfolios WHERE user_id = ? AND name = ? LIMIT 1`,
        [user_id, name]
      );

      if (exists) {
        return res.status(409).json({
          error: "PortfolioNameExists",
          message: `User ${user_id} already has a portfolio named "${name}".`
        });
      }

      const [result] = await pool.query(
        `INSERT INTO portfolios (user_id, name, description)
         VALUES (?, ?, ?)`,
        [user_id, name, description ?? null]
      );

      return res.status(201).json({ portfolio_id: result.insertId });
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * @route GET /api/portfolios/:portfolioId/performance
 * @description Get performance metrics for a specific portfolio
 * @param {number} portfolioId - Portfolio ID
 * @returns {Object} Portfolio performance data
 * @access Public
 */
router.get("/:portfolioId/performance",
  runValidations([param("portfolioId").isInt({ min: 1 }).withMessage("portfolioId inválido")]),
  async (req, res, next) => {
    try {
      const { getPortfolioPerformance } = require("../services/performance");
      const data = await getPortfolioPerformance(Number(req.params.portfolioId));
      res.json(data);
    } catch (err) { next(err); }
  }
);

/**
 * @route GET /api/portfolios/:portfolioId/holdings
 * @description Get current holdings in a specific portfolio
 * @param {number} portfolioId - Portfolio ID
 * @returns {Array} List of assets currently held in the portfolio with quantity, latest price, and fees
 * @access Public
 */
router.get("/:portfolioId/holdings", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        a.asset_id,
        a.symbol,
        a.name,
        SUM(CASE WHEN t.type = 'buy' THEN t.quantity 
                WHEN t.type = 'sell' THEN -t.quantity
                ELSE 0 END) AS quantity,
        -- Get the latest buy price for the asset
        (SELECT price FROM transactions 
         WHERE asset_id = a.asset_id AND portfolio_id = ? AND type = 'buy' 
         ORDER BY date DESC, transaction_id DESC LIMIT 1) AS price,
        -- Get the fees from the latest buy transaction
        (SELECT fees FROM transactions 
         WHERE asset_id = a.asset_id AND portfolio_id = ? AND type = 'buy' 
         ORDER BY date DESC, transaction_id DESC LIMIT 1) AS fees
      FROM 
        transactions t
      JOIN 
        assets a ON t.asset_id = a.asset_id
      WHERE 
        t.portfolio_id = ?
        AND t.type IN ('buy', 'sell')
      GROUP BY 
        a.asset_id, a.symbol, a.name
      HAVING 
        SUM(CASE WHEN t.type = 'buy' THEN t.quantity 
                WHEN t.type = 'sell' THEN -t.quantity
                ELSE 0 END) > 0
      ORDER BY 
        a.symbol
    `, [req.params.portfolioId, req.params.portfolioId, req.params.portfolioId]);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching holdings:", err);
    res.status(500).json({ error: "Failed to fetch holdings" });
  }
});

/**
 * @route DELETE /api/portfolios/user/:userId/portfolio/:portfolioId
 * @description Delete a specific portfolio belonging to a user
 * @param {number} userId - User ID
 * @param {number} portfolioId - Portfolio ID
 * @returns {Object} Success message if deleted
 * @throws {404} If portfolio not found
 * @access Public
 */
router.delete("/user/:userId/portfolio/:portfolioId", async (req, res) => {
  try {
    const { userId, portfolioId } = req.params;

    const result = await pool.query(
      "DELETE FROM portfolios WHERE user_id = ? AND portfolio_id = ?",
      [userId, portfolioId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Portfolio not found" });
    }

    res.json({ success: true, message: "Portfolio deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete portfolio" });
  }
});

/**
 * @route GET /api/portfolios/:portfolioId/holdings/value-breakdown
 * @description Get portfolio holdings with values, weights, and total portfolio value
 * @param {number} portfolioId - Portfolio ID
 * @returns {Object} Object containing portfolio total value and holdings with individual values and allocation weights
 * @access Public
 */
router.get("/:portfolioId/holdings/value-breakdown", async (req, res, next) => {
  try {
    const { portfolioId } = req.params;
    const [rows] = await pool.query(
      `
      SELECT 
        a.asset_id,
        a.symbol,
        a.name,
        -- Cantidad neta
        SUM(CASE 
              WHEN t.type = 'buy'  THEN t.quantity
              WHEN t.type = 'sell' THEN -t.quantity
              ELSE 0 
            END) AS quantity,
        -- Último precio de compra para estimar valor (puedes sustituir por precio de mercado)
        (
          SELECT tt.price 
          FROM transactions tt
          WHERE tt.asset_id = a.asset_id 
            AND tt.portfolio_id = ? 
            AND tt.type = 'buy'
          ORDER BY tt.date DESC, tt.transaction_id DESC
          LIMIT 1
        ) AS last_buy_price
      FROM transactions t
      JOIN assets a ON t.asset_id = a.asset_id
      WHERE 
        t.portfolio_id = ?
        AND t.type IN ('buy','sell')
      GROUP BY a.asset_id, a.symbol, a.name
      HAVING SUM(CASE WHEN t.type = 'buy' THEN t.quantity 
                      WHEN t.type = 'sell' THEN -t.quantity 
                      ELSE 0 END) > 0
      ORDER BY a.symbol
      `,
      [portfolioId, portfolioId]
    );

    const enriched = rows.map(r => {
      const qty = Number(r.quantity ?? 0);
      const price = Number(r.last_buy_price ?? 0);
      const value = qty * price;
      return {
        asset_id: r.asset_id,
        symbol: r.symbol,
        name: r.name,
        quantity: qty,
        price_usd: price,
        value_usd: value
      };
    });

    const totalValue = enriched.reduce((acc, x) => acc + (x.value_usd || 0), 0);
    const withWeights = enriched.map(x => ({
      ...x,
      weight: totalValue > 0 ? (x.value_usd / totalValue) * 100 : 0
    }));

    res.json({
      portfolio_id: Number(portfolioId),
      total_value_usd: totalValue,
      holdings: withWeights
    });
  } catch (err) {
    console.error("Error in value-breakdown:", err);
    next(err);
  }
});


/**
 * Portfolio router
 * @exports router
 */
module.exports = router;
