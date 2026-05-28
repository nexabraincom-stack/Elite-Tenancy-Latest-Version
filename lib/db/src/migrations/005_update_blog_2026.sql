-- Update blog article titles from 2025 → 2026
-- Elite Tenancy is live from May 2026 — content must reflect current year

UPDATE blog_articles
SET
  title   = REPLACE(title, '2025', '2026'),
  slug    = REPLACE(slug,  '2025', '2026'),
  excerpt = REPLACE(excerpt, '2025', '2026'),
  content = REPLACE(content, '2025', '2026')
WHERE title LIKE '%2025%'
   OR excerpt LIKE '%2025%';
