BEGIN;

CREATE INDEX IF NOT EXISTS idx_ledger_entries_updated_at ON ledger(updated_at);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_category_updated_at ON ledger(category_id, updated_at);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_category_updated_at_nonzero ON ledger(category_id, updated_at DESC) WHERE amount <> 0;
CREATE INDEX IF NOT EXISTS idx_categories_name ON ledger_category(name);

COMMIT;
