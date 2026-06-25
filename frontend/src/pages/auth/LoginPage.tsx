import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageShell } from "../../shared/components/PageShell";
import { useAuthStore } from "../../features/auth/stores/authStore";
import { authApi } from "../../features/auth/api/authApi";
import { usersApi } from "../../features/auth/api/usersApi";
import { LogIn } from "lucide-react";
import { SyncHistoryModal } from "../../features/auth/components/SyncHistoryModal";
import { getAnonymousClientId } from "../../shared/utils/anonymousClientId";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLoginSuccess = async () => {
    try {
      const clientId = getAnonymousClientId();
      const res = await usersApi.checkUnsynced(clientId);
      if (res.count > 0) {
        setUnsyncedCount(res.count);
        setShowSyncModal(true);
      } else {
        navigate("/");
      }
    } catch {
      navigate("/");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const authRes = await authApi.login({ email, password });
      const user = await authApi.getMe();
      setAuth(authRes.access_token, user);
      await handleLoginSuccess();
    } catch (err: any) {
      setError(err.message || "Đăng nhập thất bại");
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <div className="flex w-full max-w-md flex-col gap-6 rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900 mx-auto mt-12 md:mt-24">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal/10 text-teal">
            <LogIn size={32} />
          </div>
          <h1 className="text-2xl font-black text-ink dark:text-white">Đăng nhập</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Lưu lại thẻ nhân phẩm của bạn.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/10 p-4 text-center text-sm font-semibold text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 bg-transparent px-4 py-3 text-ink outline-none transition-all focus:border-teal dark:border-slate-800 dark:text-white dark:focus:border-teal"
              placeholder="nhanpham@example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Mật khẩu
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 bg-transparent px-4 py-3 text-ink outline-none transition-all focus:border-teal dark:border-slate-800 dark:text-white dark:focus:border-teal"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-teal px-6 py-4 font-bold text-white shadow-lg shadow-teal/30 transition-all hover:-translate-y-1 hover:shadow-teal/50 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {loading ? "Đang xử lý..." : "Đăng nhập ngay"}
          </button>
        </form>

        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="font-bold text-teal hover:underline">
            Tạo tài khoản mới
          </Link>
        </div>
      </div>
      
      <SyncHistoryModal 
        isOpen={showSyncModal} 
        onClose={() => setShowSyncModal(false)}
        anonymousClientId={getAnonymousClientId()}
        count={unsyncedCount}
      />
    </PageShell>
  );
};
