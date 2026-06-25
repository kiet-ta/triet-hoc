import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { knowledgeApi, type KnowledgeNode } from "../features/knowledge/api/knowledgeApi";
import { KnowledgeGraph } from "../features/knowledge/components/KnowledgeGraph";
import { KnowledgeSidebar } from "../features/knowledge/components/KnowledgeSidebar";
import { LoadingState } from "../shared/components/LoadingState";
import { ErrorState } from "../shared/components/ErrorState";
import { PageShell } from "../shared/components/PageShell";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Palette } from "lucide-react";

export type BgMode = "universe" | "blueprint" | "paper";

export function KnowledgePage() {
  const [activeNode, setActiveNode] = useState<KnowledgeNode | null>(null);
  const [bgMode, setBgMode] = useState<BgMode>("universe");
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const { data, isLoading, error } = useQuery({
    queryKey: ["knowledge_graph"],
    queryFn: () => knowledgeApi.getGraph(),
  });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const handleSelectNodeSlug = (slug: string) => {
    if (data) {
      const node = data.nodes.find((n) => n.id === slug);
      if (node) setActiveNode(node);
    }
  };

  const handleToggleBg = () => {
    setBgMode(prev => {
      if (prev === "universe") return "blueprint";
      if (prev === "blueprint") return "paper";
      return "universe";
    });
  };

  const getBgLabel = () => {
    if (bgMode === "universe") return "Vũ trụ";
    if (bgMode === "blueprint") return "Bản vẽ";
    return "Giấy ô ly";
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 flex flex-col relative">
      {/* Header */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-4 pointer-events-none">
        <Link 
          to="/" 
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 dark:bg-slate-900/80 shadow-lg backdrop-blur-sm text-ink dark:text-white hover:bg-teal hover:text-white dark:hover:bg-teal transition-all pointer-events-auto"
        >
          <ArrowLeft size={24} />
        </Link>
        <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 shadow-lg backdrop-blur-sm px-6 py-3 pointer-events-auto flex items-center justify-between gap-6">
          <div>
            <h1 className="text-xl font-black text-ink dark:text-white">Kho tàng Triết học</h1>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Giáo trình MLN122</p>
          </div>
          <button 
            onClick={handleToggleBg}
            className="flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 text-sm font-bold text-ink dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Đổi giao diện nền"
          >
            <Palette size={16} />
            <span className="hidden sm:inline">{getBgLabel()}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex w-full relative">
        <div ref={containerRef} className={`flex-1 h-full transition-all duration-300 ${activeNode ? "pr-[400px] lg:pr-[500px]" : ""}`}>
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center bg-white dark:bg-slate-900">
              <LoadingState />
            </div>
          ) : error ? (
            <div className="h-full w-full flex items-center justify-center bg-white dark:bg-slate-900">
              <ErrorState message="Không tải được dữ liệu đồ thị." />
            </div>
          ) : data ? (
            <KnowledgeGraph 
              data={data} 
              onNodeClick={setActiveNode} 
              width={dimensions.width} 
              height={dimensions.height} 
              bgMode={bgMode}
            />
          ) : null}
        </div>

        {/* Sidebar Panel */}
        <div 
          className={`absolute top-0 right-0 h-full w-[400px] lg:w-[500px] transform transition-transform duration-300 ease-in-out ${
            activeNode ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <KnowledgeSidebar 
            activeNode={activeNode} 
            onClose={() => setActiveNode(null)} 
            onSelectNode={handleSelectNodeSlug}
          />
        </div>
      </div>
    </div>
  );
}
