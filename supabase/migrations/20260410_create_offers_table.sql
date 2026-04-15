-- Offers-Tabelle für Phase 3 des Angebotssystems
-- In Supabase SQL Editor ausführen

CREATE TABLE IF NOT EXISTS offers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  TEXT NOT NULL,
  request_id  UUID REFERENCES requests(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(10, 2) NOT NULL,
  status      TEXT NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
  pdf_url     TEXT,           -- base64-kodiertes PDF
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index für schnelle Dashboard-Abfragen
CREATE INDEX IF NOT EXISTS offers_company_id_idx ON offers (company_id);
CREATE INDEX IF NOT EXISTS offers_customer_id_idx ON offers (customer_id);

-- RLS aktivieren (analog zu requests/customers)
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
