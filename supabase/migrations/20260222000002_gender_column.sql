ALTER TABLE products ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'unisex'
  CHECK (gender IN ('men', 'women', 'unisex'));
COMMENT ON COLUMN products.gender IS 'Intended wearer: men, women, or unisex';
