USE portfolio_db;

-- ==========================================
-- Procedure to handle buying assets
-- ==========================================
DELIMITER //
CREATE PROCEDURE buy_asset(
    IN p_portfolio_id INT,
    IN p_asset_id INT,
    IN p_quantity DECIMAL(18,6),
    IN p_fees DECIMAL(18,2),
    IN p_notes TEXT
)
BEGIN
    DECLARE current_price DECIMAL(18,6);
    DECLARE transaction_date DATE;
    
    -- Get the current price from assets table
    SELECT price INTO current_price FROM assets WHERE asset_id = p_asset_id;
    
    -- Set transaction date to current date
    SET transaction_date = CURDATE();
    
    -- Insert buy transaction
    INSERT INTO transactions (
        portfolio_id,
        asset_id,
        date,
        type,
        quantity,
        price,
        fees,
        notes
    ) VALUES (
        p_portfolio_id,
        p_asset_id,
        transaction_date,
        'buy',
        p_quantity,
        current_price,
        p_fees,
        p_notes
    );
    
    SELECT LAST_INSERT_ID() AS transaction_id;
END //
DELIMITER ;

-- ==========================================
-- Procedure to handle selling assets
-- ==========================================
DELIMITER //
CREATE PROCEDURE sell_asset(
    IN p_portfolio_id INT,
    IN p_asset_id INT,
    IN p_quantity DECIMAL(18,6),
    IN p_fees DECIMAL(18,2),
    IN p_notes TEXT
)
BEGIN
    DECLARE current_price DECIMAL(18,6);
    DECLARE transaction_date DATE;
    DECLARE available_quantity DECIMAL(18,6);
    
    -- Get the current price from assets table
    SELECT price INTO current_price FROM assets WHERE asset_id = p_asset_id;
    
    -- Set transaction date to current date
    SET transaction_date = CURDATE();
    
    -- Calculate how many units of this asset the portfolio owns
    SELECT COALESCE(SUM(CASE WHEN type = 'buy' THEN quantity ELSE -quantity END), 0)
    INTO available_quantity
    FROM transactions
    WHERE portfolio_id = p_portfolio_id AND asset_id = p_asset_id;
    
    -- Verify there are enough units to sell
    IF available_quantity >= p_quantity THEN
        -- Insert sell transaction
        INSERT INTO transactions (
            portfolio_id,
            asset_id,
            date,
            type,
            quantity,
            price,
            fees,
            notes
        ) VALUES (
            p_portfolio_id,
            p_asset_id,
            transaction_date,
            'sell',
            p_quantity,
            current_price,
            p_fees,
            p_notes
        );
        
        SELECT LAST_INSERT_ID() AS transaction_id, 'Success' AS status;
    ELSE
        -- Not enough units to sell
        SELECT 0 AS transaction_id, 'Insufficient assets' AS status;
    END IF;
END //
DELIMITER ;

-- ==========================================
-- Procedure to update asset price
-- ==========================================
DELIMITER //
CREATE PROCEDURE update_asset_price(
    IN p_asset_id INT,
    IN p_new_price DECIMAL(18,6)
)
BEGIN
    UPDATE assets
    SET price = p_new_price,
        last_updated = NOW()
    WHERE asset_id = p_asset_id;
END //
DELIMITER ;