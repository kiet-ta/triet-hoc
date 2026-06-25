import { CloudDownload, Trash2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { usersApi } from "../api/usersApi";
import { useNavigate } from "react-router-dom";

type SyncHistoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  anonymousClientId: string;
  count: number;
};

export function SyncHistoryModal({ isOpen, onClose, anonymousClientId, count }: SyncHistoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleSync = async () => {
    setLoading(true);
    try {
      await usersApi.syncHistory(anonymousClientId);
      localStorage.removeItem("anonymousClientId");
      onClose();
      navigate("/user/history");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    localStorage.removeItem("anonymousClientId");
    onClose();
    navigate("/");
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-ink/60 backdrop-blur-sm dark:bg-black/60"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md pointer-events-auto overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900"
            >
              {/* Background gradient */}
              <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-teal/20 blur-3xl"></div>
              <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-indigo-500/20 blur-3xl"></div>

              <div className="relative p-8 text-center">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 rounded-full bg-ink/5 p-2 text-ink/50 transition-colors hover:bg-ink/10 dark:bg-white/5 dark:text-white/50 dark:hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal/10 text-teal">
                  <CloudDownload size={32} />
                </div>
                
                <h2 className="mb-2 text-2xl font-black text-ink dark:text-white">
                  Bạn có {count} kết quả chưa lưu!
                </h2>
                
                <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                  Hệ thống phát hiện bạn đã từng làm trắc nghiệm dưới chế độ ẩn danh. 
                  Bạn có muốn đồng bộ các kết quả này vào tài khoản hiện tại không?
                  <br/><br/>
                  <span className="text-red-500 font-bold">Nếu bạn chọn "Bỏ qua", các kết quả này sẽ bị xóa khỏi máy của bạn vĩnh viễn.</span>
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleSync}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal px-6 py-4 font-bold text-white shadow-lg shadow-teal/30 transition-all hover:-translate-y-1 hover:shadow-teal/50 disabled:opacity-50"
                  >
                    {loading ? "Đang đồng bộ..." : "Đồng ý đồng bộ"}
                  </button>
                  
                  <button
                    onClick={handleDiscard}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-red-500/20 bg-red-500/5 px-6 py-4 font-bold text-red-500 transition-colors hover:bg-red-500/10 dark:border-red-500/10"
                  >
                    <Trash2 size={18} />
                    Bỏ qua & Xóa dữ liệu cũ
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
