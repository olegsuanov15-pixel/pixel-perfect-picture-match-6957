import { Link, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
export function DataError({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  const queryReset = useQueryErrorResetBoundary();
  return (
    <main className="page-main prose-page">
      <h1>Не удалось загрузить данные</h1>
      <p role="alert">{error instanceof Error ? error.message : "База временно недоступна"}</p>
      <Button
        onClick={() => {
          queryReset.reset();
          router.invalidate();
          reset();
        }}
      >
        Попробовать снова
      </Button>
    </main>
  );
}
export function DataNotFound() {
  return (
    <main className="page-main prose-page">
      <h1>Фамилия не найдена</h1>
      <p>Этой фамилии пока нет в каталоге.</p>
      <Link to="/search" className="text-link">
        Вернуться к поиску
      </Link>
    </main>
  );
}
