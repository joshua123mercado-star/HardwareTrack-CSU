'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3,
  History,
  Download,
  Printer,
  Calendar,
  DollarSign,
  TrendingUp,
  Receipt,
  Eye,
  ShieldAlert,
  Clock,
  Layers,
} from 'lucide-react';
import { useHardwareStore } from '@/lib/store';
import { SaleTransaction } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function ReportsContent() {
  const searchParams = useSearchParams();
  const { currentUser, sales, activityLogs } = useHardwareStore();
  const isOwner = currentUser?.role === 'owner';

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'sales' | 'logs'>(
    tabParam === 'logs' ? 'logs' : 'sales'
  );
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<SaleTransaction | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Filter Sales based on date range (called unconditionally)
  const filteredSales = useMemo(() => {
    const now = new Date().getTime();
    return sales.filter(s => {
      if (dateFilter === 'all') return true;
      const saleTime = new Date(s.timestamp).getTime();
      const diffDays = (now - saleTime) / (1000 * 3600 * 24);

      if (dateFilter === 'today') return diffDays <= 1;
      if (dateFilter === '7days') return diffDays <= 7;
      if (dateFilter === '30days') return diffDays <= 30;
      return true;
    });
  }, [sales, dateFilter]);

  // Role Gate: Owner Only
  if (!isOwner) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">
          Owner Authorization Required
        </h2>
        <p className="text-sm text-slate-600 ">
          Financial revenue data, margin reports, and system-wide inventory audit logs are accessible only to the <strong>Store Owner</strong>.
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

  // Aggregate KPI stats
  const totalRevenue = filteredSales.reduce((acc, s) => acc + s.total, 0);
  const totalOrders = filteredSales.length;
  const totalItemsSold = filteredSales.reduce(
    (acc, s) => acc + s.items.reduce((iAcc, item) => iAcc + item.quantity, 0),
    0
  );
  const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // CSV Export Generator
  const handleDownloadCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (activeTab === 'sales') {
      csvContent += 'Receipt Number,Date,Cashier,Items Count,Subtotal,Tax,Total,Payment Method\n';
      filteredSales.forEach(s => {
        csvContent += `"${s.receiptNumber}","${s.timestamp}","${s.cashierName}",${s.items.length},${s.subtotal},${s.tax},${s.total},"${s.paymentMethod}"\n`;
      });
    } else {
      csvContent += 'Timestamp,User,Action,Product,SKU,Quantity Change,Previous Stock,New Stock,Reason\n';
      activityLogs.forEach(l => {
        csvContent += `"${l.timestamp}","${l.userName}","${l.actionType}","${l.productName}","${l.sku}",${l.quantityChange},${l.previousStock},${l.newStock},"${l.reason || ''}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `HardwareTrack_${activeTab}_report_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              Executive Sales Reports & Audit Logs
            </h1>
            <Badge className="bg-amber-500/20 text-amber-500 border-blue-200 text-[10px] uppercase font-bold">
              Owner Analytics
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Analyze gross sales revenue, monitor cashier register performance, and inspect inventory activity logs.
          </p>
        </div>

        {/* Export & Print actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadCSV}
            className="text-xs font-semibold h-10 border-slate-300 "
          >
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>

          <Button
            size="sm"
            onClick={() => setIsExportModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-10 shadow-sm"
          >
            <Printer className="h-4 w-4 mr-1.5" />
            Print / PDF Report
          </Button>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center justify-between border-b border-slate-200 ">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('sales')}
            className={`pb-3 text-sm font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'sales'
                ? 'border-amber-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Sales Performance ({sales.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-3 text-sm font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'logs'
                ? 'border-amber-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <History className="h-4 w-4" />
            Stock Activity Audit Logs ({activityLogs.length})
          </button>
        </div>

        {/* Date Filter Dropdown */}
        {activeTab === 'sales' && (
          <div className="flex items-center gap-2 pb-2">
            <Calendar className="h-4 w-4 text-slate-400 hidden sm:block" />
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value as 'all' | 'today' | '7days' | '30days')}
              aria-label="Filter sales by date range"
              className="h-8 px-2.5 text-xs font-semibold rounded-lg border border-slate-300  bg-white  text-slate-800 "
            >
              <option value="all">All Dates</option>
              <option value="today">Past 24 Hours</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: Sales Performance Report */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          {/* Revenue KPI Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200  shadow-xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Gross Sales Revenue</p>
                  <h3 className="text-2xl font-black text-emerald-600 mt-1">
                    {formatCurrency(totalRevenue)}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Filter: {dateFilter}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                  <DollarSign className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200  shadow-xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Transactions</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">
                    {totalOrders}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Completed checkout receipts</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-blue-600">
                  <Receipt className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200  shadow-xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Hardware Units Sold</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">
                    {totalItemsSold}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Deducted from stock</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-slate-100  flex items-center justify-center text-slate-700 ">
                  <Layers className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200  shadow-xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Average Ticket Size</p>
                  <h3 className="text-2xl font-black text-blue-600 mt-1">
                    {formatCurrency(averageTicket)}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Revenue per checkout</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-blue-600">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sales Transactions Table */}
          <Card className="border-slate-200  shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt #</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Cashier</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                        No sales recorded for the selected time window.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSales.map(sale => (
                      <TableRow key={sale.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40">
                        <TableCell className="font-mono text-xs font-bold text-slate-900">
                          {sale.receiptNumber}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {formatDate(sale.timestamp)}
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-slate-700 ">
                          {sale.cashierName}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 ">
                          {sale.items.length} item(s)
                        </TableCell>
                        <TableCell>
                          <span className="text-[11px] font-semibold bg-slate-100  px-2 py-0.5 rounded text-slate-700 ">
                            {sale.paymentMethod}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-black text-sm text-slate-900">
                          {formatCurrency(sale.total)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedReceipt(sale)}
                            className="h-8 text-xs text-blue-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-zinc-800"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View Receipt
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: Stock Activity Audit Logs */}
      {activeTab === 'logs' && (
        <Card className="border-slate-200  shadow-xs overflow-hidden">
          <CardHeader className="p-4 border-b border-slate-200 ">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Stock Activity Audit Trail
            </CardTitle>
            <CardDescription className="text-xs">
              Every inventory addition, sale deduction, restock, and physical count recount is immutably recorded with user and timestamp.
            </CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User / Cashier</TableHead>
                  <TableHead>Action Type</TableHead>
                  <TableHead>Hardware Item</TableHead>
                  <TableHead className="text-center">Stock Change</TableHead>
                  <TableHead className="text-center">Stock Path</TableHead>
                  <TableHead>Reason / Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activityLogs.map(log => {
                  const isPositive = log.quantityChange > 0;
                  const isNegative = log.quantityChange < 0;

                  return (
                    <TableRow key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40">
                      <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(log.timestamp)}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-800  whitespace-nowrap">
                        {log.userName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            log.actionType === 'Sale'
                              ? 'secondary'
                              : log.actionType === 'Product Deleted'
                              ? 'destructive'
                              : log.actionType === 'Restock'
                              ? 'success'
                              : 'warning'
                          }
                          className="text-[10px] uppercase font-bold"
                        >
                          {log.actionType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-bold text-xs text-slate-900">
                            {log.productName}
                          </p>
                          <p className="font-mono text-[10px] text-slate-400">
                            {log.sku}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-mono font-bold text-xs whitespace-nowrap">
                        <span
                          className={
                            isNegative
                              ? 'text-red-600'
                              : isPositive
                              ? 'text-emerald-600'
                              : 'text-slate-500'
                          }
                        >
                          {isPositive ? `+${log.quantityChange}` : log.quantityChange} units
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs text-slate-500 whitespace-nowrap">
                        {log.previousStock} → <strong className="text-slate-900">{log.newStock}</strong>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {log.reason || '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Modal: View Receipt Details */}
      <Dialog open={!!selectedReceipt} onOpenChange={open => !open && setSelectedReceipt(null)}>
        <DialogContent onClose={() => setSelectedReceipt(null)} maxWidth="max-w-md">
          {selectedReceipt && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-center">Receipt #{selectedReceipt.receiptNumber}</DialogTitle>
                <DialogDescription className="text-center">
                  Executed on {formatDate(selectedReceipt.timestamp)} by {selectedReceipt.cashierName}
                </DialogDescription>
              </DialogHeader>

              <div className="p-4 bg-slate-50 /80 rounded-xl border border-dashed border-slate-300  font-mono text-xs space-y-3">
                <div className="space-y-1.5 border-b border-slate-200  pb-2">
                  {selectedReceipt.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="truncate pr-2">
                        {item.quantity}x {item.productName}
                      </span>
                      <span>{formatCurrency(item.lineTotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 text-right text-xs">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedReceipt.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8%):</span>
                    <span>{formatCurrency(selectedReceipt.tax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-1">
                    <span>Total:</span>
                    <span>{formatCurrency(selectedReceipt.total)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Payment Method:</span>
                    <span>{selectedReceipt.paymentMethod}</span>
                  </div>
                </div>
              </div>

              <DialogFooter className="sm:justify-between">
                <Button variant="outline" onClick={() => window.print()} className="text-xs">
                  <Printer className="h-3.5 w-3.5 mr-1" />
                  Print Receipt
                </Button>
                <Button onClick={() => setSelectedReceipt(null)} className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal: PDF / Print Report Preview */}
      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent onClose={() => setIsExportModalOpen(false)} maxWidth="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Executive Report Print Preview</DialogTitle>
            <DialogDescription>
              Ready for accounting export or physical print filing.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 bg-white  border border-slate-200  rounded-xl space-y-4 text-xs font-sans">
            <div className="flex justify-between border-b pb-4">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">HARDWARETRACK MANAGEMENT REPORT</h3>
                <p className="text-slate-500">Period: {dateFilter.toUpperCase()} • Generated by {currentUser?.name}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-600 text-base">{formatCurrency(totalRevenue)}</p>
                <p className="text-slate-500">Total Net Revenue</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center py-2 bg-slate-50 /50 rounded-lg">
              <div>
                <p className="text-slate-500">Total Orders</p>
                <p className="font-bold text-sm text-slate-900">{totalOrders}</p>
              </div>
              <div>
                <p className="text-slate-500">Items Sold</p>
                <p className="font-bold text-sm text-slate-900">{totalItemsSold}</p>
              </div>
              <div>
                <p className="text-slate-500">Average Ticket</p>
                <p className="font-bold text-sm text-blue-600">{formatCurrency(averageTicket)}</p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="font-bold text-slate-800 ">Recent Transactions Summary:</p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {filteredSales.slice(0, 8).map(s => (
                  <div key={s.id} className="flex justify-between border-b border-slate-100  py-1">
                    <span>{s.receiptNumber} ({s.items.length} items)</span>
                    <span className="font-bold">{formatCurrency(s.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                window.print();
                setIsExportModalOpen(false);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              <Printer className="h-4 w-4 mr-1.5" />
              Send to Printer / Save PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading reports...</div>}>
      <ReportsContent />
    </Suspense>
  );
}


