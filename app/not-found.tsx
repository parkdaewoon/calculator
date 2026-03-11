import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold text-neutral-900">페이지를 찾을 수 없습니다</h1>
      <p className="mt-3 text-sm text-neutral-600">
        주소가 변경되었거나 삭제되었을 수 있습니다.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-neutral-900 px-4 py-2 text-sm text-white"
      >
        홈으로 이동
      </Link>
    </main>
  );
}