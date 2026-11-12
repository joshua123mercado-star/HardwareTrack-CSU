'use client';

import React from 'react';
import { useHardwareStore } from '@/lib/store';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Button } from '@/components/ui/button';
import { ShieldCheck, LogIn } from 'lucide-react';
import Link from 'next/link';

function useMounted() {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser } = useHardwareStore();
  const mounted = useMounted();

  if (!mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-slate-500">Loading HardWareTrack...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-sm w-full rounded-2xl bg-white p-8 text-center shadow-lg border border-slate-200">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Authentication Required
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Please log in with your Staff or Owner credentials to access the dashboard.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link href="/login">
              <Button className="w-full font-medium">
                <LogIn className="h-4 w-4" />
                Go to Login
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="w-full text-slate-500">
                Back to Public Catalog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:shrink-0 no-print">
        <DashboardSidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
