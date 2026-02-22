'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Package, BookOpen, Users, Zap, LogOut, BarChart2 } from 'lucide-react';

const navItems = [
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/quick-sale', label: 'Quick Sale', icon: Zap },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/collections', label: 'Collections', icon: BookOpen },
  { href: '/admin/contacts', label: 'Contacts', icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-52 flex-shrink-0 flex-col border-r border-neutral-200 bg-white md:flex">
        <div className="flex h-14 items-center border-b border-neutral-200 px-5">
          <span className="text-xs font-semibold uppercase tracking-widest">315 Fabrics</span>
          <span className="ml-1.5 text-[10px] uppercase tracking-widest text-neutral-400">Admin</span>
        </div>
        <nav className="flex-1 py-2">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-5 py-3 text-sm transition-colors ${pathname.startsWith(href)
                ? 'bg-black text-white'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'
                }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-neutral-200 p-3 space-y-1">
          <a
            href="https://app.posthog.com"
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center gap-3 rounded px-2 py-2 text-sm text-neutral-500 hover:bg-neutral-100 hover:text-black"
          >
            <BarChart2 size={15} />
            Analytics ↗
          </a>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded px-2 py-2 text-sm text-neutral-500 hover:bg-neutral-100"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-neutral-200 bg-white md:hidden">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-1 py-2 text-[10px] uppercase tracking-widest transition-colors ${pathname.startsWith(href) ? 'text-black' : 'text-neutral-400'
              }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-1 flex-col items-center gap-1 py-2 text-[10px] uppercase tracking-widest text-neutral-400"
        >
          <LogOut size={18} />
          Out
        </button>
      </nav>
    </>
  );
}
