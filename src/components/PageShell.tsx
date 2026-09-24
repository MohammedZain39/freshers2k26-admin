import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface PageShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function PageShell({
  title,
  subtitle,
  children,
}: PageShellProps) {
  return (
    <>
      <Sidebar />

      <main className="min-h-screen overflow-hidden bg-[#050507] lg:ml-[276px]">

        {/* Ambient lighting */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-violet-600/[0.07] blur-[120px]" />
          <div className="absolute left-[25%] top-[35%] h-[350px] w-[350px] rounded-full bg-fuchsia-500/[0.025] blur-[110px]" />
        </div>

        <div className="relative mx-auto max-w-[1600px] px-5 py-7 sm:px-8 lg:px-10">

          {/* Header */}
          <header className="flex flex-col gap-5 border-b border-white/[0.07] pb-7 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-violet-200/50">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_14px_rgba(196,181,253,.8)]" />
                Live Management Portal
              </div>

              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                {title}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/35">
                {subtitle}
              </p>
            </div>

            {/* System status */}
            <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-300/10 bg-emerald-300/[0.045] px-3.5 py-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-40" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
              </span>

              <span className="text-[11px] font-medium text-emerald-200/70">
                System online
              </span>
            </div>

          </header>

          {children}
        </div>
      </main>
    </>
  );
}