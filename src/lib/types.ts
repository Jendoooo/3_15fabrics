export type Contact = {
    id: string;
    email: string | null;
    whatsapp_number: string | null;
    first_name: string | null;
    last_name: string | null;
    source: string | null;
    subscribed: boolean;
    created_at: string;
};

export type Category = {
    id: string;
    name: string;
    slug: string;
    parent_id: string | null;
    image_url: string | null;
    sort_order: number;
};

export type Collection = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    cover_image: string | null;
    lookbook_images: Record<string, unknown>[] | null; // JSONB
    release_date: string | null; // DATE
    status: string;
    is_featured: boolean;
    created_at: string;
};

export type Product = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    compare_at_price: number | null;
    category_id: string | null;
    collection_id: string | null;
    fabric_details: string | null;
    care_instructions: string | null;
    fit_notes: string | null;
    is_featured: boolean;
    status: string;
    created_at: string;
};

export type ProductImage = {
    id: string;
    product_id: string | null;
    image_url: string;
    alt_text: string | null;
    sort_order: number;
    is_primary: boolean;
};

export type ProductVariant = {
    id: string;
    product_id: string | null;
    size: string | null;
    color: string | null;
    stock_quantity: number;
    sku: string | null;
};

export type Customer = {
    id: string;
    email: string | null;
    phone: string | null;
    whatsapp_number: string | null;
    first_name: string | null;
    last_name: string | null;
    created_at: string;
};

export type Address = {
    id: string;
    customer_id: string | null;
    street: string | null;
    city: string | null;
    state: string | null;
    lga: string | null;
    is_default: boolean;
};

export type Order = {
    id: string;
    order_number: string;
    customer_id: string | null;
    customer_name: string | null;
    customer_phone: string | null;
    customer_whatsapp: string | null;
    customer_email: string | null;
    delivery_address: Record<string, string> | null; // JSONB
    status: string;
    source: string;
    payment_method: string | null;
    subtotal: number | null;
    delivery_fee: number | null;
    total: number | null;
    payment_status: string;
    payment_reference: string | null;
    notes: string | null;
    created_at: string;
};

export type OrderItem = {
    id: string;
    order_id: string | null;
    product_id: string | null;
    variant_id: string | null;
    product_name: string | null;
    size: string | null;
    color: string | null;
    quantity: number | null;
    unit_price: number | null;
};

export type DeliveryTracking = {
    id: string;
    order_id: string | null;
    status: string | null;
    note: string | null;
    updated_at: string;
    updated_by: string | null;
};

export type Waitlist = {
    id: string;
    email: string | null;
    whatsapp_number: string | null;
    collection_id: string | null;
    product_id: string | null;
    created_at: string;
};

export type AbandonedCart = {
    id: string;
    email: string | null;
    whatsapp_number: string | null;
    cart_data: Record<string, unknown>[] | null; // JSONB
    recovered: boolean;
    created_at: string;
};

export type Database = {
    public: {
        Tables: {
            contacts: { Row: Contact; Insert: Partial<Contact>; Update: Partial<Contact>; Relationships: [] };
            categories: { Row: Category; Insert: Partial<Category>; Update: Partial<Category>; Relationships: [] };
            collections: { Row: Collection; Insert: Partial<Collection>; Update: Partial<Collection>; Relationships: [] };
            products: { Row: Product; Insert: Partial<Product>; Update: Partial<Product>; Relationships: [] };
            product_images: { Row: ProductImage; Insert: Partial<ProductImage>; Update: Partial<ProductImage>; Relationships: [] };
            product_variants: { Row: ProductVariant; Insert: Partial<ProductVariant>; Update: Partial<ProductVariant>; Relationships: [] };
            customers: { Row: Customer; Insert: Partial<Customer>; Update: Partial<Customer>; Relationships: [] };
            addresses: { Row: Address; Insert: Partial<Address>; Update: Partial<Address>; Relationships: [] };
            orders: { Row: Order; Insert: Partial<Order>; Update: Partial<Order>; Relationships: [] };
            order_items: { Row: OrderItem; Insert: Partial<OrderItem>; Update: Partial<OrderItem>; Relationships: [] };
            delivery_tracking: { Row: DeliveryTracking; Insert: Partial<DeliveryTracking>; Update: Partial<DeliveryTracking>; Relationships: [] };
            waitlist: { Row: Waitlist; Insert: Partial<Waitlist>; Update: Partial<Waitlist>; Relationships: [] };
            abandoned_carts: { Row: AbandonedCart; Insert: Partial<AbandonedCart>; Update: Partial<AbandonedCart>; Relationships: [] };
        };
        Views: { [_ in never]: never };
        Functions: { [_ in never]: never };
        Enums: { [_ in never]: never };
        CompositeTypes: { [_ in never]: never };
    };
};
