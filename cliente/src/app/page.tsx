import Link from 'next/link';

export default function HomePage(): React.ReactNode {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-slate-900">🦫 BebrasBolivia</h1>
        <p className="text-lg text-slate-500 mb-8">Plataforma colaborativa — En construcción</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/roles"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            <span>⬡</span>
            Gestión de Roles
          </Link>
        </div>
      </div>
    </main>
  );
}
