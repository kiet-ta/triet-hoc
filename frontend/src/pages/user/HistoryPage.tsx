import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageShell } from "../../shared/components/PageShell";
import { useAuthStore } from "../../features/auth/stores/authStore";
import { usersApi, HistoryItem } from "../../features/auth/api/usersApi";
import { Clock, ExternalLink } from "lucide-react";

export const UserHistoryPage = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    usersApi
      .getHistory()
      .then((data) => setHistory(data))
      .catch((err) => setError(err.message || "Lỗi tải lịch sử"))
      .finally(() => setLoading(false));
  }, [isAuthenticated, navigate]);

  return (
    <PageShell>
      <div className="mx-auto mt-12 w-full max-w-4xl px-4 md:mt-24">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal/10 text-teal">
            <Clock size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-ink dark:text-white">Lịch sử của tôi</h1>
            <p className="text-slate-500 dark:text-slate-400">
              Xin chào, {user?.name || user?.email}! Đây là những lần bạn đã khám phá bản ngã.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-8 rounded-xl bg-red-500/10 p-4 text-red-500">{error}</div>
        )}

        {loading ? (
          <div className="text-center text-slate-500 dark:text-slate-400">Đang tải lịch sử...</div>
        ) : history.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-xl dark:bg-slate-900">
            <div className="mb-4 text-4xl">🌱</div>
            <h2 className="mb-2 text-xl font-bold text-ink dark:text-white">Chưa có dữ liệu</h2>
            <p className="mb-6 text-slate-500 dark:text-slate-400">
              Bạn chưa hoàn thành bài trắc nghiệm nào cả.
            </p>
            <Link
              to="/quiz/MLN111"
              className="inline-flex rounded-xl bg-teal px-6 py-3 font-bold text-white shadow-lg shadow-teal/30 hover:-translate-y-1 hover:shadow-teal/50"
            >
              Làm trắc nghiệm ngay
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-400">
                    {new Date(item.created_at).toLocaleDateString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <h3 className="mt-1 text-lg font-black leading-tight text-ink dark:text-white">
                    {item.result_summary || "Chưa hoàn thành"}
                  </h3>
                </div>
                <div className="mt-auto flex justify-end">
                  <Link
                    to={`/results/${item.share_slug}`}
                    className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                  >
                    Xem thẻ <ExternalLink size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
};
