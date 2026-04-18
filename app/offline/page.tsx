import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 pb-24 pt-6">
      <section className="rounded-2xl border bg-surface p-6 shadow-sm">
        <p className="text-sm font-medium text-muted">오프라인 모드</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">지금은 연결이 잠시 끊겼어요</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          네트워크가 다시 연결되면 홈으로 돌아가 최근 기록을 이어서 확인할 수 있어요.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            홈으로 다시 시도하기
          </Link>
          <p className="text-xs text-muted">열려 있던 화면 대신 이 안내 화면을 오프라인 fallback으로 보여줍니다.</p>
        </div>
      </section>
    </main>
  );
}
