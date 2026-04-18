import Link from "next/link";

export default function TermsPage() {
  return (
    <>
      <header className="mb-6 space-y-1">
        <Link href="/settings" className="text-sm text-muted underline underline-offset-4">
          설정으로 돌아가기
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">이용약관</h1>
      </header>

      <article className="space-y-6 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="mb-2 font-medium text-surface-foreground">서비스 개요</h2>
          <p>MongCount는 휴식 기록과 회복 상태를 추적하는 개인용 모바일 웹 앱입니다.</p>
        </section>

        <section>
          <h2 className="mb-2 font-medium text-surface-foreground">이용 조건</h2>
          <p>가입 없이도 기본 기능을 사용할 수 있습니다. 클라우드 동기화를 원할 경우 소셜 로그인으로 계정을 만듭니다.</p>
        </section>

        <section>
          <h2 className="mb-2 font-medium text-surface-foreground">사용자 책임</h2>
          <p>본 앱은 휴식 보조 도구이며, 의학적 진단이나 치료를 대체하지 않습니다.</p>
        </section>

        <section>
          <h2 className="mb-2 font-medium text-surface-foreground">결제 및 환불</h2>
          <p>프리미엄 구독은 결제일 기준 월 단위로 청구됩니다. 구독 취소 시 다음 결제 주기부터 적용됩니다.</p>
        </section>

        <section>
          <h2 className="mb-2 font-medium text-surface-foreground">연락처</h2>
          <p>약관 관련 문의: feedback@mongcount.app</p>
        </section>

        <p className="text-xs text-muted">최종 업데이트: 2026년 4월</p>
      </article>
    </>
  );
}
