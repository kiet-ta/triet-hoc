import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

type PageShellProps = {
  children: ReactNode;
  compact?: boolean;
};

import { motion } from "framer-motion";
import { useAuthStore } from "../../features/auth/stores/authStore";

const MotionLink = motion(Link);

export function PageShell({ children, compact = false }: PageShellProps) {
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <div className="min-h-screen">
      <header className="transition-colors">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <MotionLink whileTap={{ scale: 0.95 }} to="/" className="text-lg font-black tracking-normal text-ink dark:text-white">
            TriếtHọclàgì?
          </MotionLink>
          <nav className="flex items-center gap-2 text-sm font-semibold">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <MotionLink whileTap={{ scale: 0.95 }} className="rounded-lg px-3 py-2 hover:bg-white dark:hover:bg-ink/20 dark:text-white transition-colors" to="/user/history">
                  Lịch sử ({user?.name || 'User'})
                </MotionLink>
                <button onClick={logout} className="rounded-lg px-3 py-2 hover:bg-white dark:hover:bg-ink/20 dark:text-white transition-colors">
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <MotionLink whileTap={{ scale: 0.95 }} className="rounded-lg px-3 py-2 hover:bg-white dark:hover:bg-ink/20 dark:text-white transition-colors" to="/history">
                  Lịch sử ẩn danh
                </MotionLink>
                <MotionLink whileTap={{ scale: 0.95 }} className="rounded-lg bg-teal px-4 py-2 text-white hover:bg-teal-600 transition-colors" to="/login">
                  Đăng nhập
                </MotionLink>
              </>
            )}
            <MotionLink whileTap={{ scale: 0.95 }} className="hidden sm:inline-block rounded-lg px-3 py-2 hover:bg-white dark:hover:bg-ink/20 dark:text-white transition-colors" to="/about">
              Về tụi mình 🤝
            </MotionLink>
          </nav>
        </div>
      </header>
      <main className={`mx-auto w-full max-w-6xl px-4 ${compact ? "py-6" : "py-10"}`}>
        {children}
      </main>
    </div>
  );
}
