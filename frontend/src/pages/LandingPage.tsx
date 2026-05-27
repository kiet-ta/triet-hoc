import { ArrowRight, History, Sparkles } from "lucide-react";

import { ButtonLink } from "../shared/components/Button";
import { Illustration } from "../shared/illustrations";

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="text-lg font-black">Triết Học Là Gì</div>
        <ButtonLink to="/history" variant="ghost">
          <History className="h-4 w-4" aria-hidden="true" />
          Lịch sử
        </ButtonLink>
      </header>
      <main className="mx-auto flex min-h-[calc(100vh-84px)] max-w-6xl flex-col items-center justify-center px-4 pb-12 text-center">
        <div className="relative w-full max-w-4xl">
          <div className="mx-auto mb-2 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-black shadow-soft">
            <Sparkles className="h-4 w-4 text-coral" aria-hidden="true" />
            Quiz học thuật nhưng không làm mặt nghiêm 24/7
          </div>
          <h1 className="text-5xl font-black leading-none text-ink md:text-7xl">Triết Học Là Gì</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg font-semibold leading-8 text-ink/75">
            Một bài quiz giúp bạn phát hiện mình đang vô tình sống như triết gia nào.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-ink/65">
            Bạn tưởng bạn chỉ đang sống bình thường, nhưng thật ra có thể đang roleplay một triết gia
            ngoài đời.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink to="/quiz/intro" className="text-base">
              Bắt đầu quiz
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </ButtonLink>
            <ButtonLink to="/about" variant="ghost">
              Ai đứng sau vậy? 🤔
            </ButtonLink>
          </div>
          <Illustration illustrationKey="cartoon_philosopher" className="mx-auto mt-8 h-52 w-full max-w-sm animate-float drop-shadow-xl" />
          <p className="mx-auto mt-6 max-w-xl rounded-lg bg-white px-4 py-3 text-sm font-semibold text-ink/65 shadow-soft">
            Đây là quiz phản tư vui cho bài học, không phải chẩn đoán tâm lý hay kết luận chuyên môn.
          </p>
        </div>
      </main>
    </div>
  );
}
