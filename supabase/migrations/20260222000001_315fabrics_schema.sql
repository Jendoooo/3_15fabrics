-- 315 Fabrics schema additions
-- Run this AFTER the initial schema (20240221000000_initial_schema.sql)

-- Products: fabric-specific fields
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS unit_type TEXT DEFAULT 'yard'
    CHECK (unit_type IN ('yard', 'bundle')),
  ADD COLUMN IF NOT EXISTS minimum_quantity NUMERIC NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS fabric_type TEXT;

-- Comment on new columns
COMMENT ON COLUMN products.unit_type IS 'yard = sold per yard with minimum; bundle = fixed set price';
COMMENT ON COLUMN products.minimum_quantity IS 'For yard-type: minimum yards customer must order. For bundle-type: total yards in the set.';
COMMENT ON COLUMN products.fabric_type IS 'e.g. Ankara, French Lace, Swiss Voile, Senator, Aso-Oke, Cotton, Other';

-- Order items: track yards ordered per line item
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS yards_ordered NUMERIC;

COMMENT ON COLUMN order_items.yards_ordered IS 'How many yards the customer ordered. Equals quantity for fabric orders.';
