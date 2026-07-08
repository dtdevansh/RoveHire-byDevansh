'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, Briefcase, CalendarDays, LogOut, ChevronDown } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { signOut } from '@/store/slices/authSlice';
import { cn } from '@/lib/utils/cn';

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutGrid },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/interviews', label: 'Interviews', icon: CalendarDays },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const email = user?.email ?? 'hr@rove.com';

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  function isActive(href: string) {
    if (href === '/') return pathname === '/' || pathname.startsWith('/candidates');
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function handleSignOut() {
    await dispatch(signOut());
    router.push('/login');
  }

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-border bg-surface1">
      <div className="px-6 py-6">
        <Link href="/" aria-label="Rove Hire home">
          <Logo />
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-subtle text-brand-hover'
                  : 'text-text-secondary hover:bg-surface2 hover:text-text-primary',
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand" />
              )}
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="relative" ref={menuRef}>
          {menuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 animate-fade-in rounded-[8px] border border-border bg-surface2 p-1 shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-[6px] px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface1 hover:text-text-primary"
              >
                <LogOut className="h-[18px] w-[18px]" />
                Logout
              </button>
            </div>
          )}

          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className={cn(
              'flex w-full items-center gap-3 rounded-[8px] px-2 py-2 text-left transition-colors hover:bg-surface2',
              menuOpen && 'bg-surface2',
            )}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
              HR
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">
                HR Manager
              </p>
              <p className="truncate text-xs text-text-muted">{email}</p>
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-text-muted transition-transform',
                menuOpen && 'rotate-180',
              )}
            />
          </button>
        </div>
      </div>
    </aside>
  );
}
