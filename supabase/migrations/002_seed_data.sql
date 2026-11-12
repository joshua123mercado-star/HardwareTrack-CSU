-- ============================================================
-- HardWareTrack — Seed Data
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- ── PRODUCTS (15 items) ──────────────────────────────────────
INSERT INTO public.products (id, sku, name, category, description, unit_price, cost_price, stock, min_stock_level, location, updated_at) VALUES
('prod-001','ELEC-WIR-35MM','THHN Building Wire 3.5mm² (150m Roll)','Electrical','Flame-retardant, high-heat resistant copper wire designed for residential and commercial conduit wiring.',45.00,27.00,15,5,'Aisle 1, Shelf A','2026-01-01T00:00:00Z'),
('prod-002','ELEC-SWT-2G','2-Gang Flush Wall Switch with Plate (16A, 250V)','Electrical','Standard dual-toggle wall switch for controlling separate lighting circuits from a single wall outlet box.',4.50,2.70,40,10,'Aisle 1, Shelf B','2026-01-01T00:00:00Z'),
('prod-003','ELEC-LED-12W','LED Ceiling Downlight 12W (Daylight White)','Electrical','Energy-efficient recessed LED panel lamp featuring an integrated aluminum heat sink for indoor residential lighting.',6.99,4.19,25,8,'Aisle 1, Shelf C','2026-01-01T00:00:00Z'),
('prod-004','PLUM-PEX-050','PEX-A Flexible Water Pipe 1/2 in. (100 ft. Coil)','Plumbing','Cross-linked polyethylene tubing engineered for hot and cold potable water distribution systems.',38.50,23.10,12,4,'Aisle 2, Shelf A','2026-01-01T00:00:00Z'),
('prod-005','PLUM-VAL-050','PVC Ball Valve 1/2 in. Threaded','Plumbing','Corrosion-resistant PVC shut-off valve with an easy-turn lever handle for agricultural and residential water lines.',2.75,1.65,50,15,'Aisle 2, Shelf B','2026-01-01T00:00:00Z'),
('prod-006','PLUM-HOS-16IN','Stainless Steel Flex Hose Connector 1/2 in. x 1/2 in. (16 in.)','Plumbing','High-pressure braided stainless steel supply line for connecting water shut-off valves to faucets or toilets.',5.25,3.15,30,10,'Aisle 2, Shelf C','2026-01-01T00:00:00Z'),
('prod-007','TOOL-HAM-16OZ','Heavy-Duty Claw Hammer 16 oz (Fiberglass Handle)','Tools','Forged high-carbon steel hammer with a non-slip rubber grip handle designed for nail driving and pulling.',12.99,7.79,18,5,'Aisle 3, Shelf A','2026-01-01T00:00:00Z'),
('prod-008','TOOL-MTR-CLAMP','Digital Clamp Multimeter (AC/DC)','Tools','Handheld electrical diagnostic tool measuring voltage, continuity, resistance, and current draw without breaking the circuit.',34.50,20.70,8,3,'Aisle 3, Shelf B','2026-01-01T00:00:00Z'),
('prod-009','TOOL-BIT-32PC','Impact Driver Bit Set (32-Piece Screwdriving Kit)','Tools','Heat-treated steel screwdriver bit collection built to withstand high torque outputs from cordless impact drivers.',16.00,9.60,22,6,'Aisle 3, Shelf C','2026-01-01T00:00:00Z'),
('prod-010','FAST-ANC-M10','Hex Head Anchor Wedge Bolts M10 x 80mm (Pack of 20)','Fasteners & Hardware','Heavy-duty concrete anchor bolts used for securing structural timber, steel brackets, and heavy machinery to masonry.',9.50,5.70,35,10,'Aisle 4, Shelf A','2026-01-01T00:00:00Z'),
('prod-011','FAST-SCR-DRY1KG','Drywall Screws Bugle Head #6 x 1-1/2 in. (1 kg Box)','Fasteners & Hardware','Black phosphate-coated sharp-point screws engineered for attaching gypsum drywall boards to wood framing.',7.80,4.68,50,12,'Aisle 4, Shelf B','2026-01-01T00:00:00Z'),
('prod-012','FAST-PAD-50MM','Heavy-Duty Brass Padlock 50mm','Fasteners & Hardware','Solid brass body padlock featuring a hardened steel shackle and double-locking pin mechanism for outdoor gates and storage units.',11.25,6.75,14,4,'Aisle 4, Shelf C','2026-01-01T00:00:00Z'),
('prod-013','SAFE-GLV-LTHR','Heavy-Duty Leather Working Gloves (Large)','Safety & Security','Abrasion-resistant split cowhide leather gloves providing palm and knuckle protection during construction material handling.',8.50,5.10,25,8,'Aisle 5, Shelf A','2026-01-01T00:00:00Z'),
('prod-014','SAFE-GGL-ANSI','ANSI Z87.1 Clear Safety Goggles','Safety & Security','Impact-resistant polycarbonate eye protection with anti-fog vents for grinding, drilling, and chemical splash safety.',4.25,2.55,30,10,'Aisle 5, Shelf B','2026-01-01T00:00:00Z'),
('prod-015','SAFE-SMK-9VB','Photoelectric Smoke & Fire Alarm (9V Battery)','Safety & Security','Wall or ceiling-mounted smoke detector featuring a 85dB audible alarm siren and manual test/hush button.',18.99,11.39,10,3,'Aisle 5, Shelf C','2026-01-01T00:00:00Z')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  unit_price = EXCLUDED.unit_price,
  cost_price = EXCLUDED.cost_price,
  stock = EXCLUDED.stock,
  min_stock_level = EXCLUDED.min_stock_level,
  location = EXCLUDED.location,
  updated_at = EXCLUDED.updated_at;

-- ── USERS ──────────────────────────────────────────────────
INSERT INTO public.hw_users (id, name, username, email, password, role, status, created_at) VALUES
('user-owner-1','Robert Hayes','owner','admin@hardwaretrack.com','owner123','owner','active','2024-01-01T00:00:00Z'),
('user-staff-1','John Roel F. Lamoste','jrlamoste','johnroel.lamoste@store.com','staff123','staff','active','2024-02-01T00:00:00Z'),
('user-staff-2','Clarenz Noel T. Montesclaros','cntmontesclaros','clarenz.montesclaros@store.com','staff123','staff','active','2024-02-15T00:00:00Z'),
('user-staff-3','Kenneth Humphrey N. Semblante','khnsemblante','kenneth.semblante@store.com','staff123','staff','active','2024-03-01T00:00:00Z'),
('user-staff-4','Joshua Mercado','jmercado','joshua.mercado@store.com','staff123','staff','active','2024-03-15T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

