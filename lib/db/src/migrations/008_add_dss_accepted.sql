-- Add dssAccepted flag to listings, mirroring the existing petsAllowed /
-- billsIncluded boolean pattern. Powers the "DSS accepted" filter and
-- dedicated landing page — "DSS accepted" remains the dominant colloquial
-- search term tenants use for landlords who accept Universal Credit /
-- Housing Benefit, confirmed via live keyword research (SpareRoom, OpenRent,
-- and others all run a dedicated /dss-accepted style page).

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS dss_accepted BOOLEAN NOT NULL DEFAULT false;
