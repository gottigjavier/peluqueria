import { Outlet, NavLink } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Sun, Moon, Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';

const allNavItems = [
  { path: '/', label: 'Dashboard', icon: '📊', roles: ['admin', 'user'] },
  { path: '/clients', label: 'Clientes', icon: '👥', roles: ['admin'] },
  { path: '/appointments', label: 'Turnos', icon: '📅', roles: ['admin', 'user'] },
  { path: '/services', label: 'Servicios', icon: '✂️', roles: ['admin'] },
  { path: '/professionals', label: 'Profesionales', icon: '👩‍💼', roles: ['admin'] },
  { path: '/resources', label: 'Recursos', icon: '🪑', roles: ['admin'] },
  { path: '/sales', label: 'Ventas', icon: '💰', roles: ['admin'] },
];

export default function Layout() {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = allNavItems.filter(
    item => user && item.roles.includes(user.role)
  );

  return (
    <div className="min-h-screen flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--color-surface)] border-r border-[var(--color-border)] transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-[var(--color-border)]">
          <h1 className="text-2xl font-bold text-[var(--color-accent)]">Salon</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Gestión Integral</p>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-[var(--color-accent)] text-white' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--color-border)]">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-[var(--color-text-secondary)] hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between">
          <button className="lg:hidden p-2" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm text-[var(--color-text-secondary)] hidden sm:block">
              {user?.username}
            </span>
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-[var(--color-border)] transition-colors">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
