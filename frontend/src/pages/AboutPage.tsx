import { ArrowLeft, Brain, Code2, Compass, Glasses, Heart, Sparkles } from "lucide-react";
import { ButtonLink } from "../shared/components/Button";
import { Card } from "../shared/components/Card";
import { PageShell } from "../shared/components/PageShell";
import { Illustration } from "../shared/illustrations";

export function AboutPage() {
  const team = [
    {
      name: "Trương Đoàn Viên",
      role: "Cơ Trưởng Biện Chứng",
      icon: <Brain className="h-8 w-8 text-grape" />,
      bg: "bg-grape/10 border-grape/20",
      slogan: "Không có gì đứng yên cả, ngay cả điểm số môn Triết!",
      description: "Người cầm lái đưa con thuyền vượt qua các quy luật triết học hóc búa, luôn tin rằng mọi mâu thuẫn đều có thể giải quyết bằng một ly trà sữa.",
    },
    {
      name: "Trần Anh Kiệt",
      role: "Nhà Phân Tích Ý Thức",
      icon: <Glasses className="h-8 w-8 text-coral" />,
      bg: "bg-coral/10 border-coral/20",
      slogan: "Cơn buồn ngủ quyết định sự tập trung!",
      description: "Chuyên gia nghiên cứu mối quan hệ biện chứng giữa chiếc giường (vật chất) và tinh thần muốn đi học (ý thức). Kết quả: Chiếc giường luôn thắng.",
    },
    {
      name: "Nguyễn Phương Duy",
      role: "Kỹ Sư Ý Niệm Tuyệt Đối",
      icon: <Code2 className="h-8 w-8 text-teal" />,
      bg: "bg-teal/10 border-teal/20",
      slogan: "Code có thể có bug, nhưng thế giới quan của Mác luôn logic!",
      description: "Người chuyển hóa những học thuyết siêu hình và trừu tượng thành các dòng code React mượt mà, hy vọng không bị quy luật 'phủ định của phủ định' làm crash web.",
    },
    {
      name: "Đoàn Thị Kim Thuý",
      role: "Nữ Thần Thực Tiễn",
      icon: <Compass className="h-8 w-8 text-lemon" />,
      bg: "bg-lemon/20 border-lemon/30",
      slogan: "Lý luận không có thực tiễn chỉ là lý luận suông!",
      description: "Giữ vai trò người bảo vệ thực tiễn đời sống sinh viên, đảm bảo bài trắc nghiệm luôn phản ánh đúng thực tế 'cơm, áo, gạo, tiền' chứ không chỉ lý thuyết suông.",
    },
  ];

  return (
    <PageShell>
      <div className="relative">
        {/* Back Link */}
        <ButtonLink to="/" variant="ghost" className="mb-6 inline-flex items-center gap-2 self-start">
          <ArrowLeft className="h-4 w-4" />
          Quay lại Trang chủ
        </ButtonLink>

        <div className="grid gap-12 lg:grid-cols-[1fr_360px] lg:items-start">
          {/* Main Content */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-lemon px-4 py-1.5 text-xs font-black uppercase tracking-wider text-ink shadow-sm">
              <Sparkles className="h-3.5 w-3.5 animate-spin" />
              Sản phẩm sáng tạo MLN121
            </div>

            <h1 className="mt-4 text-4xl font-black leading-tight text-ink md:text-5xl">
              Tổ Bay Triết Học <br />
              <span className="text-teal">FPT University HCMC</span> 🚀
            </h1>

            <p className="mt-6 text-lg font-semibold leading-relaxed text-ink/80">
              Chào mừng bạn đến với <strong>Triết Học Là Gì</strong> - dự án "giải cứu giấc ngủ" cực kỳ chất lượng được sáng tạo bởi các sinh viên xuất sắc lớp Triết học <strong>MLN121</strong> tại Đại học FPT TP. Hồ Chí Minh!
            </p>

            <div className="mt-6 space-y-4 text-base leading-relaxed text-ink/70">
              <p>
                Bạn đã bao giờ ngủ gật trong giờ Triết và mơ thấy mình đang ngồi đàm đạo với Socrates? Hay bạn đang tự hỏi liệu việc mình "bùng học" hôm nay là do ngẫu nhiên hay tất nhiên? Đừng lo lắng, chúng ta đều ở chung một thuyền!
              </p>
              <p>
                Dự án này ra đời không gì khác ngoài việc biến những phạm trù xoắn não của Triết học Mác - Lênin thành một bài trắc nghiệm tính cách siêu dí dỏm, thực tế và mang tính giải trí cực cao. Bài kiểm tra này giúp bạn phát hiện ra "triết gia nội tâm" đang điều khiển cuộc sống hằng ngày của bạn.
              </p>
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-black text-ink flex items-center gap-2">
                <Heart className="h-6 w-6 text-coral fill-coral" />
                Gặp Gỡ Đội Ngũ Sáng Tạo
              </h2>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {team.map((member) => (
                  <Card key={member.name} className={`flex flex-col justify-between border-2 transition-all duration-300 hover:scale-[1.02] ${member.bg}`}>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xl text-ink">{member.name}</span>
                        {member.icon}
                      </div>
                      <span className="mt-1 inline-block text-xs font-extrabold text-ink/60 uppercase tracking-wider">
                        {member.role}
                      </span>
                      <p className="mt-4 text-sm font-black italic text-ink/80">
                        "{member.slogan}"
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-ink/70">
                        {member.description}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="mt-10 flex gap-4">
              <ButtonLink to="/quiz/intro">
                Làm Quiz Ngay Tránh Mơ Hồ!
              </ButtonLink>
            </div>
          </div>

          {/* Right sidebar info */}
          <div className="space-y-6 lg:sticky lg:top-24">
            <Card className="border-2 border-ink">
              <Illustration illustrationKey="cartoon_philosopher" className="mx-auto h-48 w-full max-w-[200px]" />
              <h3 className="mt-4 text-center font-black text-lg text-ink">
                Lời cảnh báo biện chứng!
              </h3>
              <p className="mt-2 text-center text-xs leading-relaxed text-ink/75">
                Đây là bài trắc nghiệm phản tư mang tính vui vẻ, giúp tăng cường tình yêu triết học và khả năng tự nhận thức nhẹ nhàng. Mọi hành vi dùng kết quả này để tự phong mình làm triết gia ngoài đời thực đều bị phủ định bởi thực tiễn!
              </p>
            </Card>

            <Card className="bg-mint/30 border-dashed border-2 border-mint">
              <h4 className="font-black text-ink text-sm uppercase tracking-wide">
                Thông tin môn học
              </h4>
              <ul className="mt-3 list-disc pl-4 space-y-2 text-xs font-medium text-ink/85">
                <li><strong>Trường:</strong> Đại Học FPT TP.HCM</li>
                <li><strong>Môn học:</strong> Triết học Mác - Lênin (MLN121)</li>
                <li><strong>Mục tiêu:</strong> Học vui, thi tốt, hiểu sâu!</li>
                <li><strong>Phiên bản:</strong> v1.2.0 (Ổn định biện chứng)</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
