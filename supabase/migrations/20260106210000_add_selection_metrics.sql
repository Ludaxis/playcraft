-- Add selection quality metrics to generation outcomes
-- Tracks which files were selected vs which were actually modified

ALTER TABLE playcraft_generation_outcomes
ADD COLUMN IF NOT EXISTS files_selected_for_context JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS files_actually_modified JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS selection_accuracy FLOAT,
ADD COLUMN IF NOT EXISTS missed_files JSONB DEFAULT '[]'::jsonb;

-- Add index for querying by selection accuracy (for learning optimal weights)
CREATE INDEX IF NOT EXISTS idx_generation_outcomes_selection_accuracy
ON playcraft_generation_outcomes(selection_accuracy)
WHERE selection_accuracy IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN playcraft_generation_outcomes.files_selected_for_context IS 'Files included in context package sent to AI';
COMMENT ON COLUMN playcraft_generation_outcomes.files_actually_modified IS 'Files that AI actually changed';
COMMENT ON COLUMN playcraft_generation_outcomes.selection_accuracy IS 'Ratio of modified files that were in selected context (0-1)';
COMMENT ON COLUMN playcraft_generation_outcomes.missed_files IS 'Files modified but not selected for context';
