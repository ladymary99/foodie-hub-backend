-- Foodie Hub Database Schema
-- Enhanced Entity-Relationship (EER) Implementation for PostgreSQL

-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (for fresh setup)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;

-- Create Restaurants table
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    cuisine_type VARCHAR(100),
    opening_hours VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Menu Items table
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    category VARCHAR(100),
    is_available BOOLEAN DEFAULT TRUE,
    preparation_time INTEGER, -- in minutes
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Create Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL,
    restaurant_id UUID NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
    delivery_address TEXT,
    special_instructions TEXT,
    estimated_delivery_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Create Order Items table (Junction table for Orders and Menu Items)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL,
    menu_item_id UUID NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    subtotal DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    UNIQUE(order_id, menu_item_id) -- Prevent duplicate items in same order
);

-- Create indexes for better query performance
CREATE INDEX idx_restaurants_cuisine ON restaurants(cuisine_type);
CREATE INDEX idx_restaurants_active ON restaurants(is_active);
CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_menu_items_available ON menu_items(is_available);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_menu_item ON order_items(menu_item_id);

-- Create trigger function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_restaurants_updated_at
    BEFORE UPDATE ON restaurants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
    BEFORE UPDATE ON menu_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO restaurants (name, description, address, phone, email, cuisine_type, opening_hours) VALUES
('Pizza Palace', 'Authentic Italian pizzas with fresh ingredients', '123 Main St, Downtown', '+1-555-0101', 'info@pizzapalace.com', 'Italian', 'Mon-Sun: 11:00 AM - 11:00 PM'),
('Burger Barn', 'Gourmet burgers and craft beverages', '456 Oak Ave, Midtown', '+1-555-0102', 'hello@burgerbarn.com', 'American', 'Mon-Sun: 10:00 AM - 10:00 PM'),
('Sushi Zen', 'Fresh sushi and Japanese cuisine', '789 Pine St, Uptown', '+1-555-0103', 'orders@sushizen.com', 'Japanese', 'Tue-Sun: 5:00 PM - 10:00 PM');

INSERT INTO customers (name, phone, email, address) VALUES
('John Doe', '+1-555-1001', 'john.doe@email.com', '100 Elm St, Residential'),
('Jane Smith', '+1-555-1002', 'jane.smith@email.com', '200 Maple Ave, Suburb'),
('Mike Johnson', '+1-555-1003', 'mike.j@email.com', '300 Cedar Rd, Downtown');

-- Get restaurant IDs for menu items
WITH restaurant_ids AS (
    SELECT id, name FROM restaurants
)
INSERT INTO menu_items (restaurant_id, name, description, price, category, preparation_time)
SELECT
    r.id,
    item.name,
    item.description,
    item.price,
    item.category,
    item.prep_time
FROM restaurant_ids r
CROSS JOIN (
    VALUES
    ('Margherita Pizza', 'Classic tomato sauce, mozzarella, and fresh basil', 14.99, 'Pizza', 20),
    ('Pepperoni Pizza', 'Traditional pepperoni with mozzarella cheese', 16.99, 'Pizza', 20),
    ('Caesar Salad', 'Crisp romaine lettuce with caesar dressing', 9.99, 'Salad', 10)
) AS item(name, description, price, category, prep_time)
WHERE r.name = 'Pizza Palace'

UNION ALL

SELECT
    r.id,
    item.name,
    item.description,
    item.price,
    item.category,
    item.prep_time
FROM restaurant_ids r
CROSS JOIN (
    VALUES
    ('Classic Burger', 'Beef patty with lettuce, tomato, and special sauce', 12.99, 'Burger', 15),
    ('Bacon Cheeseburger', 'Beef patty with bacon, cheese, and all the fixings', 15.99, 'Burger', 15),
    ('Sweet Potato Fries', 'Crispy sweet potato fries with aioli', 6.99, 'Sides', 8)
) AS item(name, description, price, category, prep_time)
WHERE r.name = 'Burger Barn'

UNION ALL

SELECT
    r.id,
    item.name,
    item.description,
    item.price,
    item.category,
    item.prep_time
FROM restaurant_ids r
CROSS JOIN (
    VALUES
    ('Salmon Roll', 'Fresh salmon with avocado and cucumber', 8.99, 'Sushi', 5),
    ('Tuna Sashimi', 'Fresh tuna slices, 6 pieces', 12.99, 'Sashimi', 3),
    ('Miso Soup', 'Traditional miso soup with tofu and seaweed', 4.99, 'Soup', 5)
) AS item(name, description, price, category, prep_time)
WHERE r.name = 'Sushi Zen';
