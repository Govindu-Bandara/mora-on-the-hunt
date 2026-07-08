import { Link } from 'react-router-dom';

export function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-mora-black px-6 text-center">
      <p className="font-slogan text-lg text-mora-gold">#MORA on the Hunt</p>
      <h1 className="text-3xl font-black uppercase tracking-tight text-mora-white">Unauthorized</h1>
      <p className="max-w-sm text-sm text-mora-white/60">
        You need to be logged in as an admin to view this page.
      </p>
      <Link
        to="/admin/login"
        className="mt-2 inline-flex items-center justify-center rounded-full bg-mora-gold px-6 py-3 font-semibold text-mora-black hover:bg-yellow-400 transition-colors"
      >
        Go to Admin Login
      </Link>
    </div>
  );
}
