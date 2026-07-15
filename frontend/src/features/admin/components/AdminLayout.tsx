import type { ReactNode } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";

import { Button } from "../../../shared/components/Button";
import { PageShell } from "../../../shared/components/PageShell";
import { adminApi, getAdminToken } from "../api/adminApi";

const links = [
  { href: "/admin", label: "Tổng quan" },
  { href: "/admin/visitors", label: "Chi tiết truy cập" },
  { href: "/admin/users", label: "Người dùng" },
  { href: "/admin/questions", label: "Câu hỏi" },
  { href: "/admin/philosophies", label: "Hồ sơ triết học" },
  { href: "/admin/courses", label: "Trạng thái khoá" },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  if (!getAdminToken()) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <PageShell compact>
      <div className="mb-6 flex flex-col gap-3 rounded-lg border border-ink/10 bg-white p-3 shadow-soft md:flex-row md:items-center md:justify-between">
        <nav className="flex flex-wrap gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`rounded-lg px-3 py-2 text-sm font-bold ${
                location.pathname === link.href ? "bg-ink text-white" : "bg-paper text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            adminApi.logout();
            window.location.href = "/admin/login";
          }}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Đăng xuất
        </Button>
      </div>
      {children}
    </PageShell>
  );
}
