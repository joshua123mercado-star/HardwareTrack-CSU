'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowLeftRight, Store, Shield, UserCheck } from 'lucide-react';
import { useHardwareStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DashboardSidebar } from './DashboardSidebar';

export function DashboardHeader({ title }: { title?: string }) {
  const { currentUser, switchRole } = useHardwareStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isOwner = currentUser?.role === 'owner';

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          {title && (
            <h1 className="text-base font-semibold text-slate-900 hidden sm:block">
              {title}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Storefront link */}
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-slate-500 text-xs hidden md:flex items-center gap-1.5">
              <Store className="h-3.5 w-3.5" />
              Storefront
            </Button>
          </Link>

          {/* Role switcher */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => switchRole(isOwner ? 'staff' : 'owner')}
            className="text-xs h-8 gap-1.5 border-slate-200 text-slate-600 font-medium"
            title="Switch role for testing"
          >
            <ArrowLeftRight className="h-3 w-3 text-blue-600" />
            <span className="hidden sm:inline">Role:</span>
            <span className="font-semibold">{isOwner ? 'Owner' : 'Staff'}</span>
          </Button>

          {/* Role Badge */}
          <Badge
            className={`capitalize font-semibold text-xs flex items-center gap-1 ${
              isOwner
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {isOwner ? <Shield className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
            {currentUser?.role || 'Staff'}
          </Badge>
        </div>
      </header>

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 z-50 bg-white shadow-xl flex flex-col">
            <div className="absolute top-3 right-3">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <DashboardSidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
