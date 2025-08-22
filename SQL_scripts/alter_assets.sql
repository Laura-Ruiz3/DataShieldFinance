USE portfolio_db;

-- Add price columns to existing assets table
ALTER TABLE assets 
ADD COLUMN price DECIMAL(18,6) DEFAULT 0.00,
ADD COLUMN last_updated DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Update prices from assets_data.sql where available
UPDATE assets a
JOIN (
    SELECT symbol, price FROM (
        SELECT 
            SUBSTRING_INDEX(SUBSTRING_INDEX(value, ',', 6), ',', -1) as price,
            SUBSTRING_INDEX(SUBSTRING_INDEX(value, ',', 1), ',', -1) as symbol
        FROM (
            SELECT SUBSTRING_INDEX(SUBSTRING_INDEX(REPLACE(REPLACE(line, '(', ''), ')', ''), ',', n), ',', -1) as value
            FROM (
                SELECT SUBSTRING_INDEX(SUBSTRING_INDEX(file_content, '\n', n), '\n', -1) as line
                FROM (
                    SELECT LOAD_FILE('c:/Users/andre/Documents/DataShieldFinance/App/DataShieldFinance/SQL_scripts/assets_data.sql') as file_content
                ) as file,
                (SELECT @n := @n + 1 n FROM (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) t1, 
                (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) t2, 
                (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) t3, 
                (SELECT @n := 0) t0 LIMIT 100) as numbers
                WHERE n <= (LENGTH(file_content) - LENGTH(REPLACE(file_content, '\n', ''))) + 1
            ) as lines
            CROSS JOIN (SELECT 1 as n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6) as nums
            WHERE line LIKE '%,%,%,%,%,%,%' AND line NOT LIKE '--%'
        ) as values_split
    ) as extracted
    WHERE price REGEXP '^[0-9]+(\.[0-9]+)?$'
) as prices ON a.symbol = prices.symbol
SET a.price = prices.price, a.last_updated = NOW();