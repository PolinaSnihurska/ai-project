'use client';

import { Provider } from 'react-redux';
import { store } from '@/app/store';
import AdminSidebar from '@/components/Admin/AdminSidebar';

/** Admin shell: full-bleed sidebar flush left, scrollable main content. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <div className="flex h-screen bg-slate-50">
        <AdminSidebar />
        <div className="min-w-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </Provider>
  );
}
