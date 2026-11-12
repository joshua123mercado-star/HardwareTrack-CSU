'use client';

import React from 'react';
import Link from 'next/link';
import {
  Package,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useHardwareStore } from '@/lib/store';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardOverviewPage() {
  const { currentUser, products, sales, activityLogs } = useHardwareStore();
  const isOwner = currentUser?.role === 'owner';

  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= p.minStockLevel);
  const outOfStockProducts = products.filter(p => p.stock <= 0);
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);

  const recentSales = sales.slice(0, 5);
  const recentLogs = activityLogs.slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-blue-600 rounded-2xl p-6 text-white">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs uppercase tracking-wider font-bold bg-white/20 px-2.5 py-0.5 rounded-full">
              {currentUser?.role.toUpperCase()} CONSOLE
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {currentUser?.name}
          </h1>
          <p className="text-xs text-blue-100 mt-1 max-w-xl leading-relaxed">
            {isOwner
              ? 'Manage staff, review sales reports, and oversee inventory operations.'
              : 'Process sales, adjust inventory, and monitor low stock items.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href="/dashboard/sales/new">
            <Button className="bg-white text-blue-700 hover:bg-blue-50 font-semibold text-sm shadow-sm">
              <ShoppingCart className="h-4 w-4" />
              New Sale
            </Button>
          </Link>
          <Link href="/dashboard/inventory">
            <Button className="bg-blue-700 hover:bg-blue-800 text-white font-medium text-sm border border-blue-500">
              <Package className="h-4 w-4" />
              Inventory
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Products</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{products.length}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Hardware SKUs</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <Package className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Low Stock</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">{lowStockProducts.length}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Need restocking</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Out of Stock</p>
              <h3 className="text-2xl font-bold text-red-600 mt-1">{outOfStockProducts.length}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Reorder required</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                {isOwner ? 'Total Revenue' : 'Processed Sales'}
              </p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                {isOwner ? formatCurrency(totalRevenue) : `${sales.length}`}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isOwner ? `${sales.length} transactions` : 'Lifetime orders'}
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Banner */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-amber-900">
                Stock Attention Required
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                {outOfStockProducts.length} out of stock &amp; {lowStockProducts.length} low stock items need attention.
              </p>
            </div>
          </div>
          <Link href="/dashboard/inventory?filter=low" className="shrink-0">
            <Button size="sm" variant="outline" className="border-amber-300 bg-white hover:bg-amber-100 text-amber-900 text-xs font-semibold">
              Review Items
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Sales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm">
                <ShoppingCart className="h-4 w-4 text-blue-600" />
                Recent Sales
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">Latest POS transactions</CardDescription>
            </div>
            {isOwner && (
              <Link href="/dashboard/reports?tab=sales">
                <Button variant="ghost" size="sm" className="text-xs text-blue-600 h-7">
                  View All <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {recentSales.map(sale => (
              <div
                key={sale.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-800">
                      {sale.receiptNumber}
                    </span>
                    <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-medium">
                      {sale.paymentMethod}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {sale.items.length} item(s) · {sale.cashierName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{formatCurrency(sale.total)}</p>
                  <p className="text-[10px] text-slate-400">{formatDate(sale.timestamp)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-blue-600" />
                Stock Activity
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">Recent adjustments &amp; sales</CardDescription>
            </div>
            {isOwner && (
              <Link href="/dashboard/reports?tab=logs">
                <Button variant="ghost" size="sm" className="text-xs text-blue-600 h-7">
                  All Logs <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {recentLogs.map(log => {
              const isPositive = log.quantityChange > 0;
              const isNegative = log.quantityChange < 0;

              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        {log.productName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {log.sku}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {log.actionType} · {log.userName}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-flex items-center gap-0.5 text-xs font-bold ${
                        isNegative ? 'text-red-600' : isPositive ? 'text-emerald-600' : 'text-slate-500'
                      }`}
                    >
                      {isNegative && <ArrowDownRight className="h-3 w-3" />}
                      {isPositive && <ArrowUpRight className="h-3 w-3" />}
                      {isPositive ? `+${log.quantityChange}` : log.quantityChange} units
                    </span>
                    <p className="text-[10px] text-slate-400">Now: {log.newStock}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
