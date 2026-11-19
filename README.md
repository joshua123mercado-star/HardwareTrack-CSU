# HardWareTrack — Hardware Inventory & POS System

HardWareTrack is a full-stack hardware store inventory management and Point-of-Sale (POS) web application built with **Next.js (App Router, TypeScript)**, **Tailwind CSS**, **shadcn/ui**, and **Supabase (PostgreSQL)**.

---

## Core Features & Roles

- **Public Customer Catalog (`/` or `/public`)**: Read-only storefront allowing customers to search and filter products by category, view retail prices, and check real-time stock status (`In Stock`, `Low Stock`, `Out of Stock`) without logging in.
- **Staff Portal (`/dashboard`)**: Add and edit products, perform manual stock adjustments, record POS sales with automatic stock deduction and insufficient-stock validation, and monitor low-stock alerts.
- **Owner Portal (`/dashboard`)**: Full staff access plus product deletion, staff account management (create, deactivate, reset passwords), date-filtered sales reports with print/export options, and a complete stock activity audit log.

---

## Tech Stack

- **Framework:** Next.js (App Router, TypeScript)
- **Styling & UI:** Tailwind CSS, shadcn/ui, Lucide Icons
- **Database & Auth:** Supabase (PostgreSQL, Row Level Security)
- **Deployment:** Vercel

---

## Local Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/joshua123mercado-star/HardwareTrack-CSU.git](https://github.com/joshua123mercado-star/HardwareTrack-CSU.git)
   cd HardwareTrack-CSU