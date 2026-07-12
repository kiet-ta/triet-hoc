import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Eye,
  Globe,
  Monitor,
  Search,
  Smartphone,
  Tablet,
  Users,
  X,
} from "lucide-react";

import { adminApi } from "../../features/admin/api/adminApi";
import { AdminLayout } from "../../features/admin/components/AdminLayout";
import { Card } from "../../shared/components/Card";
import { ErrorState } from "../../shared/components/ErrorState";
import { LoadingState } from "../../shared/components/LoadingState";

type VisitorItem = {
  id: string;
  anonymousClientId: string;
  ipAddress: string | null;
  userAgent: string | null;
  browser: string | null;
  browserVersion: string | null;
  os: string | null;
  osVersion: string | null;
  deviceType: string | null;
  acceptLanguage: string | null;
  referer: string | null;
  screenWidth: number | null;
  screenHeight: number | null;
  viewportWidth: number | null;
  viewportHeight: number | null;
  pixelRatio: number | null;
  colorDepth: number | null;
  cpuCores: number | null;
  deviceMemory: number | null;
  maxTouchPoints: number | null;
  gpuRenderer: string | null;
  connectionType: string | null;
  downlinkSpeed: number | null;
  cookiesEnabled: boolean | null;
  doNotTrack: boolean | null;
  darkMode: boolean | null;
  reducedMotion: boolean | null;
  pdfViewer: boolean | null;
  pluginsCount: number | null;
  timezone: string | null;
  language: string | null;
  languages: string | null;
  platform: string | null;
  pageUrl: string | null;
  canvasHash: string | null;
  webglHash: string | null;
  batteryLevel: number | null;
  batteryCharging: boolean | null;
  createdAt: string;
};

type VisitorStats = {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  todayUnique: number;
  topBrowsers: { name: string; count: number }[];
  topOS: { name: string; count: number }[];
  topDeviceTypes: { name: string; count: number }[];
  topCountries: { name: string; count: number }[];
};

type VisitorListResponse = {
  visitors: VisitorItem[];
  total: number;
  page: number;
  pageSize: number;
  stats: VisitorStats;
};

const PIE_COLORS = ["#6B5DD3", "#38B2AC", "#F56565", "#ED8936", "#ECC94B", "#4299E1", "#EC4899", "#8B5CF6", "#10B981", "#F59E0B"];

const DeviceIcon = ({ type }: { type: string | null }) => {
  if (type === "mobile") return <Smartphone size={14} className="text-rose-500" />;
  if (type === "tablet") return <Tablet size={14} className="text-amber-500" />;
  return <Monitor size={14} className="text-blue-500" />;
};

export function AdminVisitorsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [deviceFilter, setDeviceFilter] = useState<string | undefined>();
  const [browserFilter, setBrowserFilter] = useState<string | undefined>();
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorItem | null>(null);

  const { data, isLoading, error } = useQuery<VisitorListResponse>({
    queryKey: ["admin_visitors", page, search, deviceFilter, browserFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("page_size", "50");
      if (search) params.set("search", search);
      if (deviceFilter) params.set("device_type", deviceFilter);
      if (browserFilter) params.set("browser", browserFilter);
      return adminApi.get<VisitorListResponse>(`/admin/visitors?${params.toString()}`);
    },
    refetchInterval: 15000,
  });

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
            <Eye className="animate-pulse" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-ink dark:text-white">Chi tiết truy cập</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Nghiên cứu hành vi người dùng chi tiết</p>
          </div>
        </div>
      </div>

      {isLoading && !data ? <LoadingState /> : null}
      {error ? <ErrorState message={error instanceof Error ? error.message : "Có lỗi xảy ra"} /> : null}

      {data ? (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Tổng lượt</p>
                <p className="text-2xl font-black text-ink dark:text-white">{data.stats.totalVisits.toLocaleString()}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal/10 text-teal">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Unique</p>
                <p className="text-2xl font-black text-ink dark:text-white">{data.stats.uniqueVisitors.toLocaleString()}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                <Eye size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Hôm nay</p>
                <p className="text-2xl font-black text-ink dark:text-white">{data.stats.todayVisits.toLocaleString()}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                <Globe size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Unique hôm nay</p>
                <p className="text-2xl font-black text-ink dark:text-white">{data.stats.todayUnique.toLocaleString()}</p>
              </div>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Browser Pie */}
            <Card>
              <h2 className="text-lg font-black dark:text-white">Trình duyệt</h2>
              <div className="mt-2 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.stats.topBrowsers}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.stats.topBrowsers.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* OS Bar */}
            <Card>
              <h2 className="text-lg font-black dark:text-white">Hệ điều hành</h2>
              <div className="mt-2 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.stats.topOS} layout="vertical" margin={{ left: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.3} />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={55} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                    <Bar dataKey="count" fill="#38B2AC" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Device Type Pie */}
            <Card>
              <h2 className="text-lg font-black dark:text-white">Loại thiết bị</h2>
              <div className="mt-2 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.stats.topDeviceTypes}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.stats.topDeviceTypes.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Timezone / Region */}
          {data.stats.topCountries.length > 0 && (
            <Card>
              <h2 className="text-lg font-black dark:text-white">Múi giờ / Khu vực</h2>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.stats.topCountries} margin={{ bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} />
                    <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                    <Bar dataKey="count" fill="#6B5DD3" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Filters */}
          <Card>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-ink/70 dark:text-white/70">Thiết bị:</span>
                {["all", "desktop", "mobile", "tablet"].map((d) => (
                  <button
                    key={d}
                    onClick={() => { setDeviceFilter(d === "all" ? undefined : d); setPage(1); }}
                    className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-colors ${
                      (d === "all" && !deviceFilter) || deviceFilter === d
                        ? "bg-ink text-white dark:bg-white dark:text-ink"
                        : "bg-ink/5 text-ink/70 hover:bg-ink/10 dark:bg-white/5 dark:text-white/70"
                    }`}
                  >
                    {d === "all" ? "Tất cả" : d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>

              <form
                className="flex items-center gap-2"
                onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
              >
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm IP hoặc Client ID..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="rounded-lg border border-ink/10 bg-white py-2 pl-9 pr-3 text-sm font-medium text-ink outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 dark:border-white/10 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-lg bg-ink px-4 py-2 text-sm font-bold text-white hover:bg-black dark:bg-white dark:text-ink dark:hover:bg-slate-200 transition-colors"
                >
                  Tìm
                </button>
                {search && (
                  <button
                    type="button"
                    onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
                    className="rounded-lg bg-red-500/10 p-2 text-red-500 hover:bg-red-500/20 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </form>
            </div>
          </Card>

          {/* Visitor Table */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black dark:text-white">
                Danh sách truy cập ({data.total.toLocaleString()} lượt)
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>Trang {page}/{totalPages || 1}</span>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-ink/10 dark:border-white/10">
                    <th className="py-3 font-semibold">Thời gian</th>
                    <th className="font-semibold">IP</th>
                    <th className="font-semibold">Thiết bị</th>
                    <th className="font-semibold">Trình duyệt</th>
                    <th className="font-semibold">Hệ điều hành</th>
                    <th className="font-semibold">Màn hình</th>
                    <th className="font-semibold">Múi giờ</th>
                    <th className="font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.visitors.map((v) => (
                    <tr
                      key={v.id}
                      className="border-b border-ink/5 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedVisitor(v)}
                    >
                      <td className="py-3 whitespace-nowrap">{new Date(v.createdAt).toLocaleString("vi-VN")}</td>
                      <td className="font-mono text-xs">{v.ipAddress || "—"}</td>
                      <td>
                        <span className="inline-flex items-center gap-1.5">
                          <DeviceIcon type={v.deviceType} />
                          <span className="capitalize">{v.deviceType || "—"}</span>
                        </span>
                      </td>
                      <td>{v.browser ? `${v.browser} ${v.browserVersion || ""}` : "—"}</td>
                      <td>{v.os ? `${v.os} ${v.osVersion || ""}` : "—"}</td>
                      <td className="whitespace-nowrap">{v.screenWidth && v.screenHeight ? `${v.screenWidth}×${v.screenHeight}` : "—"}</td>
                      <td className="text-xs">{v.timezone || "—"}</td>
                      <td>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedVisitor(v); }}
                          className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 transition-colors"
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                  {data.visitors.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">Chưa có dữ liệu truy cập</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : null}

      {/* Detail Modal */}
      {selectedVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setSelectedVisitor(null)}>
          <div
            className="mx-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 pb-2">
              <h2 className="text-xl font-black text-ink dark:text-white">Chi tiết phiên truy cập</h2>
              <button
                onClick={() => setSelectedVisitor(null)}
                className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <SectionTitle title="📌 Thông tin chung" />
              <DetailRow label="Thời gian" value={new Date(selectedVisitor.createdAt).toLocaleString("vi-VN")} />
              <DetailRow label="Client ID" value={selectedVisitor.anonymousClientId} mono />
              <DetailRow label="Địa chỉ IP" value={selectedVisitor.ipAddress} mono />
              <DetailRow label="Trang truy cập" value={selectedVisitor.pageUrl} mono />

              <SectionTitle title="🌐 Trình duyệt & Hệ điều hành" />
              <DetailRow label="Trình duyệt" value={selectedVisitor.browser ? `${selectedVisitor.browser} ${selectedVisitor.browserVersion || ""}` : null} />
              <DetailRow label="Hệ điều hành" value={selectedVisitor.os ? `${selectedVisitor.os} ${selectedVisitor.osVersion || ""}` : null} />
              <DetailRow label="Loại thiết bị" value={selectedVisitor.deviceType} />
              <DetailRow label="Platform" value={selectedVisitor.platform} />

              <SectionTitle title="🖥️ Màn hình & Hiển thị" />
              <DetailRow label="Độ phân giải" value={selectedVisitor.screenWidth && selectedVisitor.screenHeight ? `${selectedVisitor.screenWidth} × ${selectedVisitor.screenHeight}` : null} />
              <DetailRow label="Viewport" value={selectedVisitor.viewportWidth && selectedVisitor.viewportHeight ? `${selectedVisitor.viewportWidth} × ${selectedVisitor.viewportHeight}` : null} />
              <DetailRow label="Pixel Ratio" value={selectedVisitor.pixelRatio ? `${selectedVisitor.pixelRatio}x` : null} />
              <DetailRow label="Độ sâu màu" value={selectedVisitor.colorDepth ? `${selectedVisitor.colorDepth}-bit` : null} />

              <SectionTitle title="⚙️ Phần cứng" />
              <DetailRow label="CPU Cores" value={selectedVisitor.cpuCores?.toString()} />
              <DetailRow label="RAM" value={selectedVisitor.deviceMemory ? `${selectedVisitor.deviceMemory} GB` : null} />
              <DetailRow label="GPU" value={selectedVisitor.gpuRenderer} />
              <DetailRow label="Touch Points" value={selectedVisitor.maxTouchPoints?.toString()} />

              <SectionTitle title="📡 Mạng" />
              <DetailRow label="Loại kết nối" value={selectedVisitor.connectionType} />
              <DetailRow label="Downlink" value={selectedVisitor.downlinkSpeed ? `${selectedVisitor.downlinkSpeed} Mbps` : null} />

              <SectionTitle title="🔋 Pin" />
              <DetailRow label="Mức pin" value={selectedVisitor.batteryLevel != null ? `${selectedVisitor.batteryLevel}%` : null} />
              <DetailRow label="Đang sạc" value={fmtBool(selectedVisitor.batteryCharging, "✅ Có", "❌ Không")} />

              <SectionTitle title="🎨 Tuỳ chọn người dùng" />
              <DetailRow label="Dark Mode" value={fmtBool(selectedVisitor.darkMode, "🌙 Bật", "☀️ Tắt")} />
              <DetailRow label="Reduced Motion" value={fmtBool(selectedVisitor.reducedMotion)} />
              <DetailRow label="Do Not Track" value={fmtBool(selectedVisitor.doNotTrack)} />
              <DetailRow label="Cookies" value={fmtBool(selectedVisitor.cookiesEnabled, "✅ Bật", "❌ Tắt")} />
              <DetailRow label="PDF Viewer" value={fmtBool(selectedVisitor.pdfViewer, "Có", "Không")} />
              <DetailRow label="Plugins" value={selectedVisitor.pluginsCount?.toString()} />

              <SectionTitle title="🌍 Ngôn ngữ & Vị trí" />
              <DetailRow label="Múi giờ" value={selectedVisitor.timezone} />
              <DetailRow label="Ngôn ngữ chính" value={selectedVisitor.language} />
              <DetailRow label="Tất cả ngôn ngữ" value={selectedVisitor.languages} />
              <DetailRow label="Accept-Language" value={selectedVisitor.acceptLanguage} mono />

              <SectionTitle title="🔑 Fingerprints" />
              <DetailRow label="Canvas Hash" value={selectedVisitor.canvasHash} mono />
              <DetailRow label="WebGL Hash" value={selectedVisitor.webglHash} mono />
              <DetailRow label="Referer" value={selectedVisitor.referer} mono />

              <SectionTitle title="📋 Raw Data" />
              <div>
                <p className="mb-1 font-semibold text-slate-500 dark:text-slate-400">User-Agent đầy đủ</p>
                <p className="rounded-xl bg-slate-50 p-3 font-mono text-xs break-all text-ink/80 dark:bg-slate-800 dark:text-white/80">
                  {selectedVisitor.userAgent || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string | null | undefined; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 font-semibold text-slate-500 dark:text-slate-400">{label}</span>
      <span className={`text-right text-ink dark:text-white ${mono ? "font-mono text-xs break-all" : ""}`}>
        {value || "—"}
      </span>
    </div>
  );
}

function fmtBool(value: boolean | null, on = "Bật", off = "Tắt"): string | null {
  if (value == null) return null;
  return value ? on : off;
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h3 className="mt-6 mb-2 font-bold text-ink dark:text-white border-b border-ink/5 dark:border-white/5 pb-2">
      {title}
    </h3>
  );
}
