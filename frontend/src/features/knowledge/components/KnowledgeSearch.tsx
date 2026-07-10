import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Loader2 } from "lucide-react";
import { knowledgeApi, type KnowledgeSearchResult } from "../api/knowledgeApi";
import { useIsMobile } from "../../../shared/hooks/useIsMobile";

type Props = {
  onSelectNode: (slug: string) => void;
};

function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx === -1) return text;

  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-teal/20 text-teal dark:bg-teal/30 px-0.5 font-semibold">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function KnowledgeSearch({ onSelectNode }: Props) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const collapsedOnMobile = isMobile && !isExpanded;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        if (isMobile && !query) setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, query]);

  useEffect(() => {
    if (isMobile && isExpanded) inputRef.current?.focus();
  }, [isMobile, isExpanded]);

  const { data, isFetching } = useQuery({
    queryKey: ["knowledge_search", debouncedQuery],
    queryFn: () => knowledgeApi.search(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  const results: KnowledgeSearchResult[] = data?.results ?? [];
  const showDropdown = isOpen && debouncedQuery.length >= 2;

  const handleSelect = (slug: string) => {
    onSelectNode(slug);
    setIsOpen(false);
    setQuery("");
    setDebouncedQuery("");
    if (isMobile) setIsExpanded(false);
  };

  const handleClear = () => {
    setQuery("");
    setDebouncedQuery("");
    setIsOpen(false);
  };

  if (collapsedOnMobile) {
    return (
      <div className="pointer-events-auto">
        <button
          onClick={() => setIsExpanded(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 dark:bg-slate-900/80 shadow-lg backdrop-blur-sm text-ink dark:text-white hover:bg-teal hover:text-white dark:hover:bg-teal transition-all"
          aria-label="Tìm kiếm"
        >
          <Search size={20} />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full sm:max-w-sm pointer-events-auto">
      <div className="flex h-12 items-center gap-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 shadow-lg backdrop-blur-sm px-4 text-ink dark:text-white">
        <Search size={18} className="flex-shrink-0 text-slate-400" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Tìm khái niệm, từ khoá trong nội dung..."
          className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
        />
        {isFetching ? (
          <Loader2 size={16} className="flex-shrink-0 animate-spin text-slate-400" />
        ) : query ? (
          <button
            onClick={handleClear}
            className="flex-shrink-0 rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-ink dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        ) : isMobile ? (
          <button
            onClick={() => setIsExpanded(false)}
            className="flex-shrink-0 rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-ink dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-14 z-30 max-h-[60vh] overflow-y-auto rounded-2xl bg-white/95 dark:bg-slate-900/95 shadow-2xl backdrop-blur-sm border border-slate-200 dark:border-slate-800 p-2">
          {isFetching && results.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-400">Đang tìm...</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-400">
              Không tìm thấy khái niệm nào chứa "{debouncedQuery}".
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {results.map((r) => (
                <li key={r.slug}>
                  <button
                    onClick={() => handleSelect(r.slug)}
                    className="group flex w-full flex-col gap-0.5 rounded-xl px-3 py-2 text-left transition-colors hover:bg-teal/10"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-ink dark:text-white group-hover:text-teal transition-colors">
                        {highlightMatch(r.title, debouncedQuery)}
                      </span>
                      <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        {r.type}
                      </span>
                    </div>
                    <p className="text-xs leading-snug text-slate-500 dark:text-slate-400">
                      {highlightMatch(r.snippet, debouncedQuery)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
