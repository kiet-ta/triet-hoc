import { RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useQuizStore } from "../features/quiz/stores/quizStore";
import { ResultExplanation } from "../features/results/components/ResultExplanation";
import { ScoreBarChart } from "../features/results/components/ScoreBarChart";
import { ShareResultButton } from "../features/results/components/ShareResultButton";
import { TopThreeRanking } from "../features/results/components/TopThreeRanking";
import type { PublicResult } from "../features/results/types/resultTypes";
import { httpClient } from "../shared/api/httpClient";
import { ButtonLink } from "../shared/components/Button";
import { Card } from "../shared/components/Card";
import { ErrorState } from "../shared/components/ErrorState";
import { LoadingState } from "../shared/components/LoadingState";
import { PageShell } from "../shared/components/PageShell";
import { Illustration } from "../shared/illustrations";
import { formatPercent } from "../shared/utils/formatPercent";

export function ResultPage() {
  const { shareSlug } = useParams();
  const reset = useQuizStore((state) => state.reset);
  const [result, setResult] = useState<PublicResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResult() {
      if (!shareSlug) return;
      setLoading(true);
      try {
        setResult(await httpClient.get<PublicResult>(`/results/${shareSlug}`));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không tải được kết quả.");
      } finally {
        setLoading(false);
      }
    }
    void loadResult();
  }, [shareSlug]);

  if (loading) {
    return (
      <PageShell>
        <LoadingState label="Đang mở phong bì triết học..." />
      </PageShell>
    );
  }

  if (error || !result) {
    return (
      <PageShell>
        <ErrorState message={error ?? "Không có kết quả."} />
      </PageShell>
    );
  }

  const dominantScore = result.topThree[0];

  return (
    <PageShell>
      <div className="space-y-8">
        <Card className="grid gap-6 bg-lemon md:grid-cols-[1fr_240px] md:items-center">
          <div>
            <div className="text-sm font-black uppercase tracking-normal text-ink/60">Kết quả nổi bật</div>
            <h1 className="mt-2 text-3xl font-black leading-tight md:text-5xl">
              Bạn nghiêng về {result.dominant.nameVi}
            </h1>
            <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-ink/75">
              {result.resultSummary}
            </p>
            <div className="mt-4 text-4xl font-black text-teal">
              {formatPercent(dominantScore.percentage)}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <ShareResultButton shareSlug={result.shareSlug} />
              <ButtonLink to="/quiz/intro" variant="ghost" onClick={reset}>
                <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                Làm lại quiz
              </ButtonLink>
            </div>
          </div>
          <Illustration illustrationKey={result.dominant.illustrationKey} className="mx-auto h-56 w-full max-w-xs" />
        </Card>
        <section>
          <h2 className="mb-3 text-2xl font-black">Top 3 xu hướng</h2>
          <TopThreeRanking items={result.topThree} />
        </section>
        <section>
          <h2 className="mb-3 text-2xl font-black">Bảng điểm toàn bộ hệ</h2>
          <ScoreBarChart data={result.scoreBreakdown} />
        </section>
        <section>
          <h2 className="mb-3 text-2xl font-black">Giải thích chi tiết</h2>
          <ResultExplanation result={result} />
        </section>
      </div>
    </PageShell>
  );
}
