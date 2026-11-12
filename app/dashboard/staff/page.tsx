'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  KeyRound,
  UserX,
  UserCheck,
  Copy,
  Check,
  Search,
} from 'lucide-react';
import { useHardwareStore } from '@/lib/store';
import { User, UserRole } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function StaffManagementPage() {
  const { currentUser, users, addStaff, toggleStaffStatus, resetStaffPassword } = useHardwareStore();
  const isOwner = currentUser?.role === 'owner';

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'owner' | 'staff'>('all');

  // Modals state
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('staff');
  const [addError, setAddError] = useState<string | null>(null);

  const [resetModalUser, setResetModalUser] = useState<User | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  // Role Gate: Owner Only
  if (!isOwner) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">
          Restricted to Store Owner
        </h2>
        <p className="text-sm text-slate-600 ">
          You are currently logged in with a <strong>Staff</strong> account. Managing employee credentials, creating accounts, and password resets require <strong>Owner</strong> privileges.
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

  // Handle Add Staff
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    if (!newName.trim() || !newEmail.trim()) {
      setAddError('All fields are required.');
      return;
    }

    if (users.some(u => u.email.toLowerCase() === newEmail.trim().toLowerCase())) {
      setAddError('An account with this email address already exists.');
      return;
    }

    addStaff({
      name: newName.trim(),
      username: newEmail.trim().split('@')[0],
      email: newEmail.trim().toLowerCase(),
      role: newRole,
      status: 'active',
    });

    setNewName('');
    setNewEmail('');
    setNewRole('staff');
    setIsAddStaffOpen(false);
  };

  // Handle Password Reset
  const handleOpenReset = (user: User) => {
    const { tempPassword } = resetStaffPassword();
    setResetModalUser(user);
    setGeneratedPassword(tempPassword);
    setHasCopied(false);
  };

  const handleCopyPassword = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              Staff Account Management
            </h1>
            <Badge className="bg-amber-500/20 text-amber-500 border-blue-200 text-[10px] uppercase font-bold">
              Owner Privileges
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create employee accounts, manage POS terminal access, activate/deactivate staff, and generate password resets.
          </p>
        </div>

        <Button
          onClick={() => {
            setAddError(null);
            setIsAddStaffOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm h-10 shadow-sm"
        >
          <UserPlus className="h-4 w-4 mr-1.5" />
          Create New Account
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-slate-200  shadow-xs">
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search employee by name or email..."
              className="pl-10 h-10 text-sm"
            />
          </div>

          <div className="w-full sm:w-48">
            <Select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value as 'all' | 'owner' | 'staff')}
              aria-label="Filter staff by account role"
              className="h-10 text-sm"
            >
              <option value="all">All Roles</option>
              <option value="owner">Owners Only</option>
              <option value="staff">Staff Only</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Staff Accounts Table */}
      <Card className="border-slate-200  shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Account Status</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(u => {
                const isCurrentSelf = u.id === currentUser?.id;

                return (
                  <TableRow key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40">
                    {/* User info */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-200  flex items-center justify-center font-bold text-xs text-slate-700 ">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                            {u.name}
                            {isCurrentSelf && (
                              <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                                (You)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-500 font-mono">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Role */}
                    <TableCell>
                      <Badge
                        variant={u.role === 'owner' ? 'default' : 'secondary'}
                        className="text-xs uppercase font-bold"
                      >
                        {u.role === 'owner' ? (
                          <span className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Owner
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <UserCheck className="h-3 w-3" />
                            Staff
                          </span>
                        )}
                      </Badge>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {u.status === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700  ">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                          Inactive
                        </span>
                      )}
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-xs text-slate-500">
                      {formatDate(u.createdAt)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Reset Password */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenReset(u)}
                          className="h-8 text-xs text-slate-600 hover:text-blue-600 hover:bg-amber-50 dark:hover:bg-zinc-800"
                          title="Generate Password Reset"
                        >
                          <KeyRound className="h-3.5 w-3.5 mr-1" />
                          Reset Password
                        </Button>

                        {/* Deactivate / Activate Button */}
                        {!isCurrentSelf && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStaffStatus(u.id)}
                            className={`h-8 text-xs ${
                              u.status === 'active'
                                ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40'
                                : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            }`}
                          >
                            {u.status === 'active' ? (
                              <>
                                <UserX className="h-3.5 w-3.5 mr-1" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3.5 w-3.5 mr-1" />
                                Activate
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Modal: Create Staff Account */}
      <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
        <DialogContent onClose={() => setIsAddStaffOpen(false)}>
          <DialogHeader>
            <DialogTitle>Create New Employee Account</DialogTitle>
            <DialogDescription>
              Grant staff access to record sales, manage inventory, and monitor low stock.
            </DialogDescription>
          </DialogHeader>

          {addError && (
            <Alert variant="destructive" className="mb-3">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{addError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 ">
                Full Name *
              </label>
              <Input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Jordan Miller"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 ">
                Email Address *
              </label>
              <Input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="jordan@hardwaretrack.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 ">
                System Role *
              </label>
              <Select
                value={newRole}
                onChange={e => setNewRole(e.target.value as UserRole)}
              >
                <option value="staff">Staff (Inventory & POS Access)</option>
                <option value="owner">Owner (Full Administrative Access)</option>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddStaffOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                Create Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Password Reset */}
      <Dialog open={!!resetModalUser} onOpenChange={open => !open && setResetModalUser(null)}>
        <DialogContent onClose={() => setResetModalUser(null)}>
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-blue-600 dark:bg-amber-950 dark:text-amber-400 mb-2">
              <KeyRound className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center">Temporary Password Generated</DialogTitle>
            <DialogDescription className="text-center">
              A temporary password has been generated for{' '}
              <strong className="text-slate-900">{resetModalUser?.name}</strong>.
              Share this securely with the employee.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 bg-slate-100  rounded-xl flex items-center justify-between">
            <span className="font-mono text-lg font-black tracking-widest text-slate-900">
              {generatedPassword}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyPassword}
              className="text-xs gap-1"
            >
              {hasCopied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </Button>
          </div>

          <DialogFooter className="sm:justify-center">
            <Button onClick={() => setResetModalUser(null)} className="bg-blue-600 hover:bg-blue-700 text-white">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


