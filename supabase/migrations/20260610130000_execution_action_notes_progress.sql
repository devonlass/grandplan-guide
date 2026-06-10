-- Add notes and progress columns to execution_actions table

ALTER TABLE execution_actions
  ADD COLUMN IF NOT EXISTS notes    text,
  ADD COLUMN IF NOT EXISTS progress text CHECK (progress IN ('completed', 'in-progress', 'stuck'));
