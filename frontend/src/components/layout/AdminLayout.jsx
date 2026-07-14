import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/orders', label: 'Orders', end: true },
  { to: '/admin/orders/new', label: 'Add Order' },
  { to: '/admin/products', label: 'Products' },
];

export function AdminLayout() {
  const { admin, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-mora-black text-mora-white">
      <aside className="flex w-56 shrink-0 flex-col border-r border-white/10 p-5">
        <p className="font-slogan mb-8 text-sm text-mora-gold">#MORA Admin</p>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive ? 'bg-mora-gold/15 text-mora-gold' : 'text-mora-white/70 hover:bg-white/5'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {admin?.role === 'superadmin' && (
            <NavLink
              to="/admin/manage-admins"
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive ? 'bg-mora-gold/15 text-mora-gold' : 'text-mora-white/70 hover:bg-white/5'
                }`
              }
            >
              Manage Admins
            </NavLink>
          )}
        </nav>
        <div className="border-t border-white/10 pt-4 text-xs text-mora-white/50">
          <p className="mb-2 truncate">{admin?.email}</p>
          <button onClick={logout} className="text-red-400 hover:text-red-300">
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden p-6 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
}
