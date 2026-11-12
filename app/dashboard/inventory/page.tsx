'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Sliders,
  ShieldAlert,
} from 'lucide-react';
import { useHardwareStore } from '@/lib/store';
import { Product, ProductCategory } from '@/lib/types';
import { formatCurrency, getStockStatus } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { StockBadge, Badge } from '@/components/ui/badge';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const CATEGORIES: ProductCategory[] = [
  'Electrical',
  'Plumbing',
  'Tools',
  'Fasteners & Hardware',
  'Paint & Building',
  'Safety & Security',
];

function InventoryContent() {
  const searchParams = useSearchParams();
  const { currentUser, products, addProduct, updateProduct, deleteProduct, adjustStock } = useHardwareStore();
  const isOwner = currentUser?.role === 'owner';

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const filterParam = searchParams.get('filter');
  const [statusFilter, setStatusFilter] = useState<'All' | 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK'>(
    filterParam === 'low' ? 'LOW STOCK' : 'All'
  );

  // Modal Dialog states
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isAdjustStockDialogOpen, setIsAdjustStockDialogOpen] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustNewStock, setAdjustNewStock] = useState<string>('0');
  const [adjustReason, setAdjustReason] = useState<string>('');

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Form states for Add / Edit
  const [formSku, setFormSku] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('Tools');
  const [formDescription, setFormDescription] = useState('');
  const [formUnitPrice, setFormUnitPrice] = useState<string>('19.99');
  const [formCostPrice, setFormCostPrice] = useState<string>('10.00');
  const [formStock, setFormStock] = useState<string>('10');
  const [formMinStockLevel, setFormMinStockLevel] = useState<string>('5');
  const [formLocation, setFormLocation] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Open Add Dialog
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormSku(`HW-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormName('');
    setFormCategory('Tools');
    setFormDescription('');
    setFormUnitPrice('19.99');
    setFormCostPrice('10.00');
    setFormStock('10');
    setFormMinStockLevel('5');
    setFormLocation('Aisle 1');
    setFormError(null);
    setIsAddEditDialogOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormSku(product.sku);
    setFormName(product.name);
    setFormCategory(product.category);
    setFormDescription(product.description || '');
    setFormUnitPrice(product.unitPrice.toString());
    setFormCostPrice(product.costPrice.toString());
    setFormStock(product.stock.toString());
    setFormMinStockLevel(product.minStockLevel.toString());
    setFormLocation(product.location || '');
    setFormError(null);
    setIsAddEditDialogOpen(true);
  };

  // Save Add/Edit
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const unitPriceNum = parseFloat(formUnitPrice);
    const costPriceNum = parseFloat(formCostPrice);
    const stockNum = parseInt(formStock, 10);
    const minStockNum = parseInt(formMinStockLevel, 10);

    // Validation rules: positive unit price, non-negative stock numbers
    if (!formName.trim()) {
      setFormError('Product name is required.');
      return;
    }
    if (isNaN(unitPriceNum) || unitPriceNum <= 0) {
      setFormError('Unit price must be a strictly positive number (> 0).');
      return;
    }
    if (isNaN(costPriceNum) || costPriceNum < 0) {
      setFormError('Cost price must be non-negative (>= 0).');
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      setFormError('Current stock must be a non-negative number (>= 0).');
      return;
    }
    if (isNaN(minStockNum) || minStockNum < 0) {
      setFormError('Minimum stock level must be non-negative (>= 0).');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        sku: formSku.trim(),
        name: formName.trim(),
        category: formCategory,
        description: formDescription.trim(),
        unitPrice: unitPriceNum,
        costPrice: costPriceNum,
        stock: stockNum,
        minStockLevel: minStockNum,
        location: formLocation.trim(),
      });
    } else {
      addProduct({
        sku: formSku.trim() || `HW-${Math.floor(1000 + Math.random() * 9000)}`,
        name: formName.trim(),
        category: formCategory,
        description: formDescription.trim(),
        unitPrice: unitPriceNum,
        costPrice: costPriceNum,
        stock: stockNum,
        minStockLevel: minStockNum,
        location: formLocation.trim(),
      });
    }

    setIsAddEditDialogOpen(false);
  };

  // Open Adjust Stock Dialog
  const handleOpenAdjust = (product: Product) => {
    setAdjustingProduct(product);
    setAdjustNewStock(String(product.stock));
    setAdjustReason('Physical inventory recount');
    setIsAdjustStockDialogOpen(true);
  };

  const handleSaveAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    const newStockNum = parseInt(adjustNewStock, 10);
    if (isNaN(newStockNum) || newStockNum < 0) return;

    adjustStock(adjustingProduct.id, newStockNum, adjustReason);
    setIsAdjustStockDialogOpen(false);
  };

  // Open Delete Dialog
  const handleOpenDelete = (product: Product) => {
    if (!isOwner) return;
    setDeletingProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingProduct) {
      deleteProduct(deletingProduct.id);
      setIsDeleteDialogOpen(false);
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === 'All' || product.category === selectedCategory;

      const status = getStockStatus(product.stock, product.minStockLevel);
      const matchesStatus =
        statusFilter === 'All' || status === statusFilter;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [products, searchQuery, selectedCategory, statusFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Inventory Management
            </h1>
            <Badge variant="outline" className="text-xs font-mono font-semibold text-slate-500">
              {products.length} Products
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track hardware stock, audit inventory thresholds, and perform stock adjustments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleOpenAdd}
            className="text-xs sm:text-sm h-9 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by SKU, name, or category..."
                className="pl-9 h-10 text-sm"
              />
            </div>

            {/* Category Dropdown */}
            <div className="w-full md:w-48">
              <Select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                aria-label="Filter by hardware category"
                className="h-10 text-sm"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs overflow-x-auto shrink-0">
              {(['All', 'IN STOCK', 'LOW STOCK', 'OUT OF STOCK'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {st === 'All' ? 'All Status' : st}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">SKU</TableHead>
                <TableHead>Product Name & Category</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                {isOwner && <TableHead className="text-right">Cost Price</TableHead>}
                <TableHead className="text-center">Current Stock</TableHead>
                <TableHead className="text-center">Min Level</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isOwner ? 8 : 7} className="h-36 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Package className="h-8 w-8 text-slate-300" />
                      <p className="font-semibold text-sm">No products found</p>
                      <p className="text-xs text-slate-400">Try adjusting your search or add a new product.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map(product => {
                  return (
                    <TableRow key={product.id} className="hover:bg-slate-50 transition-colors">
                      {/* SKU */}
                      <TableCell className="font-mono text-xs font-semibold text-slate-500">
                        {product.sku}
                      </TableCell>

                      {/* Product Name & Category */}
                      <TableCell>
                        <div>
                          <p className="font-semibold text-sm text-slate-900 leading-snug">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                              {product.category}
                            </span>
                            {product.location && (
                              <span className="text-[10px] text-slate-400">
                                📍 {product.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Retail Price */}
                      <TableCell className="text-right font-semibold text-sm text-slate-900">
                        {formatCurrency(product.unitPrice)}
                      </TableCell>

                      {/* Cost Price (Owner Only) */}
                      {isOwner && (
                        <TableCell className="text-right font-mono text-xs text-slate-400">
                          {formatCurrency(product.costPrice)}
                        </TableCell>
                      )}

                      {/* Current Stock */}
                      <TableCell className="text-center font-bold text-base">
                        <span
                          className={
                            product.stock === 0
                              ? 'text-red-600'
                              : product.stock <= product.minStockLevel
                              ? 'text-amber-600'
                              : 'text-slate-900'
                          }
                        >
                          {product.stock}
                        </span>
                      </TableCell>

                      {/* Min Stock Level */}
                      <TableCell className="text-center font-mono text-xs text-slate-400">
                        {product.minStockLevel}
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell className="text-center">
                        <StockBadge stock={product.stock} minStockLevel={product.minStockLevel} />
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenAdjust(product)}
                            className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                            title="Adjust Stock"
                          >
                            <Sliders className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(product)}
                            className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                            title="Edit Product"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>

                          {isOwner && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDelete(product)}
                              className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                              title="Delete Product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Modal: Add / Edit Product */}
      <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
        <DialogContent onClose={() => setIsAddEditDialogOpen(false)} maxWidth="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product Details' : 'Add New Hardware Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct
                ? 'Update pricing, minimum safety thresholds, and specifications.'
                : 'Fill in details to register a new item in the store inventory catalog.'}
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Validation Error</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSaveProduct} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  SKU (Item Code) *
                </label>
                <Input
                  value={formSku}
                  onChange={e => setFormSku(e.target.value)}
                  placeholder="e.g. ELEC-ROM-250"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Category *
                </label>
                <Select
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value as ProductCategory)}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Product Name *
              </label>
              <Input
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="e.g. 12/2 Solid Copper Romex NM-B Cable (250 ft)"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Description & Technical Specs
              </label>
              <Input
                value={formDescription}
                onChange={e => setFormDescription(e.target.value)}
                placeholder="Brief details, dimensions, voltage rating, etc."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Retail Unit Price ($) * (Positive Number &gt; 0)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formUnitPrice}
                  onChange={e => setFormUnitPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Internal Cost Price ($) (&ge; 0)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formCostPrice}
                  onChange={e => setFormCostPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Current Stock * (&ge; 0)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={formStock}
                  onChange={e => setFormStock(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Min Stock Level * (&ge; 0)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={formMinStockLevel}
                  onChange={e => setFormMinStockLevel(e.target.value)}
                  placeholder="5"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Store Location
                </label>
                <Input
                  value={formLocation}
                  onChange={e => setFormLocation(e.target.value)}
                  placeholder="Aisle 2 - Shelf B"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                {editingProduct ? 'Save Product Changes' : 'Create Hardware Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Manual Stock Adjustment */}
      <Dialog open={isAdjustStockDialogOpen} onOpenChange={setIsAdjustStockDialogOpen}>
        <DialogContent onClose={() => setIsAdjustStockDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>Manual Stock Adjustment</DialogTitle>
            <DialogDescription>
              Directly adjust stock counts for physical inventory audits, damage write-offs, or restock deliveries.
            </DialogDescription>
          </DialogHeader>

          {adjustingProduct && (
            <form onSubmit={handleSaveAdjust} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                <p className="font-bold text-zinc-900 dark:text-zinc-100">{adjustingProduct.name}</p>
                <p className="text-slate-400 font-mono">SKU: {adjustingProduct.sku}</p>
                <p className="text-slate-700">
                  Current Recorded Stock: <strong className="text-blue-600">{adjustingProduct.stock} units</strong>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  New Stock Count (Units) *
                </label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={adjustNewStock}
                  onChange={e => setAdjustNewStock(e.target.value)}
                  required
                  className="font-mono text-base font-bold"
                />
                <p className="text-[11px] text-zinc-400">
                  {(() => {
                    const diff = (parseInt(adjustNewStock, 10) || 0) - adjustingProduct.stock;
                    return `Net adjustment: ${diff > 0 ? `+${diff}` : diff} units`;
                  })()}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Adjustment Reason *
                </label>
                <Select
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                >
                  <option value="Physical inventory recount">Physical inventory recount</option>
                  <option value="Restock delivery shipment">Restock delivery shipment</option>
                  <option value="Damaged or defective write-off">Damaged or defective write-off</option>
                  <option value="Returned customer item">Returned customer item</option>
                  <option value="Internal shop usage">Internal shop usage</option>
                </Select>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAdjustStockDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  Confirm Stock Adjustment
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal: Delete Confirmation (Owner Only) */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent onClose={() => setIsDeleteDialogOpen(false)}>
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400 mb-2">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center">Confirm Product Deletion</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to permanently delete{' '}
              <strong className="text-zinc-900 dark:text-zinc-100">&quot;{deletingProduct?.name}&quot;</strong>?
              This action is logged in the owner audit trail and cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="sm:justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Permanently Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-zinc-500">Loading inventory...</div>}>
      <InventoryContent />
    </Suspense>
  );
}


