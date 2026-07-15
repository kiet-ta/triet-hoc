import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PauseCircle, PlayCircle, PowerOff, ShieldCheck } from "lucide-react";

import { adminApi, type CourseStatus } from "../../features/admin/api/adminApi";
import { AdminLayout } from "../../features/admin/components/AdminLayout";
import { Button } from "../../shared/components/Button";
import { Card } from "../../shared/components/Card";
import { ErrorState } from "../../shared/components/ErrorState";
import { LoadingState } from "../../shared/components/LoadingState";

const COURSE_META: Record<string, { label: string; subtitle: string }> = {
  MLN111: { label: "MLN111", subtitle: "Triết học Mác - Lênin" },
  MLN122: { label: "MLN122", subtitle: "Kinh tế Chính trị Mác - Lênin" },
};

function CourseCard({ status }: { status: CourseStatus }) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState(status.message ?? "");
  const meta = COURSE_META[status.courseCode] ?? {
    label: status.courseCode,
    subtitle: "",
  };

  // Đồng bộ lại nội dung thông báo khi dữ liệu server thay đổi.
  useEffect(() => {
    setMessage(status.message ?? "");
  }, [status.message]);

  const mutation = useMutation({
    mutationFn: (next: { isSuspended: boolean; message: string | null }) =>
      adminApi.setCourseStatus(status.courseCode, next.isSuspended, next.message),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin_courses"] });
    },
  });

  const suspended = status.isSuspended;

  return (
    <Card>
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-ink dark:text-white">{meta.label}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{meta.subtitle}</p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
              suspended
                ? "bg-red-500/10 text-red-600 dark:text-red-400"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {suspended ? <PowerOff size={14} /> : <ShieldCheck size={14} />}
            {suspended ? "Đang tạm ngưng" : "Đang mở"}
          </span>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-ink dark:text-white">
            Thông báo hiển thị cho người truy cập (tuỳ chọn)
          </label>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={2}
            placeholder="VD: Khoá đang bảo trì, hẹn gặp lại các bạn sau 20h nhé!"
            className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink shadow-inner outline-none focus:border-teal dark:border-white/15 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {suspended ? (
            <Button
              type="button"
              onClick={() =>
                mutation.mutate({ isSuspended: false, message: message.trim() || null })
              }
              disabled={mutation.isPending}
            >
              <PlayCircle className="h-4 w-4" aria-hidden="true" />
              Tiếp tục truy cập
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                mutation.mutate({ isSuspended: true, message: message.trim() || null })
              }
              disabled={mutation.isPending}
              className="border border-red-500/40 text-red-600 hover:bg-red-500/10 dark:text-red-400"
            >
              <PauseCircle className="h-4 w-4" aria-hidden="true" />
              Tạm ngưng truy cập
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              mutation.mutate({ isSuspended: suspended, message: message.trim() || null })
            }
            disabled={mutation.isPending || (status.message ?? "") === message.trim()}
          >
            Lưu thông báo
          </Button>
          {mutation.isPending ? (
            <span className="text-sm text-slate-500">Đang lưu...</span>
          ) : null}
          {mutation.isError ? (
            <span className="text-sm font-semibold text-red-500">
              {mutation.error instanceof Error ? mutation.error.message : "Có lỗi xảy ra"}
            </span>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export function AdminCoursesPage() {
  const { data: statuses, isLoading, error } = useQuery({
    queryKey: ["admin_courses"],
    queryFn: () => adminApi.courseStatuses(),
    refetchInterval: 15000,
  });

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
          <PowerOff size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-ink dark:text-white">Trạng thái khoá học</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tạm ngưng hoặc tiếp tục truy cập cho toàn bộ người dùng và khách vãng lai
          </p>
        </div>
      </div>

      {isLoading ? <LoadingState /> : null}
      {error ? (
        <ErrorState message={error instanceof Error ? error.message : "Có lỗi xảy ra"} />
      ) : null}

      {statuses ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {statuses.map((status) => (
            <CourseCard key={status.courseCode} status={status} />
          ))}
        </div>
      ) : null}
    </AdminLayout>
  );
}
