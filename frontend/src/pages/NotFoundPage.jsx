import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-slogan text-4xl text-mora-gold">404</h1>
      <p className="text-mora-white/70">This page doesn&apos;t exist.</p>
      <Link
        to="/"
        className="inline-flex items-center justify-center rounded-full bg-mora-gold px-6 py-3 font-semibold text-mora-black hover:bg-yellow-400 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
