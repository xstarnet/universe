-- =============================================
-- File: create_ledger_tables.sql
-- Author: Trae IDE Assistant
-- Created: 2025-12-26
-- Modified: 2025-12-26 - Initial creation of ledger and ledger_category tables
-- Description: Creates ledger and ledger_category tables with constraints,
--              comments, indexes, charset/collation, and test inserts.
-- =============================================

-- =============================================
-- PostgreSQL Dialect
-- Run this section on PostgreSQL
-- =============================================
BEGIN;

SET client_encoding = 'UTF8';

CREATE TABLE IF NOT EXISTS ledger_category (
  id UUID NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL
);

COMMENT ON TABLE ledger_category IS 'Ledger category table';
COMMENT ON COLUMN ledger_category.id IS 'Primary key';
COMMENT ON COLUMN ledger_category.name IS 'Category name';
COMMENT ON COLUMN ledger_category.description IS 'Category description';

CREATE TABLE IF NOT EXISTS ledger (
  id UUID NOT NULL PRIMARY KEY,
  category_id UUID NOT NULL,
  amount NUMERIC(19,4) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ledger_category FOREIGN KEY (category_id)
    REFERENCES ledger_category(id)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT
);

COMMENT ON TABLE ledger IS 'Ledger entries';
COMMENT ON COLUMN ledger.id IS 'Primary key';
COMMENT ON COLUMN ledger.category_id IS 'FK to ledger_category.id';
COMMENT ON COLUMN ledger.amount IS 'Amount (19,4)';
COMMENT ON COLUMN ledger.updated_at IS 'Last updated time';

CREATE INDEX IF NOT EXISTS idx_ledger_updated_at ON ledger(updated_at);
CREATE INDEX IF NOT EXISTS idx_ledger_category_updated_at ON ledger(category_id, updated_at);
CREATE INDEX IF NOT EXISTS idx_ledger_category_name ON ledger_category(name);

COMMIT;

-- Tests (PostgreSQL)
BEGIN;
INSERT INTO ledger_category(id, name, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Food', 'Daily food expenses'),
  ('00000000-0000-0000-0000-000000000002', 'Travel', 'Travel expenses');

INSERT INTO ledger(id, category_id, amount, updated_at) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 123.45, CURRENT_TIMESTAMP),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 9999.99, CURRENT_TIMESTAMP);

-- Invalid insert (should fail FK constraint):
-- INSERT INTO ledger(id, category_id, amount, updated_at) VALUES
--   ('10000000-0000-0000-0000-000000000003', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 1.00, CURRENT_TIMESTAMP);
COMMIT;

-- =============================================
-- MySQL Dialect
-- Run this section on MySQL 8.0+
-- =============================================
START TRANSACTION;

SET NAMES utf8mb4;
SET collation_connection = 'utf8mb4_unicode_ci';

CREATE TABLE IF NOT EXISTS ledger_category (
  id CHAR(36) NOT NULL COMMENT 'Primary key',
  name VARCHAR(255) NOT NULL COMMENT 'Category name',
  description TEXT NULL COMMENT 'Category description',
  PRIMARY KEY (id),
  INDEX idx_ledger_category_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Ledger category table';

CREATE TABLE IF NOT EXISTS ledger (
  id CHAR(36) NOT NULL COMMENT 'Primary key',
  category_id CHAR(36) NOT NULL COMMENT 'FK to ledger_category.id',
  amount DECIMAL(19,4) NOT NULL COMMENT 'Amount (19,4)',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Last updated time',
  PRIMARY KEY (id),
  CONSTRAINT fk_ledger_category FOREIGN KEY (category_id)
    REFERENCES ledger_category(id)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
  INDEX idx_ledger_updated_at (updated_at),
  INDEX idx_ledger_category_updated_at (category_id, updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Ledger entries';

COMMIT;

-- Tests (MySQL)
START TRANSACTION;
INSERT INTO ledger_category(id, name, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Food', 'Daily food expenses'),
  ('00000000-0000-0000-0000-000000000002', 'Travel', 'Travel expenses');

INSERT INTO ledger(id, category_id, amount) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 123.45),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 9999.99);

-- Invalid insert (should fail FK constraint):
-- INSERT INTO ledger(id, category_id, amount) VALUES
--   ('10000000-0000-0000-0000-000000000003', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 1.00);
COMMIT;

