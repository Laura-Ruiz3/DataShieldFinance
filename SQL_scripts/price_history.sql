USE portfolio_db;

-- ==========================================
-- ASSET PRICE HISTORY TABLE
-- ==========================================
CREATE TABLE asset_price_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    price DECIMAL(18,6) NOT NULL,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE,
    INDEX(asset_id),
    INDEX(recorded_at)
);

-- ==========================================
-- TRIGGER to record price changes
-- ==========================================
DELIMITER //
CREATE TRIGGER after_asset_price_update
AFTER UPDATE ON assets
FOR EACH ROW
BEGIN
    IF OLD.price != NEW.price THEN
        INSERT INTO asset_price_history (asset_id, price)
        VALUES (NEW.asset_id, NEW.price);
    END IF;
END //
DELIMITER ;