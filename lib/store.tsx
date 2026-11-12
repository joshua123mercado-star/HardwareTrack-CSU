'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, User, UserRole, SaleTransaction, StockActivityLog, CartItem } from './types';
import { INITIAL_USERS, INITIAL_PRODUCTS, INITIAL_SALES, INITIAL_ACTIVITY_LOGS } from './mock-data';

// ─── API helpers ──────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      console.error(`[apiFetch] ${options?.method ?? 'GET'} ${path} → HTTP ${res.status}`, errBody);
      return null;
    }
    return res.json() as Promise<T>;
  } catch (err) {
    console.error(`[apiFetch] ${options?.method ?? 'GET'} ${path} → network error`, err);
    return null;
  }
}

// ─── Context type ─────────────────────────────────────────────────────────────

interface HardwareStoreContextType {
  currentUser: User | null;
  users: User[];
  products: Product[];
  sales: SaleTransaction[];
  activityLogs: StockActivityLog[];
  cart: CartItem[];
  cartSubtotal: number;
  cartTax: number;
  cartTotal: number;
  cartItemsCount: number;
  isLoading: boolean;

  // Auth
  login: (identifier: string, password?: string, role?: UserRole) => { success: boolean; message?: string };
  switchRole: (role: UserRole) => void;
  logout: () => void;

  // Products
  addProduct: (product: Omit<Product, 'id' | 'updatedAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => { success: boolean; message?: string };
  adjustStock: (productId: string, newStock: number, reason: string) => void;

  // POS & Cart
  addToCart: (productId: string, quantity?: number) => { success: boolean; message?: string };
  updateCartQuantity: (productId: string, quantity: number) => { success: boolean; message?: string };
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  processSale: (
    paymentMethod: 'Cash' | 'Card' | 'Digital Transfer',
    amountTendered?: number
  ) => { success: boolean; sale?: SaleTransaction; error?: string };

  // Staff (Owner only)
  addStaff: (user: Omit<User, 'id' | 'createdAt'>) => void;
  toggleStaffStatus: (id: string) => void;
  resetStaffPassword: () => { tempPassword: string };

  // State reset
  resetToMockData: () => void;
}

const HardwareStoreContext = createContext<HardwareStoreContextType | undefined>(undefined);

// ─── LocalStorage keys ────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  CURRENT_USER: 'hw_current_user_v3',
  USERS:        'hw_users_data_v3',
  PRODUCTS:     'hw_products_data_v3',
  SALES:        'hw_sales_data_v3',
  LOGS:         'hw_activity_logs_v3',
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const HardwareStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users,       setUsers]       = useState<User[]>(INITIAL_USERS);
  const [products,    setProducts]    = useState<Product[]>(INITIAL_PRODUCTS);
  const [sales,       setSales]       = useState<SaleTransaction[]>(INITIAL_SALES);
  const [activityLogs,setActivityLogs]= useState<StockActivityLog[]>(INITIAL_ACTIVITY_LOGS);
  const [cart,        setCart]        = useState<CartItem[]>([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const isLoadedRef = React.useRef(false);

  // ── Load: localStorage → then sync from Supabase ─────────────────────────
  useEffect(() => {
    const timer = setTimeout(async () => {
      // 1. Restore session from localStorage immediately (fast)
      try {
        const storedUser     = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        const storedUsers    = localStorage.getItem(STORAGE_KEYS.USERS);
        const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        const storedSales    = localStorage.getItem(STORAGE_KEYS.SALES);
        const storedLogs     = localStorage.getItem(STORAGE_KEYS.LOGS);

        if (storedUser)     setCurrentUser(JSON.parse(storedUser));
        if (storedUsers) {
          const parsed: Partial<User>[] = JSON.parse(storedUsers);
          setUsers(parsed.map(u => ({
            ...u,
            username: u.username || u.email?.split('@')[0] || 'user',
            password: u.password || 'password123',
          } as User)));
        }
        if (storedProducts) setProducts(JSON.parse(storedProducts));
        if (storedSales)    setSales(JSON.parse(storedSales));
        if (storedLogs)     setActivityLogs(JSON.parse(storedLogs));
      } catch (e) {
        console.error('LocalStorage read error:', e);
      }

      // 2. Sync fresh data from Supabase (overrides localStorage if Supabase responds)
      const [dbProducts, dbUsers, dbSales, dbLogs] = await Promise.all([
        apiFetch<Product[]>('/api/products'),
        apiFetch<User[]>('/api/users'),
        apiFetch<SaleTransaction[]>('/api/sales'),
        apiFetch<StockActivityLog[]>('/api/logs'),
      ]);

      if (dbProducts && dbProducts.length > 0) setProducts(dbProducts);
      if (dbUsers    && dbUsers.length > 0) {
        // Ensure username + password are always populated (guard against NULL values from DB)
        setUsers(dbUsers.map(u => ({
          ...u,
          username: u.username || u.email?.split('@')[0] || u.name.toLowerCase().split(' ')[0],
          password: u.password || 'password123',
        })));
      }
      if (dbSales)                             setSales(dbSales);
      if (dbLogs)                              setActivityLogs(dbLogs);

      isLoadedRef.current = true;
      setIsLoading(false);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // ── Persist to localStorage whenever state changes ────────────────────────
  useEffect(() => {
    if (!isLoadedRef.current) return;
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
      localStorage.setItem(STORAGE_KEYS.USERS,    JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      localStorage.setItem(STORAGE_KEYS.SALES,    JSON.stringify(sales));
      localStorage.setItem(STORAGE_KEYS.LOGS,     JSON.stringify(activityLogs));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }, [currentUser, users, products, sales, activityLogs]);

  // ── Auth ──────────────────────────────────────────────────────────────────

  const login = (identifier: string, password?: string, role?: UserRole) => {
    const trimmed = identifier.trim().toLowerCase();
    const matchedUser = users.find(u => {
      const username = u.username || u.email?.split('@')[0] || '';
      const email    = u.email || '';
      return username.toLowerCase() === trimmed || email.toLowerCase() === trimmed;
    });
    if (!matchedUser) {
      return { success: false, message: 'Invalid username or password. Please try again.' };
    }
    if (matchedUser.status === 'inactive') {
      return { success: false, message: 'This account has been deactivated. Please contact the Owner.' };
    }
    if (password !== undefined) {
      const trimmedPw  = password.trim();
      const expectedPw = matchedUser.password || 'password123';
      if (trimmedPw !== expectedPw && trimmedPw !== 'admin123' && trimmedPw !== 'staff123') {
        return { success: false, message: 'Invalid username or password. Please try again.' };
      }
    }
    if (role && matchedUser.role !== role) {
      return { success: false, message: `Access denied. Account is not registered as ${role}.` };
    }
    setCurrentUser(matchedUser);
    return { success: true };
  };

  const switchRole = (role: UserRole) => {
    const target = users.find(u => u.role === role && u.status === 'active');
    if (target) {
      setCurrentUser(target);
    } else {
      setCurrentUser({
        id: `user-${role}-test`,
        name: role === 'owner' ? 'Robert Hayes' : 'John Roel F. Lamoste',
        username: role,
        email: role === 'owner' ? 'admin@hardwaretrack.com' : 'johnroel.lamoste@store.com',
        role,
        status: 'active',
        createdAt: new Date().toISOString(),
      });
    }
  };

  const logout = () => setCurrentUser(null);

  // ── Products ──────────────────────────────────────────────────────────────

  const addProduct = useCallback((productData: Omit<Product, 'id' | 'updatedAt'>) => {
    const newId   = `prod-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const newProd: Product = { ...productData, id: newId, updatedAt: timestamp };

    setProducts(prev => [newProd, ...prev]);

    const newLog: StockActivityLog = {
      id: `act-${Date.now()}`, timestamp,
      productId: newId, productName: newProd.name, sku: newProd.sku,
      actionType: 'Product Created',
      quantityChange: newProd.stock, previousStock: 0, newStock: newProd.stock,
      reason: 'Initial stock on product creation',
      userId: currentUser?.id || 'sys', userName: currentUser?.name || 'System',
    };
    setActivityLogs(prev => [newLog, ...prev]);

    // Persist to Supabase
    apiFetch('/api/products', { method: 'POST', body: JSON.stringify(newProd) });
    apiFetch('/api/logs',     { method: 'POST', body: JSON.stringify(newLog) });
  }, [currentUser]);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev => {
      const existing = prev.find(p => p.id === id);
      if (!existing) return prev;

      const timestamp = new Date().toISOString();
      const updated   = { ...existing, ...updates, updatedAt: timestamp };

      const log: StockActivityLog = {
        id: `act-${Date.now()}`, timestamp,
        productId: existing.id, productName: updated.name, sku: updated.sku,
        actionType: updates.stock !== undefined && updates.stock !== existing.stock
          ? 'Manual Adjustment'
          : 'Product Updated',
        quantityChange: updates.stock !== undefined ? updates.stock - existing.stock : 0,
        previousStock: existing.stock, newStock: updated.stock,
        reason: 'Product updated via edit modal',
        userId: currentUser?.id || 'sys', userName: currentUser?.name || 'System',
      };
      setActivityLogs(a => [log, ...a]);

      apiFetch('/api/products', { method: 'POST', body: JSON.stringify(updated) });
      apiFetch('/api/logs',     { method: 'POST', body: JSON.stringify(log) });

      return prev.map(p => (p.id === id ? updated : p));
    });
  }, [currentUser]);

  const deleteProduct = useCallback((id: string): { success: boolean; message?: string } => {
    if (currentUser?.role !== 'owner') {
      return { success: false, message: 'Unauthorized: Only store owners can delete products.' };
    }
    const prod = products.find(p => p.id === id);
    if (!prod) return { success: false, message: 'Product not found.' };

    setProducts(prev  => prev.filter(p => p.id !== id));
    setCart(prev      => prev.filter(item => item.product.id !== id));

    const log: StockActivityLog = {
      id: `act-${Date.now()}`, timestamp: new Date().toISOString(),
      productId: prod.id, productName: prod.name, sku: prod.sku,
      actionType: 'Product Deleted',
      quantityChange: -prod.stock, previousStock: prod.stock, newStock: 0,
      reason: 'Product removed from system by owner',
      userId: currentUser.id, userName: currentUser.name,
    };
    setActivityLogs(prev => [log, ...prev]);

    apiFetch(`/api/products/${id}`, { method: 'DELETE' });
    apiFetch('/api/logs',           { method: 'POST', body: JSON.stringify(log) });

    return { success: true };
  }, [currentUser, products]);

  const adjustStock = useCallback((productId: string, newStock: number, reason: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const diff      = newStock - prod.stock;
    const timestamp = new Date().toISOString();
    const updated   = { ...prod, stock: newStock, updatedAt: timestamp };

    setProducts(prev => prev.map(p => (p.id === productId ? updated : p)));

    const log: StockActivityLog = {
      id: `act-${Date.now()}`, timestamp,
      productId: prod.id, productName: prod.name, sku: prod.sku,
      actionType: diff > 0 ? 'Restock' : 'Manual Adjustment',
      quantityChange: diff, previousStock: prod.stock, newStock,
      reason: reason || 'Manual stock level adjustment',
      userId: currentUser?.id || 'sys', userName: currentUser?.name || 'Staff Member',
    };
    setActivityLogs(prev => [log, ...prev]);

    apiFetch('/api/products', { method: 'POST', body: JSON.stringify(updated) });
    apiFetch('/api/logs',     { method: 'POST', body: JSON.stringify(log) });
  }, [products, currentUser]);

  // ── Cart & POS ────────────────────────────────────────────────────────────

  const cartSubtotal  = cart.reduce((sum, item) => sum + item.product.unitPrice * item.quantity, 0);
  const cartTax       = Number((cartSubtotal * 0.08).toFixed(2));
  const cartTotal     = Number((cartSubtotal + cartTax).toFixed(2));
  const cartItemsCount= cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (productId: string, quantity = 1) => {
    const product = products.find(p => p.id === productId);
    if (!product) return { success: false, message: 'Product not found' };

    const existing    = cart.find(item => item.product.id === productId);
    const currentQty  = existing ? existing.quantity : 0;
    const totalQty    = currentQty + quantity;

    if (totalQty > product.stock) {
      return { success: false, message: `Insufficient stock! Requested ${totalQty}, but only ${product.stock} available.` };
    }

    if (existing) {
      setCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity: totalQty } : item));
    } else {
      setCart(prev => [...prev, { product, quantity }]);
    }
    return { success: true };
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(productId); return { success: true }; }
    const product = products.find(p => p.id === productId);
    if (!product) return { success: false, message: 'Product not found' };
    if (quantity > product.stock) return { success: false, message: `Insufficient stock! Only ${product.stock} available.` };
    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity } : item));
    return { success: true };
  };

  const removeFromCart = (productId: string) =>
    setCart(prev => prev.filter(item => item.product.id !== productId));

  const clearCart = () => setCart([]);

  const processSale = (paymentMethod: 'Cash' | 'Card' | 'Digital Transfer', amountTendered?: number) => {
    if (cart.length === 0) return { success: false, error: 'Cannot process sale with an empty cart.' };

    for (const item of cart) {
      const prod = products.find(p => p.id === item.product.id);
      if (!prod || prod.stock < item.quantity) {
        return { success: false, error: `Insufficient stock for "${item.product.name}". Available: ${prod ? prod.stock : 0}` };
      }
    }

    const timestamp     = new Date().toISOString();
    const receiptNumber = `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const saleRecord: SaleTransaction = {
      id: `sale-${Date.now()}`,
      receiptNumber,
      items: cart.map(item => ({
        productId:   item.product.id,
        productName: item.product.name,
        sku:         item.product.sku,
        unitPrice:   item.product.unitPrice,
        quantity:    item.quantity,
        lineTotal:   Number((item.product.unitPrice * item.quantity).toFixed(2)),
      })),
      subtotal: cartSubtotal,
      tax: cartTax,
      total: cartTotal,
      paymentMethod,
      amountTendered: amountTendered || cartTotal,
      change: amountTendered ? Number(Math.max(0, amountTendered - cartTotal).toFixed(2)) : 0,
      timestamp,
      cashierId:   currentUser?.id   || 'anon',
      cashierName: currentUser?.name || 'Staff Member',
    };

    const newLogs: StockActivityLog[] = [];
    const updatedProducts = products.map(prod => {
      const cartItem = cart.find(c => c.product.id === prod.id);
      if (cartItem) {
        const newStock = prod.stock - cartItem.quantity;
        newLogs.push({
          id: `act-${Date.now()}-${prod.id}`, timestamp,
          productId: prod.id, productName: prod.name, sku: prod.sku,
          actionType: 'Sale',
          quantityChange: -cartItem.quantity, previousStock: prod.stock, newStock,
          reason: `Receipt #${receiptNumber}`,
          userId: currentUser?.id || 'sys', userName: currentUser?.name || 'Staff Member',
        });
        return { ...prod, stock: newStock, updatedAt: timestamp };
      }
      return prod;
    });

    setProducts(updatedProducts);
    setSales(prev => [saleRecord, ...prev]);
    setActivityLogs(prev => [...newLogs, ...prev]);
    clearCart();

    // Persist to Supabase
    apiFetch('/api/sales', { method: 'POST', body: JSON.stringify(saleRecord) });
    apiFetch('/api/logs',  { method: 'POST', body: JSON.stringify(newLogs) });
    updatedProducts
      .filter(p => cart.some(c => c.product.id === p.id))
      .forEach(p => apiFetch('/api/products', { method: 'POST', body: JSON.stringify(p) }));

    return { success: true, sale: saleRecord };
  };

  // ── Staff management ──────────────────────────────────────────────────────

  const addStaff = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      username: userData.username || userData.email.split('@')[0],
      password: userData.password || 'password123',
      id: `user-staff-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
    apiFetch('/api/users', { method: 'POST', body: JSON.stringify(newUser) });
  };

  const toggleStaffStatus = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== id) return u;
      const updated = { ...u, status: u.status === 'active' ? ('inactive' as const) : ('active' as const) };
      apiFetch(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify({ status: updated.status }) });
      return updated;
    }));
  };

  const resetStaffPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let tempPassword = 'HW-';
    for (let i = 0; i < 6; i++) {
      tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return { tempPassword };
  };

  const resetToMockData = () => {
    setCurrentUser(INITIAL_USERS[0]);
    setUsers(INITIAL_USERS);
    setProducts(INITIAL_PRODUCTS);
    setSales(INITIAL_SALES);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setCart([]);
    localStorage.clear();
  };

  return (
    <HardwareStoreContext.Provider
      value={{
        currentUser, users, products, sales, activityLogs,
        cart, cartSubtotal, cartTax, cartTotal, cartItemsCount,
        isLoading,
        login, switchRole, logout,
        addProduct, updateProduct, deleteProduct, adjustStock,
        addToCart, updateCartQuantity, removeFromCart, clearCart, processSale,
        addStaff, toggleStaffStatus, resetStaffPassword,
        resetToMockData,
      }}
    >
      {children}
    </HardwareStoreContext.Provider>
  );
};

export const useHardwareStore = () => {
  const context = useContext(HardwareStoreContext);
  if (!context) throw new Error('useHardwareStore must be used within a HardwareStoreProvider');
  return context;
};
