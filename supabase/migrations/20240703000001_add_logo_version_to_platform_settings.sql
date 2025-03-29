-- Add logo_version column to platform_settings table
ALTER TABLE platform_settings ADD COLUMN logo_version INTEGER DEFAULT 1;

-- Update existing records to have version 1
UPDATE platform_settings SET logo_version = 1 WHERE logo_version IS NULL;

-- Enable realtime for platform_settings
alter publication supabase_realtime add table platform_settings;
