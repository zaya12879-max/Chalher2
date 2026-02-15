/*
  # Create E-commerce Schema for CHALHER Paris

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text) - Product name
      - `image_url` (text) - Product image path
      - `price` (decimal) - Product price in EUR
      - `stock` (integer) - Available stock
      - `description` (text) - Product description
      - `created_at` (timestamp)
    
    - `cart_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `product_id` (uuid, foreign key to products)
      - `quantity` (integer) - Quantity in cart
      - `personalization` (text) - Custom message
      - `created_at` (timestamp)
    
    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `total_amount` (decimal) - Total order amount
      - `status` (text) - Order status
      - `payment_method` (text) - Payment method used
      - `shipping_address` (jsonb) - Shipping details
      - `created_at` (timestamp)
    
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key to orders)
      - `product_id` (uuid, foreign key to products)
      - `quantity` (integer)
      - `price` (decimal) - Price at time of purchase
      - `personalization` (text)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text NOT NULL,
  price decimal(10,2) NOT NULL DEFAULT 54.95,
  stock integer NOT NULL DEFAULT 5,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public can view products
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO public
  USING (true);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  personalization text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cart items"
  ON cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount decimal(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  payment_method text NOT NULL,
  shipping_address jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL,
  price decimal(10,2) NOT NULL,
  personalization text DEFAULT ''
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Insert sample products (hijab1 to hijab18)
INSERT INTO products (name, image_url, price, stock) VALUES
  ('MODÈLE EXCELLENCE N°1', 'images/hijab1.jpeg', 54.95, 5),
  ('MODÈLE EXCELLENCE N°2', 'images/hijab2.jpeg', 54.95, 5),
  ('MODÈLE EXCELLENCE N°3', 'images/hijab3.jpeg', 54.95, 5),
  ('MODÈLE EXCELLENCE N°4', 'images/hijab4.jpeg', 54.95, 5),
  ('MODÈLE EXCELLENCE N°5', 'images/hijab5.jpeg', 54.95, 5),
  ('MODÈLE EXCELLENCE N°6', 'images/hijab6.jpeg', 54.95, 5),
  ('MODÈLE EXCELLENCE N°7', 'images/hijab7.jpeg', 54.95, 5),
  ('MODÈLE EXCELLENCE N°8', 'images/hijab8.jpeg', 54.95, 5),
  ('MODÈLE EXCELLENCE N°9', 'images/hijab9.jpeg', 54.95, 5),
  ('MODÈLE EXCELLENCE N°10', 'images/hijab10.jpeg', 54.95, 5),
  ('MODÈLE EXCELLENCE N°11', 'images/hijab11.jpeg', 54.95, 5),
  ('MODÈLE EXCELLENCE N°12', 'images/hijab12.jpeg', 54.95, 5),
  ('MODÈLE EXCELLENCE N°13', 'images/hijab13.jpeg', 54.95, 5),
  ('MODÈLE EXCELLENCE N°14', 'images/hijab14.jpeg', 54.95, 5),
  ('MODÈLE EXCELLENCE N°15', 'images/hijab15.jpeg', 54.95, 5),
  ('MODÈLE EXCELLENCE N°16', 'images/hijab16.jpeg', 54.95, 5),
  ('MODÈLE EXCELLENCE N°17', 'images/hijab17.jpeg', 54.95, 5),
  ('MODÈLE EXCELLENCE N°18', 'images/hijab18.jpeg', 54.95, 5)
ON CONFLICT DO NOTHING;