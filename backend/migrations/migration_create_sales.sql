-- Migration: Create sales table
-- Run with: psql -U salon -d salon_db -f migration_create_sales.sql

CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER NOT NULL REFERENCES appointments(id),
    amount NUMERIC(10, 2) NOT NULL,
    sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_appointment_id ON sales(appointment_id);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date);
