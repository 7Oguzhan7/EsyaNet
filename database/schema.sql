-- Kayıp Eşya Açık Artırma ve Satın Alma Sistemi - Veritabanı Şeması

-- 1. Tablo: Kurumlar / Şubeler (institutions)
CREATE TABLE institutions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    contact_number VARCHAR(20)
);

-- 2. Tablo: Kullanıcılar (users)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name_surname VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL, -- 'citizen', 'institution', 'admin'
    phone VARCHAR(20),
    institution_id INTEGER REFERENCES institutions(id) ON DELETE SET NULL, -- Kurum yetkilisinin bağlı olduğu kurum
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tablo: Kayıp Eşyalar (lost_items)
CREATE TABLE lost_items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    date_found DATE NOT NULL,
    location_found VARCHAR(255),
    image_url VARCHAR(255), -- Eşyanın fotoğraf adresi
    institution_id INTEGER REFERENCES institutions(id) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'waiting_owner', -- 'waiting_owner', 'delivered_owner', 'ready_for_auction', 'in_auction', 'sold', 'donated'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tablo: Açık Artırmalar (auctions)
CREATE TABLE auctions (
    id SERIAL PRIMARY KEY,
    lost_item_id INTEGER UNIQUE REFERENCES lost_items(id) ON DELETE CASCADE,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    start_price DECIMAL(10, 2) NOT NULL,
    current_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'active', 'completed', 'no_bid_ended'
    winner_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- 5. Tablo: Teklifler (bids)
CREATE TABLE bids (
    id SERIAL PRIMARY KEY,
    auction_id INTEGER REFERENCES auctions(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tablo: Ödemeler ve Teslimat (payments)
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    auction_id INTEGER UNIQUE REFERENCES auctions(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'failed'
    delivery_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'shipped', 'delivered'
    payment_date TIMESTAMP
);

-- 7. Tablo: Bağış Talepleri (donations)
CREATE TABLE donations (
    id SERIAL PRIMARY KEY,
    lost_item_id INTEGER UNIQUE REFERENCES lost_items(id) ON DELETE CASCADE,
    recipient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' -- 'pending', 'approved', 'rejected', 'delivered'
);

-- 8. Tablo: Mesajlar (messages)
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    from_user_id INTEGER NOT NULL,
    from_name VARCHAR(150) NOT NULL,
    to_inst_id INTEGER REFERENCES institutions(id) ON DELETE SET NULL,
    to_inst_name VARCHAR(150),
    to_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    to_role VARCHAR(30) DEFAULT 'institution',
    msg_type VARCHAR(50) DEFAULT 'Genel',
    text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Tablo: Şube Teslimat Randevuları (appointments)
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    claim_id INTEGER,
    lost_item_id INTEGER NOT NULL REFERENCES lost_items(id) ON DELETE CASCADE,
    item_title VARCHAR(150) NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(150) NOT NULL,
    user_phone VARCHAR(50),
    institution_id INTEGER NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    institution_name VARCHAR(150) NOT NULL,
    appointment_date VARCHAR(30) NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    note TEXT,
    status VARCHAR(30) DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled', 'no_show'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

