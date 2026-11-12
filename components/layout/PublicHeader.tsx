'use client';

import React from 'react';
import Link from 'next/link';
import { Hammer, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white group-hover:bg-blue-700 transition-colors">
            <Hammer className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-base text-slate-900 tracking-tight">
              HardWare<span className="text-blue-600">Track</span>
            </span>
            <p className="text-[10px] text-slate-400 hidden sm:block leading-none">Real-time store stock &amp; pricing</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button size="sm" variant="outline" className="text-xs font-semibold border-slate-300 hover:border-blue-500 hover:bg-blue-50 text-slate-800 hover:text-blue-700 transition-colors">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <span>Staff / Owner Login</span>
              <ArrowRight className="h-3 w-3 text-slate-400" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
