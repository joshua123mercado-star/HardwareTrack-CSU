'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  History,
  LogOut,
  AlertTriangle,
  Hammer,
  Shield,
  UserCheck,
  ExternalLink,
  ArrowLeftRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHardwareStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DashboardSidebarProps {
  onCloseMobile?: () => void;
}

export function DashboardSidebar({ onCloseMobile }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, switchRole, logout, products, resetToMockData } = useHardwareStore();

  const isOwner = currentUser?.role === 'owner';

  const lowStockCount = products.filter(p => p.stock <= p.minStockLevel && p.stock > 0).length;
  const outOfStockCount = products.filter(p => p.stock <= 0).length;
  const alertTotal = lowStockCount + outOfStockCount;

  const handleLogout = () => {
    logout();
    router.push('/login');
    if (onCloseMobile) onCloseMobile();
  };

  interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    roles: string[];
    badge?: string;
    alertCount?: number;
  }

  interface NavGroup {
    group: string;
    ownerOnly?: boolean;
    items: NavItem[];
  }

  // Navigation strictly structured by Role specifications:
  // - Staff View: Inventory, POS / Record Sale, Low Stock Alerts
  // - Owner View: Staff features + Staff Accounts, Sales Reports, Activity Logs
  const navItems: NavGroup[] = [
    {
      group: 'Staff Menu',
      items: [
        {
          name: 'Inventory',
          href: '/dashboard/inventory',
          icon: Package,
          roles: ['owner', 'staff'],
          badge: `${products.length}`,
        },
        {
          name: 'POS / Record Sale',
          href: '/dashboard/sales/new',
          icon: ShoppingCart,
          roles: ['owner', 'staff'],
        },
        {
          name: 'Low Stock Alerts',
          href: '/dashboard/inventory?filter=low',
          icon: AlertTriangle,
          roles: ['owner', 'staff'],
          alertCount: alertTotal,
        },
      ],
    },
    {
      group: 'Owner Menu',
      ownerOnly: true, // STRICT ENFORCEMENT: Completely hidden for Staff role
      items: [
        {
          name: 'Staff Accounts',
          href: '/dashboard/staff',
          icon: Users,
          roles: ['owner'],
        },
        {
          name: 'Sales Reports',
          href: '/dashboard/reports',
          icon: BarChart3,
          roles: ['owner'],
        },
        {
          name: 'Activity Logs',
          href: '/dashboard/logs',
          icon: History,
          roles: ['owner'],
        },
      ],
    },
  ];

  return (
    <aside className="flex flex-col h-full bg-white border-r border-slate-200 w-64 select-none">
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
        <Link
          href="/dashboard"
          onClick={onCloseMobile}
          className="flex items-center gap-3 group flex-1 min-w-0"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shrink-0 group-hover:bg-blue-700 transition-colors shadow-xs">
            <Hammer className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm text-slate-900 tracking-tight">
              HardWare<span className="text-blue-600">Track</span>
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              POS &amp; Inventory
            </p>
          </div>
        </Link>
      </div>

      {/* Role Banner */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {isOwner ? (
              <Shield className="h-3.5 w-3.5 text-blue-600" />
            ) : (
              <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
            )}
            <span className="text-xs text-slate-600 font-medium">Logged in:</span>
          </div>
          <Badge
            className={cn(
              'text-[10px] font-bold tracking-wider uppercase px-2 py-0.5',
              isOwner
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            )}
          >
            {currentUser?.role || 'Staff'}
          </Badge>
        </div>

        {/* Role switcher for rapid testing */}
        <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-200/80">
          <span className="text-[10px] text-slate-400">Testing View:</span>
          <button
            onClick={() => switchRole(isOwner ? 'staff' : 'owner')}
            className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-0.5 rounded transition-colors cursor-pointer"
            title={`Switch to ${isOwner ? 'Staff' : 'Owner'} view`}
          >
            <ArrowLeftRight className="h-3 w-3" />
            Switch to {isOwner ? 'Staff' : 'Owner'}
          </button>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navItems.map((group, idx) => {
          // Strictly hide Owner Menu from Staff users
          if (group.ownerOnly && !isOwner) return null;

          return (
            <div key={idx} className="space-y-1">
              <div className="px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center justify-between">
                <span>{group.group}</span>
                {group.ownerOnly && (
                  <span className="text-[9px] font-mono text-blue-600 bg-blue-50 px-1 py-0.2 rounded">Owner Only</span>
                )}
              </div>
              {group.items.map(item => {
                const isActive =
                  pathname === item.href ||
                  (item.href.includes('?') &&
                    pathname === item.href.split('?')[0]);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group',
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon
                        className={cn(
                          'h-4 w-4 shrink-0',
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                        )}
                      />
                      <span className="text-sm">{item.name}</span>
                    </div>

                    {item.alertCount !== undefined && item.alertCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                        {item.alertCount}
                      </span>
                    )}

                    {item.badge && !item.alertCount && (
                      <span className={cn(
                        'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}

        {/* Public Storefront Link */}
        <div className="pt-2 border-t border-slate-100">
          <Link
            href="/"
            onClick={onCloseMobile}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Public Customer Catalog</span>
          </Link>
        </div>
      </div>

      {/* Footer Profile with Sign Out */}
      <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/50">
        <div className="flex items-center gap-2.5 px-1">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-xs shrink-0">
            {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">
              {currentUser?.name || 'Authorized User'}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {currentUser?.email || `${currentUser?.username}@hardwaretrack.com`}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (window.confirm('Reset all demo data back to initial mock records?')) {
                resetToMockData();
              }
            }}
            className="flex-1 justify-center text-slate-500 text-xs h-8 border-slate-200 hover:bg-slate-100"
            title="Reset to factory sample data"
          >
            Reset
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex-1 justify-center text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 text-xs h-8 border-slate-200"
            title="Sign out and clear session"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </Button>
        </div>
      </div>
    </aside>
  );
}
