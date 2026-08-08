import { Button } from "@alvert/ui";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="text-center">
        <h1 className="mb-6 text-4xl font-bold text-zinc-900">
          Alvert
        </h1>

        <p className="mb-8 text-zinc-600">
          Tekliflerini daha kolay yönet.
        </p>

        <div className="flex justify-center gap-3">
          <Button>Başla</Button>
          <Button variant="secondary">Giriş Yap</Button>
        </div>
      </div>
    </main>
  );
}