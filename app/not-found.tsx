import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-bold text-sky-400 mb-2">404 — Page Not Found</h2>
      <p className="text-slate-400 text-sm mb-6">The requested architectural view does not exist.</p>
      <Link href="/" className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl shadow-lg">
        Return to ArchAI Studio Workspace
      </Link>
    </div>
  );
}
