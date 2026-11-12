'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Hammer,
  Shield,
  UserCheck,
  ArrowRight,
  Lock,
  User as UserIcon,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useHardwareStore } from '@/lib/store';
import { UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useHardwareStore();

  const [username, setUsername] = useState('owner');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('owner');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Quick switch between demo roles
  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === 'owner') {
      setUsername('owner');
      setPassword('password123');
    } else {
      setUsername('staff');
      setPassword('password123');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      if (!username.trim()) {
        setErrorMessage('Please enter a username or email address.');
        setIsLoading(false);
        return;
      }
      if (!password.trim()) {
        setErrorMessage('Please enter your account password.');
        setIsLoading(false);
        return;
      }

      // Check credentials using login method
      const result = login(username, password, selectedRole);
      if (result.success) {
        router.push('/dashboard');
      } else {
        setErrorMessage(result.message || 'Invalid username or password. Please try again.');
        setIsLoading(false);
      }
    }, 300);
  };

  // Instant one-click demo login buttons
  const handleQuickDemoLogin = (role: UserRole) => {
    setErrorMessage(null);
    setIsLoading(true);
    const demoUser = role === 'owner' ? 'owner' : 'staff';
    const demoPw = 'password123';
    setUsername(demoUser);
    setPassword(demoPw);
    setSelectedRole(role);

    setTimeout(() => {
      const res = login(demoUser, demoPw, role);
      if (res.success) {
        router.push('/dashboard');
      } else {
        setErrorMessage('Quick login failed. Please try again.');
        setIsLoading(false);
      }
    }, 250);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Bar with brand and back link */}
      <div className="mx-auto w-full max-w-6xl flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white group-hover:bg-blue-700 transition-colors shadow-sm">
            <Hammer className="h-4 w-4" />
          </div>
          <span className="font-bold text-sm text-slate-900 tracking-tight">
            HardWare<span className="text-blue-600">Track</span>
          </span>
        </Link>

        <Link href="/">
          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 text-xs">
            ← Public Customer Catalog
          </Button>
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="mx-auto w-full max-w-md my-auto py-6">
        <Card className="border-slate-200 shadow-lg rounded-2xl overflow-hidden bg-white">
          <CardHeader className="text-center pb-3 pt-6">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
              <Lock className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold text-slate-900">
              Employee Sign In
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Authenticate with your credentials to access the internal management console
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 px-6 pb-6">
            {/* Role selector tab */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => handleSelectRole('owner')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedRole === 'owner'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Shield className={`h-3.5 w-3.5 ${selectedRole === 'owner' ? 'text-blue-600' : 'text-slate-400'}`} />
                Owner Console
              </button>
              <button
                type="button"
                onClick={() => handleSelectRole('staff')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedRole === 'staff'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <UserCheck className={`h-3.5 w-3.5 ${selectedRole === 'staff' ? 'text-emerald-600' : 'text-slate-400'}`} />
                Staff Terminal
              </button>
            </div>

            {/* Inline Error Alert */}
            {errorMessage && (
              <Alert variant="destructive" className="py-2.5">
                <AlertTitle className="flex items-center gap-1.5 font-bold text-xs">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Authentication Failed
                </AlertTitle>
                <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Username or Email
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    type="text"
                    value={username}
                    onChange={e => {
                      setUsername(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    required
                    placeholder="e.g. owner or staff"
                    className="pl-9 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  <span className="text-[10px] text-slate-400">Demo: password123</span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    type="password"
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    required
                    placeholder="••••••••"
                    className="pl-9 text-sm"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 text-sm font-semibold mt-1"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In as {selectedRole === 'owner' ? 'Owner' : 'Staff'}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Quick Demo Switcher Section */}
            <div className="rounded-xl border border-dashed border-slate-200 p-3 bg-slate-50/70 text-xs space-y-2">
              <p className="font-semibold text-slate-600 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                Quick Demo Switcher:
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('owner')}
                  className="p-2.5 rounded-lg border border-slate-200 bg-white text-left hover:border-blue-500 hover:shadow-xs cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <strong className="block text-blue-600 font-semibold group-hover:underline">
                      Sign in as Owner
                    </strong>
                    <Shield className="h-3 w-3 text-blue-500" />
                  </div>
                  <span className="text-slate-500 block text-[10px] mt-0.5">username: <code>owner</code></span>
                  <span className="text-slate-400 block text-[10px]">password: <code>password123</code></span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('staff')}
                  className="p-2.5 rounded-lg border border-slate-200 bg-white text-left hover:border-emerald-500 hover:shadow-xs cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <strong className="block text-emerald-600 font-semibold group-hover:underline">
                      Sign in as Staff
                    </strong>
                    <UserCheck className="h-3 w-3 text-emerald-500" />
                  </div>
                  <span className="text-slate-500 block text-[10px] mt-0.5">username: <code>staff</code></span>
                  <span className="text-slate-400 block text-[10px]">password: <code>password123</code></span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer info */}
      <div className="mx-auto text-center text-xs text-slate-400">
        HardWareTrack Inventory &amp; POS System • Role-Based Authentication
      </div>
    </div>
  );
}
