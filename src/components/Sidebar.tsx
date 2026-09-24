'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  QrCode,
  Activity,
  Settings2,
  LogOut,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

const mainItems = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: LayoutDashboard,
  },
  {
    href: '/volunteers',
    label: 'Volunteers',
    icon: Users,
  },
  {
    href: '/duties',
    label: 'Daily Duties',
    icon: CalendarDays,
  },
  {
    href: '/scanner',
    label: 'Verify QR',
    icon: QrCode,
  },
];

const systemItems = [
  {
    href: '/activity-logs',
    label: 'Activity Logs',
    icon: Activity,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings2,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      window.location.href = '/login';
    }
  }

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[276px] border-r border-white/[0.07] bg-[#07070a]/95 backdrop-blur-2xl lg:flex lg:flex-col">

      {/* Brand */}
      <div className="px-6 pt-7">
        <div className="flex items-center gap-3">
          <div className="relative grid h-11 w-11 place-items-center rounded-2xl border border-violet-300/20 bg-violet-400/[0.10]">
            <div className="absolute inset-0 rounded-2xl bg-violet-500/10 blur-xl" />

            <ShieldCheck
              size={21}
              className="relative text-violet-200"
            />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-violet-200/55">
              FRESHERS 2026
            </p>

            <h2 className="mt-0.5 text-[15px] font-semibold tracking-tight">
              Event Command
            </h2>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="mx-5 mt-8 rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.035] px-3.5 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
          </span>

          <span className="text-[11px] font-medium text-emerald-200/75">
            All systems operational
          </span>
        </div>

        <p className="mt-1.5 pl-4 text-[10px] text-white/25">
          Secure management environment
        </p>
      </div>

      {/* Operations */}
      <div className="mt-8 px-5">
        <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/25">
          Operations
        </p>

        <nav className="mt-3 space-y-1.5">
          {mainItems.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== '/dashboard' && pathname.startsWith(`${href}/`));

            return (
              <Link
                key={href}
                href={href}
                className={`group relative flex items-center gap-3 rounded-2xl px-3.5 py-3 transition-all duration-200 ${
                  active
                    ? 'border border-violet-300/10 bg-violet-400/[0.10] text-white'
                    : 'text-white/45 hover:bg-white/[0.045] hover:text-white'
                }`}
              >
                {active && (
                  <span className="absolute left-0 h-6 w-[2px] rounded-full bg-violet-300 shadow-[0_0_14px_rgba(196,181,253,.9)]" />
                )}

                <Icon
                  size={18}
                  className={
                    active
                      ? 'text-violet-200'
                      : 'text-white/30 group-hover:text-violet-200'
                  }
                />

                <span className="text-sm font-medium">
                  {label}
                </span>

                {active && (
                  <ChevronRight
                    size={14}
                    className="ml-auto text-white/25"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* System */}
      <div className="mt-8 px-5">
        <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/25">
          System
        </p>

        <nav className="mt-3 space-y-1.5">
          {systemItems.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                className={`group relative flex items-center gap-3 rounded-2xl px-3.5 py-3 transition-all duration-200 ${
                  active
                    ? 'border border-violet-300/10 bg-violet-400/[0.10] text-white'
                    : 'text-white/40 hover:bg-white/[0.045] hover:text-white'
                }`}
              >
                {active && (
                  <span className="absolute left-0 h-6 w-[2px] rounded-full bg-violet-300 shadow-[0_0_14px_rgba(196,181,253,.9)]" />
                )}

                <Icon
                  size={18}
                  className={
                    active
                      ? 'text-violet-200'
                      : 'text-white/30 group-hover:text-violet-200'
                  }
                />

                <span className="text-sm font-medium">
                  {label}
                </span>

                {active && (
                  <ChevronRight
                    size={14}
                    className="ml-auto text-white/25"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin Profile */}
      <div className="mt-auto px-5 pb-5">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3.5">

          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full border border-violet-300/15 bg-gradient-to-br from-violet-400/25 to-fuchsia-400/10 text-xs font-bold text-violet-100">
              AD
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-medium">
                Event Administrator
              </p>

              <div className="mt-1 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />

                <p className="text-[10px] text-white/30">
                  Secure session
                </p>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 flex w-full items-center gap-2 border-t border-white/[0.06] pt-3 text-left text-xs text-white/30 transition hover:text-white"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}