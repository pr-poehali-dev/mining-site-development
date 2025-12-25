-- Users table with authentication and 2FA support
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions for token-based auth
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    session_token VARCHAR(512) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mining accounts for each user
CREATE TABLE mining_accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    account_name VARCHAR(255) NOT NULL,
    hashrate DECIMAL(20, 2) DEFAULT 0,
    power_consumption DECIMAL(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mining statistics history
CREATE TABLE mining_stats (
    id SERIAL PRIMARY KEY,
    mining_account_id INTEGER REFERENCES mining_accounts(id),
    date DATE NOT NULL,
    total_hashrate DECIMAL(20, 2),
    power_used DECIMAL(10, 2),
    btc_mined DECIMAL(18, 8),
    revenue_usd DECIMAL(12, 2),
    electricity_cost DECIMAL(12, 2),
    profit_usd DECIMAL(12, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(mining_account_id, date)
);

-- Equipment orders
CREATE TABLE equipment_orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    equipment_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    price_usd DECIMAL(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service subscriptions
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    plan_name VARCHAR(100) NOT NULL,
    price_usd DECIMAL(10, 2) NOT NULL,
    hashrate_allocation DECIMAL(20, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    starts_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_mining_accounts_user ON mining_accounts(user_id);
CREATE INDEX idx_mining_stats_account ON mining_stats(mining_account_id);
CREATE INDEX idx_mining_stats_date ON mining_stats(date);
CREATE INDEX idx_orders_user ON equipment_orders(user_id);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);