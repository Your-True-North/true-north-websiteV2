-- Founding Members Launch System
-- Migration 003: Founding members tables and user fields

-- Create founding_members tracking table
CREATE TABLE IF NOT EXISTS founding_members (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  signup_date TIMESTAMP DEFAULT NOW(),
  signup_number INTEGER NOT NULL,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  referrer TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(signup_number)
);

-- Add Stripe and founding member fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS founding_member BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription ON users(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_founding_signup_number ON founding_members(signup_number);
CREATE INDEX IF NOT EXISTS idx_founding_user_id ON founding_members(user_id);

-- Create waitlist table for when founding spots fill up
CREATE TABLE IF NOT EXISTS founding_waitlist (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  joined_at TIMESTAMP DEFAULT NOW(),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_waitlist_email ON founding_waitlist(email);
