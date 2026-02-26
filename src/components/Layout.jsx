import { NavLink } from 'react-router-dom';
import { BookOpen, Home, Users, BookMarked, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useBiblioteca } from '../context/BibliotecaContext';

const navItems = [
  { to: '/', label: 'Painel', icon: Home },
  { to: '/livros', label: 'Livros', icon: BookOpen },
  { to: '/emprestimos', label: 'Empréstimos', icon: BookMarked },
  { to: '/membros', label: 'Membros', icon: Users },
];

export default function Layout({ children }) {
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const { stats } = useBiblioteca();

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Overlay mobile */}
      {sidebarAberta && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarAberta(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-indigo-900 text-white flex flex-col
        transform transition-transform duration-300
        ${sidebarAberta ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-indigo-700">
          <BookOpen className="w-8 h-8 text-indigo-300" />
          <div>
            <h1 className="text-lg font-bold leading-tight">Biblioteca</h1>
            <p className="text-xs text-indigo-300">Sistema de Gestão</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setSidebarAberta(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium
                ${isActive
                  ? 'bg-indigo-700 text-white'
                  : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-indigo-700 space-y-2">
          <div className="flex justify-between text-xs text-indigo-300 px-2">
            <span>Livros cadastrados</span>
            <span className="font-bold text-white">{stats.totalLivros}</span>
          </div>
          <div className="flex justify-between text-xs text-indigo-300 px-2">
            <span>Membros ativos</span>
            <span className="font-bold text-white">{stats.totalMembros}</span>
          </div>
          {stats.emprestimosAtrasados > 0 && (
            <div className="flex justify-between text-xs bg-red-600 text-white px-2 py-1 rounded">
              <span>⚠ Atrasados</span>
              <span className="font-bold">{stats.emprestimosAtrasados}</span>
            </div>
          )}
        </div>
      </aside>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header mobile */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm">
          <button
            onClick={() => setSidebarAberta(true)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-indigo-800 font-bold">
            <BookOpen className="w-5 h-5" />
            Biblioteca
          </div>
          <div className="w-9" />
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
