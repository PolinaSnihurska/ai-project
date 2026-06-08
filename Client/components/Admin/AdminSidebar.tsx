'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChartBarIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  CubeIcon,
  HomeIcon,
  ShoppingCartIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import { useAppSelector } from '@/app/hooks';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
}

const mainMenu: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Squares2X2Icon, href: '/admin' },
  { id: 'products', label: 'Products', icon: CubeIcon, href: '/admin/products' },
  { id: 'orders', label: 'Orders', icon: ShoppingCartIcon, href: '/admin/orders' },
  { id: 'analytics', label: 'Analytics', icon: ChartBarIcon, href: '/admin/analytics' },
];

const systemMenu: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: Cog6ToothIcon, href: '/admin/settings' },
  { id: 'home', label: 'Home', icon: HomeIcon, href: '/' },
];

const AdminSidebar = () => {
  const pathname = usePathname();
  const reduxUserName = useAppSelector(
    (state) => state.userState?.defaultAccount?.userName,
  );
  const [displayName, setDisplayName] = useState('Admin');

  // Resolve display name: Redux → localStorage → fallback
  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    setDisplayName(reduxUserName || storedName || 'Admin');
  }, [reduxUserName]);

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'AD';

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
          <CubeIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-base font-semibold text-slate-900">StoreAdmin</p>
          <p className="text-xs text-slate-500">Pro workspace</p>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 space-y-6 px-4">
        <div>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Main menu
          </p>
          <ul className="space-y-1">
            {mainMenu.map(({ id, label, icon: Icon, href }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
              <li key={id}>
                <Link
                  href={href}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 ${
                      active ? 'text-white' : 'text-slate-500 group-hover:text-slate-900'
                    }`}
                  />
                  {label}
                </Link>
              </li>
              );
            })}
          </ul>
        </div>

        <div>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            System
          </p>
          <ul className="space-y-1">
            {systemMenu.map(({ id, label, icon: Icon, href }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={id}>
                  <Link
                    href={href}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 shrink-0 ${
                        active ? 'text-white' : 'text-slate-500 group-hover:text-slate-900'
                      }`}
                    />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* User profile — pinned to bottom */}
      <div className="mt-auto border-t border-slate-100 px-4 py-4">
        <div className="flex items-center gap-3 rounded-xl p-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">{displayName}</p>
            <p className="text-xs text-slate-500">Admin</p>
          </div>
          <ChevronDownIcon className="h-4 w-4 shrink-0 text-slate-400" />
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
