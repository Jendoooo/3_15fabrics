CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  whatsapp_number TEXT,
  first_name TEXT,
  last_name TEXT,
  source TEXT, -- 'waitlist','newsletter','abandoned_cart','checkout','footer','walk_in'
  subscribed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partial unique indexes so upsert onConflict works (nulls are excluded)
CREATE UNIQUE INDEX contacts_email_unique ON contacts(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX contacts_whatsapp_unique ON contacts(whatsapp_number) WHERE whatsapp_number IS NOT NULL;

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories(id),
  image_url TEXT,
  sort_order INT DEFAULT 0
);

CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_image TEXT,
  lookbook_images JSONB,
  release_date DATE,
  status TEXT DEFAULT 'draft', -- draft/upcoming/active/archived
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  compare_at_price NUMERIC,
  category_id UUID REFERENCES categories(id),
  collection_id UUID REFERENCES collections(id),
  fabric_details TEXT,
  care_instructions TEXT,
  fit_notes TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'draft', -- draft/active/sold_out
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE
);

CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size TEXT,
  color TEXT,
  stock_quantity INT DEFAULT 0,
  sku TEXT UNIQUE
);

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  phone TEXT,
  whatsapp_number TEXT,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  street TEXT,
  city TEXT,
  state TEXT,
  lga TEXT,
  is_default BOOLEAN DEFAULT FALSE
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL, -- IBY-YYYYXXXX
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT,
  customer_phone TEXT,
  customer_whatsapp TEXT,
  customer_email TEXT,
  delivery_address JSONB,
  status TEXT DEFAULT 'pending', -- pending/confirmed/processing/shipped/delivered/cancelled
  source TEXT DEFAULT 'website', -- website/instagram/whatsapp/walk_in/other
  payment_method TEXT, -- paystack_online/bank_transfer/cash/pos_terminal
  subtotal NUMERIC,
  delivery_fee NUMERIC,
  total NUMERIC,
  payment_status TEXT DEFAULT 'unpaid', -- unpaid/paid/refunded
  payment_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  product_name TEXT,
  size TEXT,
  color TEXT,
  quantity INT,
  unit_price NUMERIC
);

CREATE TABLE delivery_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  status TEXT,
  note TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT -- 'ibrahim' or 'system'
);

CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  whatsapp_number TEXT,
  collection_id UUID REFERENCES collections(id),
  product_id UUID REFERENCES products(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE abandoned_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  whatsapp_number TEXT,
  cart_data JSONB,
  recovered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
