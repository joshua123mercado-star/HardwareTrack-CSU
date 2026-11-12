'use client';

import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  Printer,
  RotateCcw,
  Receipt,
  AlertTriangle,
} from 'lucide-react';
import { useHardwareStore } from '@/lib/store';
import { Product, SaleTransaction } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StockBadge, Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';

export default function RecordSalePOSPage() {
  const {
    products,
    cart,
    cartSubtotal,
    cartTax,
    cartTotal,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    processSale,
    currentUser,
  } = useHardwareStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Digital Transfer'>('Cash');
  const [tenderedAmount, setTenderedAmount] = useState<string>('');
  const [saleError, setSaleError] = useState<string | null>(null);

  // Success dialog & receipt state
  const [completedSale, setCompletedSale] = useState<SaleTransaction | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Filter products for quick selection
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === 'All' || p.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, selectedCategory]);

  // Check if any cart item exceeds currently available stock
  const stockViolations = useMemo(() => {
    const violations: { productId: string; name: string; requested: number; available: number }[] = [];
    for (const item of cart) {
      const prod = products.find(p => p.id === item.product.id);
      const available = prod ? prod.stock : 0;
      if (item.quantity > available) {
        violations.push({
          productId: item.product.id,
          name: item.product.name,
          requested: item.quantity,
          available,
        });
      }
    }
    return violations;
  }, [cart, products]);

  const hasStockError = stockViolations.length > 0;

  // Tendered and change calculation
  const tenderedNum = parseFloat(tenderedAmount || '0');
  const changeDue = paymentMethod === 'Cash' && tenderedNum >= cartTotal ? tenderedNum - cartTotal : 0;
  const isInsufficientCash = paymentMethod === 'Cash' && cartTotal > 0 && tenderedNum < cartTotal;

  // Add product to cart handler
  const handleAddProduct = (product: Product) => {
    setSaleError(null);
    if (product.stock <= 0) {
      setSaleError(`Cannot add "${product.name}": Product is currently OUT OF STOCK.`);
      return;
    }
    const result = addToCart(product.id, 1);
    if (!result.success) {
      setSaleError(result.message || 'Could not add product to cart.');
    }
  };

  // Complete checkout handler (Flowchart 2)
  const handleCompleteSale = () => {
    setSaleError(null);

    if (cart.length === 0) {
      setSaleError('Cart is empty. Add products before completing the sale.');
      return;
    }

    if (hasStockError) {
      setSaleError('Cannot proceed: One or more cart items exceed available warehouse stock.');
      return;
    }

    if (paymentMethod === 'Cash' && tenderedNum < cartTotal) {
      setSaleError(`Insufficient cash tendered. Total is ${formatCurrency(cartTotal)}.`);
      return;
    }

    const result = processSale(
      paymentMethod,
      paymentMethod === 'Cash' ? tenderedNum : cartTotal
    );

    if (result.success && result.sale) {
      setCompletedSale(result.sale);
      setIsReceiptModalOpen(true);
      setTenderedAmount('');
    } else {
      setSaleError(result.error || 'Failed to complete sale transaction.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-blue-600" />
            Point of Sale Terminal (POS)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Flowchart 2: Real-time stock validation, automated inventory deduction, and receipt generation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-medium">
            Cashier: <strong className="text-blue-600 ml-1">{currentUser?.name || 'Staff'}</strong>
          </Badge>
          {cart.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearCart}
              className="text-xs text-red-600 hover:bg-red-50 hover:border-red-300 h-8"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Clear Cart
            </Button>
          )}
        </div>
      </div>

      {/* Main Two-Column POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Columns: Product Selection Grid */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-slate-200  shadow-xs">
            <CardHeader className="p-4 pb-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search hardware by name, SKU..."
                    className="pl-10 h-10 text-sm"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  aria-label="Filter products by hardware department"
                  className="h-10 px-3 text-xs rounded-lg border border-slate-300  bg-white  text-slate-800 "
                >
                  <option value="All">All Departments</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Tools">Tools</option>
                  <option value="Fasteners & Hardware">Fasteners</option>
                  <option value="Paint & Building">Paint & Building</option>
                  <option value="Safety & Security">Safety</option>
                </select>
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[560px] overflow-y-auto pr-1">
                {filteredProducts.map(product => {
                  const isOutOfStock = product.stock <= 0;

                  return (
                    <button
                      key={product.id}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => handleAddProduct(product)}
                      className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                        isOutOfStock
                          ? 'opacity-50 bg-slate-100 /40 border-slate-200  cursor-not-allowed'
                          : 'bg-white  border-slate-200  hover:border-amber-500 hover:shadow-md'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>{product.sku}</span>
                          <span className="font-semibold text-amber-700 dark:text-amber-400">
                            {product.category}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2">
                          {product.name}
                        </h4>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100  flex items-center justify-between">
                        <span className="text-base font-black text-slate-900 dark:text-white">
                          {formatCurrency(product.unitPrice)}
                        </span>

                        <div className="text-right">
                          <StockBadge stock={product.stock} minStockLevel={product.minStockLevel} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 5 Columns: Register Cart & Flowchart 2 Checkout */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-slate-200  shadow-md">
            <CardHeader className="p-4 border-b border-slate-200  flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-blue-600" />
                  Current Sale Items
                </CardTitle>
                <CardDescription className="text-xs">
                  {cart.length === 0 ? 'No items in ticket' : `${cart.length} unique line item(s)`}
                </CardDescription>
              </div>

              <span className="font-mono text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded">
                Register #1
              </span>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* Error Alert: General or Insufficient stock */}
              {(saleError || hasStockError) && (
                <Alert variant="destructive" className="py-2.5">
                  <AlertTitle className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="h-4 w-4" />
                    Insufficient stock
                  </AlertTitle>
                  <AlertDescription>
                    {saleError && <p>{saleError}</p>}
                    {hasStockError && (
                      <div className="mt-1 space-y-1">
                        {stockViolations.map(v => (
                          <p key={v.productId} className="text-xs">
                            • <strong>{v.name}</strong>: Requested {v.requested}, but only{' '}
                            <strong>{v.available}</strong> in stock.
                          </p>
                        ))}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Cart Items List */}
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <ShoppingCart className="h-8 w-8 mx-auto text-slate-300 " />
                    <p className="text-xs font-semibold">Ready for customer sale</p>
                    <p className="text-[11px]">Click items from the catalog on the left to add them to this sale ticket.</p>
                  </div>
                ) : (
                  cart.map(item => {
                    const prod = products.find(p => p.id === item.product.id);
                    const availableStock = prod ? prod.stock : 0;
                    const isExceeded = item.quantity > availableStock;

                    return (
                      <div
                        key={item.product.id}
                        className={`p-3 rounded-xl border text-xs transition-colors ${
                          isExceeded
                            ? 'border-red-300 bg-red-50/60 dark:border-red-800 dark:bg-red-950/40'
                            : 'border-slate-200  bg-slate-50/50 /40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 truncate">
                              {item.product.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              SKU: {item.product.sku} • {formatCurrency(item.product.unitPrice)} ea
                            </p>
                            {isExceeded && (
                              <span className="inline-block text-[10px] font-bold text-red-600 mt-0.5">
                                ⚠ Insufficient stock (Available: {availableStock})
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-slate-400 hover:text-red-600 p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Quantity Counter & Subtotal */}
                        <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-200/60 /60">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                              className="h-6 w-6 rounded bg-white  border border-slate-300  flex items-center justify-center hover:bg-slate-100 font-bold"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center font-bold font-mono text-sm text-slate-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                              className="h-6 w-6 rounded bg-white  border border-slate-300  flex items-center justify-center hover:bg-slate-100 font-bold"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <span className="font-bold text-sm text-slate-900">
                            {formatCurrency(item.product.unitPrice * item.quantity)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Price Calculation Box */}
              <div className="pt-3 border-t border-slate-200  space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 ">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatCurrency(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600 ">
                  <span>Sales Tax (8%)</span>
                  <span className="font-mono">{formatCurrency(cartTax)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 ">
                  <span>Total Amount</span>
                  <span className="text-blue-600 font-mono">{formatCurrency(cartTotal)}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2 pt-2 border-t border-slate-200 ">
                <label className="text-xs font-semibold text-slate-700 ">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cash')}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'Cash'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-2 ring-blue-500/20'
                        : 'border-slate-200  hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 '
                    }`}
                  >
                    <Banknote className="h-4 w-4" />
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Card')}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'Card'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-2 ring-blue-500/20'
                        : 'border-slate-200  hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 '
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Digital Transfer')}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'Digital Transfer'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-2 ring-blue-500/20'
                        : 'border-slate-200  hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 '
                    }`}
                  >
                    <Smartphone className="h-4 w-4" />
                    Transfer
                  </button>
                </div>
              </div>

              {/* Cash Tendered Input & Change Output */}
              {paymentMethod === 'Cash' && cart.length > 0 && (
                <div className="p-3 bg-slate-50 /50 rounded-xl space-y-2 text-xs border border-slate-200 ">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 ">Amount Tendered ($):</span>
                    <Input
                      type="number"
                      step="0.01"
                      min={cartTotal}
                      value={tenderedAmount}
                      onChange={e => setTenderedAmount(e.target.value)}
                      placeholder={cartTotal.toFixed(2)}
                      className="w-28 text-right font-mono font-bold h-8 text-xs"
                    />
                  </div>
                  {tenderedNum >= cartTotal && (
                    <div className="flex items-center justify-between font-bold pt-1 text-emerald-600">
                      <span>Change Due:</span>
                      <span className="font-mono text-sm">{formatCurrency(changeDue)}</span>
                    </div>
                  )}
                  {isInsufficientCash && (
                    <p className="text-[11px] text-red-600 font-semibold">
                      Tendered amount is less than total amount.
                    </p>
                  )}
                </div>
              )}

              {/* Complete Checkout Button */}
              <Button
                type="button"
                disabled={cart.length === 0 || hasStockError || isInsufficientCash}
                onClick={handleCompleteSale}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                Complete Sale ({formatCurrency(cartTotal)})
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sale Receipt & Success Dialog */}
      <Dialog open={isReceiptModalOpen} onOpenChange={setIsReceiptModalOpen}>
        <DialogContent onClose={() => setIsReceiptModalOpen(false)} maxWidth="max-w-md">
          {completedSale && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mb-2">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <DialogTitle className="text-xl font-black">Transaction Completed!</DialogTitle>
                <DialogDescription>
                  Receipt #{completedSale.receiptNumber} recorded successfully.
                </DialogDescription>
              </div>

              {/* Receipt Visual Paper Ticket */}
              <div className="p-4 bg-slate-50 /80 rounded-xl border border-dashed border-slate-300  font-mono text-xs space-y-3">
                <div className="text-center border-b border-slate-200  pb-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">HARDWARE TRACK STORE</h3>
                  <p className="text-[10px] text-slate-500">123 Industrial Boulevard, Sector 4</p>
                  <p className="text-[10px] text-slate-500">{formatDate(completedSale.timestamp)}</p>
                </div>

                <div className="space-y-1 border-b border-slate-200  pb-2">
                  {completedSale.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <span className="truncate pr-2">
                        {item.quantity}x {item.productName}
                      </span>
                      <span className="shrink-0">{formatCurrency(item.lineTotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 text-right text-[11px]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(completedSale.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8%):</span>
                    <span>{formatCurrency(completedSale.tax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-1">
                    <span>TOTAL:</span>
                    <span>{formatCurrency(completedSale.total)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 pt-1">
                    <span>Paid via {completedSale.paymentMethod}:</span>
                    <span>{formatCurrency(completedSale.amountTendered || completedSale.total)}</span>
                  </div>
                  {completedSale.change !== undefined && completedSale.change > 0 && (
                    <div className="flex justify-between font-bold text-emerald-600">
                      <span>Change:</span>
                      <span>{formatCurrency(completedSale.change)}</span>
                    </div>
                  )}
                </div>

                <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-200 ">
                  <p>Cashier: {completedSale.cashierName}</p>
                  <p>Thank you for shopping with us!</p>
                </div>
              </div>

              <DialogFooter className="sm:justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.print()}
                  className="text-xs"
                >
                  <Printer className="h-3.5 w-3.5 mr-1" />
                  Print Receipt
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs"
                >
                  Start Next Sale
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


