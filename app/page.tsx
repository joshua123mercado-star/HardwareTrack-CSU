'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  PackageCheck,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Sparkles,
  Flame,
  Truck,
  Wrench,
  Tag,
  ArrowRight,
  ExternalLink,
  Shield,
  X,
} from 'lucide-react';
import { useHardwareStore } from '@/lib/store';
import { ProductCategory } from '@/lib/types';
import { formatCurrency, getStockStatus } from '@/lib/utils';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { Input } from '@/components/ui/input';
import { StockBadge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const CATEGORIES: ('All' | ProductCategory)[] = [
  'All',
  'Electrical',
  'Plumbing',
  'Tools',
  'Fasteners & Hardware',
  'Paint & Building',
  'Safety & Security',
];

export default function PublicStockPage() {
  const { products } = useHardwareStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProductCategory>('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [showTopAd, setShowTopAd] = useState(true);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory;

      const status = getStockStatus(product.stock, product.minStockLevel);
      let matchesStock = true;
      if (stockFilter === 'in_stock') matchesStock = status === 'IN STOCK';
      if (stockFilter === 'low_stock') matchesStock = status === 'LOW STOCK';
      if (stockFilter === 'out_of_stock') matchesStock = status === 'OUT OF STOCK';

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, stockFilter]);

  const inStockCount = products.filter(p => p.stock > p.minStockLevel).length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= p.minStockLevel).length;
  const outOfStockCount = products.filter(p => p.stock <= 0).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Promotional Bar / Ad Ribbon */}
      {showTopAd && (
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white px-4 py-2 text-xs flex items-center justify-between border-b border-blue-800 shadow-xs relative">
          <div className="mx-auto flex items-center gap-2 font-medium flex-wrap justify-center">
            <span className="bg-amber-400 text-slate-900 font-extrabold px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide flex items-center gap-1 shadow-xs">
              <Flame className="h-3 w-3 text-red-600" />
              HOT PROMO
            </span>
            <span>
              <strong>WEEKEND CONTRACTOR BLOWOUT:</strong> Get 20% off all bulk PVC pipes &amp; Romex cabling! Use code:
            </span>
            <span className="font-mono bg-white/20 border border-white/30 px-2 py-0.5 rounded text-[11px] font-bold tracking-wider">
              HARDWARE20
            </span>
            <span className="hidden md:inline text-blue-200">| In-store pickup only.</span>
          </div>
          <button
            onClick={() => setShowTopAd(false)}
            aria-label="Dismiss banner"
            className="text-white/70 hover:text-white p-1 rounded transition-colors ml-2"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <PublicHeader />

      {/* Hero Banner */}
      <section className="bg-white border-b border-slate-200 py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
              <Sparkles className="h-3 w-3" />
              Live Storefront Inventory
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Hardware &amp; Building Supplies
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Check real-time in-store stock, aisle locations, and pricing before your visit.
            </p>
          </div>

          {/* Stats Row */}
          <div className="mt-7 grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 text-slate-600 shrink-0">
                <PackageCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Items</p>
                <p className="text-lg font-bold text-slate-900">{products.length}</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-slate-500">In Stock</p>
                <p className="text-lg font-bold text-emerald-600">{inStockCount}</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Low Stock</p>
                <p className="text-lg font-bold text-amber-600">{lowStockCount}</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-50 text-red-600 shrink-0">
                <XCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Out of Stock</p>
                <p className="text-lg font-bold text-red-600">{outOfStockCount}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area: Products Grid + Sidebar Ads */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Search & Category Filter Controls */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name, SKU, or category (e.g. Romex, Drill, PEX)..."
                className="pl-9 h-10 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-slate-400 hidden sm:block shrink-0" />
              <select
                value={stockFilter}
                onChange={e => setStockFilter(e.target.value as 'all' | 'in_stock' | 'low_stock' | 'out_of_stock')}
                aria-label="Filter by stock status"
                className="h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
              >
                <option value="all">All Availability</option>
                <option value="in_stock">In Stock Only</option>
                <option value="low_stock">Low Stock Only</option>
                <option value="out_of_stock">Out of Stock Only</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Responsive Layout: Catalog on Left, Ads / Promotions on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Main Product Catalog (3 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Results count header */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>
                Showing <strong className="text-slate-800">{filteredProducts.length}</strong> items
                {selectedCategory !== 'All' && ` in ${selectedCategory}`}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <HelpCircle className="h-3 w-3" />
                Read-only public verification
              </span>
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
                <div className="mx-auto w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <Search className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">No products found</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Try adjusting your search query or switching categories.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setStockFilter('all');
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map(product => (
                  <Card
                    key={product.id}
                    className="flex flex-col hover:border-blue-300 hover:shadow-md transition-all group bg-white"
                  >
                    <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                            {product.category}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {product.sku}
                          </span>
                        </div>

                        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {product.name}
                        </h3>

                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-slate-100 space-y-2.5">
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-[10px] uppercase font-semibold text-slate-400">Unit Price</p>
                            <p className="text-lg font-bold text-slate-900">
                              {formatCurrency(product.unitPrice)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] uppercase font-semibold text-slate-400 mb-0.5">Status</p>
                            <StockBadge stock={product.stock} minStockLevel={product.minStockLevel} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
                          <span className="text-[11px]">
                            Available: <strong className="text-slate-800">{product.stock} units</strong>
                          </span>
                          {product.location && (
                            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              {product.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* In-Feed Banner Ad */}
            <div className="rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-5 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <div className="space-y-1 text-center sm:text-left">
                <span className="bg-white/20 text-white font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Partner Spotlight • Sponsored
                </span>
                <h3 className="text-base font-extrabold tracking-tight">
                  Makita &amp; DeWalt Pro-Tool Trade-In Event
                </h3>
                <p className="text-xs text-orange-100 max-w-lg">
                  Bring your old burned-out power drills or angle grinders to our service counter and get up to <strong>$50 store credit</strong> on any 20V brushless upgrade!
                </p>
              </div>
              <div className="shrink-0">
                <Button className="bg-white text-orange-700 hover:bg-orange-50 font-bold text-xs h-9 shadow-sm cursor-pointer">
                  Learn How to Trade-In
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Realistic Hardware Promotional & Sponsor Ads */}
          <aside className="lg:col-span-1 space-y-4">
            {/* Sidebar Ad 1: Contractor Account Sign Up */}
            <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 space-y-3 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                Ad
              </div>
              <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
                <Shield className="h-4 w-4" />
                <span>HardWareTrack PRO</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                Are You a Licensed General Contractor?
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Open a Commercial Pro Line of Credit today. Enjoy <strong>net-30 billing</strong>, dedicated loading bay access, and wholesale job-lot discounts.
              </p>
              <div className="pt-1">
                <Button variant="default" size="sm" className="w-full text-xs font-semibold h-8.5">
                  Apply for Pro Account
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>

            {/* Sidebar Ad 2: Heavy Material Delivery */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs relative">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">
                Sponsored Services
              </span>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Job-Site Flatbed Delivery</h4>
                  <p className="text-[11px] text-slate-500">Same-Day Delivery Available</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ordering cement bags, framing lumber, or 20ft PVC pipes? Have our heavy-duty crane flatbed drop materials straight onto your site.
              </p>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Starts at</span>
                <span className="font-bold text-emerald-700 text-sm">$39.99 flat-rate</span>
              </div>
            </div>

            {/* Sidebar Ad 3: Tool Rental & Blade Sharpening */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">
                Storefront Services
              </span>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Tool Rental &amp; Sharpening</h4>
                  <p className="text-[11px] text-slate-500">Aisle 1 - Service Bay</p>
                </div>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                <li>Demo Hammers &amp; Tile Saws</li>
                <li>Carbide Saw Blade Sharpening</li>
                <li>Pipe Threading While You Wait</li>
              </ul>
              <p className="text-[11px] text-slate-400 italic">
                Ask our floor team at the register for equipment reservation.
              </p>
            </div>

            {/* Sidebar Ad 4: Seasonal Clearance Banner */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-2 text-center">
              <div className="inline-flex items-center justify-center p-2 rounded-full bg-amber-100 text-amber-700 mb-1">
                <Tag className="h-4 w-4" />
              </div>
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                Clearance Bin Alerts
              </h4>
              <p className="text-xs text-amber-800">
                Discontinued brass fittings &amp; exterior halogen floodlights marked down by <strong>up to 60%</strong> in Aisle 6.
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 HardWareTrack. Real-time public stock catalog &amp; customer portal.</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-blue-600 hover:underline font-semibold flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Staff / Owner Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
