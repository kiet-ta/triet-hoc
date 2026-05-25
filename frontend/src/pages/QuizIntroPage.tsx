import { ArrowRight, ListChecks, SlidersHorizontal } from "lucide-react";
import { useEffect } from "react";

import { useQuizStore } from "../features/quiz/stores/quizStore";
import { ButtonLink } from "../shared/components/Button";
import { Card } from "../shared/components/Card";
import { PageShell } from "../shared/components/PageShell";
import { Illustration } from "../shared/illustrations";

export function QuizIntroPage() {
  const reset = useQuizStore((state) => state.reset);

  useEffect(() => {
    reset();
  }, [reset]);

  return (
    <PageShell>
      <div className="grid gap-8 md:grid-cols-[1fr_320px] md:items-center">
        <div>
          <h1 className="text-4xl font-black leading-tight md:text-5xl">Trước khi soi triết gia nội tâm</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-ink/70">
            Bạn sẽ trả lời 20 câu hỏi theo tình huống đời thường. Mỗi câu dùng thang 1-5, từ rất không
            đồng ý đến rất đồng ý.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Card>
              <ListChecks className="h-6 w-6 text-teal" aria-hidden="true" />
              <h2 className="mt-3 text-lg font-black">20 câu, 4 mảng</h2>
              <p className="mt-2 text-sm leading-6 text-ink/65">
                Ý nghĩa, công việc, xã hội, cảm xúc. Đủ để tự nhận thức, chưa đủ để phán xét cả đời.
              </p>
            </Card>
            <Card>
              <SlidersHorizontal className="h-6 w-6 text-coral" aria-hidden="true" />
              <h2 className="mt-3 text-lg font-black">Thang 1-5</h2>
              <p className="mt-2 text-sm leading-6 text-ink/65">
                Không có đáp án đúng sai. Chỉ có bạn và những pha tự nhận thức hơi đau nhẹ.
              </p>
            </Card>
          </div>
          <div className="mt-8">
            <ButtonLink to="/quiz">
              Vào quiz
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </ButtonLink>
          </div>
        </div>
        <Illustration illustrationKey="deadline_monster" className="mx-auto h-72 w-full max-w-xs" />
      </div>
    </PageShell>
  );
}
