import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type PageShellProps = {
  children: ReactNode;
  compact?: boolean;
};

export function PageShell({ children, compact = false }: PageShellProps) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-ink/10 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-black tracking-normal text-ink">
            Triết Học Là Gì
          </Link>
          <nav className="flex items-center gap-2 text-sm font-semibold">
            <Link className="rounded-lg px-3 py-2 hover:bg-white" to="/history">
              Lịch sử
            </Link>
            <Link className="rounded-lg px-3 py-2 hover:bg-white" to="/about">
              Về tụi mình 🤝
            </Link>
          </nav>
        </div>
      </header>
      <main className={`mx-auto w-full max-w-6xl px-4 ${compact ? "py-6" : "py-10"}`}>
        {children}
      </main>
    </div>
  );
}
