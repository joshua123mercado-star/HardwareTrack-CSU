'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  History,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Search,
  Package,
} from 'lucide-react';
import { useHardwareStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ActivityLogsPage() {
  const { currentUser, activityLogs } = useHardwareStore();
  const isOwner = currentUser?.role === 'owner';

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  // Filter logs (must be called unconditionally before early return)
  const filteredLogs = useMemo(() => {
    return activityLogs.filter(log => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        log.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.reason && log.reason.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesAction =
        actionFilter === 'all' || log.actionType === actionFilter;

      return matchesSearch && matchesAction;
    });
  }, [activityLogs, searchQuery, actionFilter]);

  // Role Gate: Owner Only
  if (!isOwner) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">
          Owner Authorization Required
        </h2>
        <p className="text-sm text-slate-600">
          System activity logs, audit trails, and inventory change histories are accessible only to the <strong>Store Owner</strong>.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <Link href="/dashboard/inventory">
            <Button variant="outline">Go to Inventory</Button>
          </Link>
          <Link href="/dashboard/sales/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Go to POS Terminal</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="h-6 w-6 text-blue-600" />
            Stock Activity Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete audit trail of stock adjustments, user IDs, sales deductions, and timestamps.
          </p>
        </div>

        <Link href="/dashboard/reports?tab=sales">
          <Button variant="outline" size="sm" className="text-xs">
            View Sales Reports
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search logs by product, SKU, cashier, or reason..."
                className="pl-9 h-10 text-sm"
              />
            </div>

            <div className="w-full sm:w-52">
              <Select
                value={actionFilter}
                onChange={e => setActionFilter(e.target.value)}
                aria-label="Filter by action type"
                className="h-10 text-sm"
              >
                <option value="all">All Action Types</option>
                <option value="Sale">Sale Deductions</option>
                <option value="Manual Adjustment">Manual Adjustments</option>
                <option value="Restock">Restock Shipments</option>
                <option value="Product Created">Product Created</option>
                <option value="Product Updated">Product Updated</option>
                <option value="Product Deleted">Product Deleted</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Audit Trail Entries
            </CardTitle>
            <CardDescription className="text-xs">
              Showing {filteredLogs.length} logged events
            </CardDescription>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[170px]">Timestamp</TableHead>
                <TableHead>Product &amp; SKU</TableHead>
                <TableHead className="text-center">Action Type</TableHead>
                <TableHead className="text-right">Quantity Change</TableHead>
                <TableHead className="text-center">Before → After</TableHead>
                <TableHead>Reason / Notes</TableHead>
                <TableHead>User / Cashier</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <Package className="h-7 w-7 text-slate-300" />
                      <p className="text-sm font-medium">No activity log records found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map(log => {
                  const isPositive = log.quantityChange > 0;
                  const isNegative = log.quantityChange < 0;

                  return (
                    <TableRow key={log.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-mono text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(log.timestamp)}
                      </TableCell>

                      <TableCell>
                        <p className="font-semibold text-xs text-slate-900 leading-snug">
                          {log.productName}
                        </p>
                        <span className="font-mono text-[10px] text-slate-400">
                          {log.sku}
                        </span>
                      </TableCell>

                      <TableCell className="text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          log.actionType === 'Sale'
                            ? 'bg-blue-50 text-blue-700'
                            : log.actionType === 'Restock'
                            ? 'bg-emerald-50 text-emerald-700'
                            : log.actionType === 'Product Deleted'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {log.actionType}
                        </span>
                      </TableCell>

                      <TableCell className="text-right font-bold text-xs">
                        <span className={`inline-flex items-center gap-0.5 ${
                          isNegative ? 'text-red-600' : isPositive ? 'text-emerald-600' : 'text-slate-500'
                        }`}>
                          {isNegative && <ArrowDownRight className="h-3 w-3" />}
                          {isPositive && <ArrowUpRight className="h-3 w-3" />}
                          {isPositive ? `+${log.quantityChange}` : log.quantityChange} units
                        </span>
                      </TableCell>

                      <TableCell className="text-center font-mono text-xs text-slate-500 whitespace-nowrap">
                        {log.previousStock} → <strong className="text-slate-800">{log.newStock}</strong>
                      </TableCell>

                      <TableCell className="text-xs text-slate-600 max-w-xs truncate">
                        {log.reason || '—'}
                      </TableCell>

                      <TableCell className="text-xs text-slate-700 whitespace-nowrap">
                        <span className="font-medium">{log.userName}</span>
                        <span className="block text-[10px] text-slate-400 font-mono">{log.userId}</span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

