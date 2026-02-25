CREATE TABLE IF NOT EXISTS users (
  id UUID NOT NULL PRIMARY KEY,
  name VARCHAR(100) NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  avatar VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add table comment
COMMENT ON TABLE users IS 'User table';

-- Add column comments
COMMENT ON COLUMN users.id IS 'User ID';
COMMENT ON COLUMN users.name IS 'User name';
COMMENT ON COLUMN users.phone IS 'User phone number';
COMMENT ON COLUMN users.avatar IS 'User avatar URL';
COMMENT ON COLUMN users.created_at IS 'Create time';
COMMENT ON COLUMN users.updated_at IS 'Update time';

-- Create a trigger function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach the trigger to the users table
CREATE TRIGGER users_update_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

