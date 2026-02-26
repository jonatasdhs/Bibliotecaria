import { BookOpen, Users, BookMarked, AlertTriangle, TrendingUp, Clock, Loader2 } from 'lucide-react';
import { useBiblioteca } from '../context/BibliotecaContext';
import { Link } from 'react-router-dom';

function CardStat({ titulo, valor, icone: Icone, cor, subtitulo, link }) {
  const cores = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  const content = (
    <div className={`w-100 bg-white rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow ${link ? 'cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{titulo}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{valor}</p>
          {subtitulo && <p className="text-xs text-gray-400 mt-1">{subtitulo}</p>}
        </div>
        <div className={`p-3 rounded-lg border ${cores[cor]}`}>
          <Icone className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

  return link ? <Link to={link}>{content}</Link> : content;
}

export default function Dashboard() {
  const { stats, livros, emprestimos, membros, carregando } = useBiblioteca();

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin mr-3" />
        <span>Carregando dados...</span>
      </div>
    );
  }

  const hoje = new Date().toISOString().split('T')[0];
  const emprestimosAtivos = emprestimos
    .filter(e => e.status === 'ativo' || e.status === 'atrasado')
    .slice(0, 5);

  const livrosPopulares = [...livros]
    .sort((a, b) => (a.quantidade - a.disponivel) - (b.quantidade - b.disponivel))
    .reverse()
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Painel de Controle</h1>
        <p className="text-gray-500 mt-1">Bem-vindo ao sistema de gestão da biblioteca</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <CardStat
          titulo="Total de Livros"
          valor={stats.totalLivros}
          icone={BookOpen}
          cor="indigo"
          subtitulo={`${stats.totalExemplares} exemplares no acervo`}
          link="/livros"
        />
        <CardStat
          titulo="Livros Disponíveis"
          valor={stats.livrosDisponiveis}
          icone={TrendingUp}
          cor="green"
          subtitulo="Títulos com exemplares livres"
          link="/livros"
        />
        <CardStat
          titulo="Membros Ativos"
          valor={stats.totalMembros}
          icone={Users}
          cor="blue"
          subtitulo="Membros cadastrados"
          link="/membros"
        />
        <CardStat
          titulo="Empréstimos Ativos"
          valor={stats.emprestimosAtivos}
          icone={BookMarked}
          cor="purple"
          subtitulo="Livros emprestados"
          link="/emprestimos"
        />
        <CardStat
          titulo="Atrasados"
          valor={stats.emprestimosAtrasados}
          icone={AlertTriangle}
          cor={stats.emprestimosAtrasados > 0 ? 'red' : 'green'}
          subtitulo="Devoluções em atraso"
          link="/emprestimos"
        />
        <CardStat
          titulo="Devolvidos (Total)"
          valor={emprestimos.filter(e => e.status === 'devolvido').length}
          icone={Clock}
          cor="yellow"
          subtitulo="Histórico de devoluções"
          link="/emprestimos"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Empréstimos ativos */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">Empréstimos Ativos</h2>
            <Link to="/emprestimos" className="text-xs text-indigo-600 hover:underline">Ver todos</Link>
          </div>
          {emprestimosAtivos.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Nenhum empréstimo ativo</p>
          ) : (
            <div className="space-y-3">
              {emprestimosAtivos.map(emp => {
                const livro = livros.find(l => l.id === emp.livroId);
                const membro = membros.find(m => m.id === emp.membroId);
                const atrasado = emp.dataDevolucaoPrevista < hoje && emp.status !== 'devolvido';
                return (
                  <div key={emp.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${atrasado ? 'bg-red-500' : 'bg-green-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{livro?.titulo}</p>
                      <p className="text-xs text-gray-500">{membro?.nome}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-xs font-medium ${atrasado ? 'text-red-600' : 'text-gray-500'}`}>
                        {atrasado ? '⚠ Atrasado' : 'Em dia'}
                      </p>
                      <p className="text-xs text-gray-400">{emp.dataDevolucaoPrevista}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Livros mais emprestados */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">Livros Mais Solicitados</h2>
            <Link to="/livros" className="text-xs text-indigo-600 hover:underline">Ver acervo</Link>
          </div>
          <div className="space-y-3">
            {livrosPopulares.map((livro, idx) => {
              const emprestados = livro.quantidade - livro.disponivel;
              const pct = livro.quantidade > 0 ? Math.round((emprestados / livro.quantidade) * 100) : 0;
              return (
                <div key={livro.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700 truncate max-w-[200px]">{livro.titulo}</span>
                    <span className="text-gray-400 text-xs ml-2 flex-shrink-0">{emprestados}/{livro.quantidade}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${pct === 100 ? 'bg-red-500' : pct > 50 ? 'bg-yellow-500' : 'bg-indigo-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
