import { useState } from 'react';
import { Plus, Search, RotateCcw, BookMarked, AlertTriangle, Filter } from 'lucide-react';
import { useBiblioteca } from '../context/BibliotecaContext';
import Modal from '../components/Modal';

function FormEmprestimo({ onSalvar, onCancelar }) {
  const { livros, membros } = useBiblioteca();
  const [livroId, setLivroId] = useState('');
  const [membroId, setMembroId] = useState('');
  const [prazo, setPrazo] = useState(14);

  const livrosDisponiveis = livros.filter(l => l.disponivel > 0);
  const membrosAtivos = membros.filter(m => m.ativo);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSalvar(Number(livroId), Number(membroId), Number(prazo));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Livro *</label>
        <select
          required
          value={livroId}
          onChange={e => setLivroId(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Selecione um livro...</option>
          {livrosDisponiveis.map(l => (
            <option key={l.id} value={l.id}>
              {l.titulo} — {l.autor} ({l.disponivel} disponível)
            </option>
          ))}
        </select>
        {livrosDisponiveis.length === 0 && (
          <p className="text-xs text-red-500 mt-1">Nenhum livro disponível para empréstimo.</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Membro *</label>
        <select
          required
          value={membroId}
          onChange={e => setMembroId(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Selecione um membro...</option>
          {membrosAtivos.map(m => (
            <option key={m.id} value={m.id}>{m.nome} — {m.email}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Prazo de devolução (dias)</label>
        <input
          type="number"
          min="1"
          max="90"
          value={prazo}
          onChange={e => setPrazo(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancelar} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={livrosDisponiveis.length === 0}
          className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Confirmar Empréstimo
        </button>
      </div>
    </form>
  );
}

export default function Emprestimos() {
  const { emprestimos, livros, membros, realizarEmprestimo, devolverLivro } = useBiblioteca();
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [confirmDevolver, setConfirmDevolver] = useState(null);

  const hoje = new Date().toISOString().split('T')[0];

  const emprestimosFiltrados = emprestimos
    .filter(e => {
      const livro = livros.find(l => l.id === e.livroId);
      const membro = membros.find(m => m.id === e.membroId);
      const matchBusca = !busca ||
        livro?.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        membro?.nome.toLowerCase().includes(busca.toLowerCase());
      const matchStatus = !filtroStatus || e.status === filtroStatus;
      return matchBusca && matchStatus;
    })
    .sort((a, b) => new Date(b.dataEmprestimo) - new Date(a.dataEmprestimo));

  const handleEmprestimo = (livroId, membroId, prazo) => {
    realizarEmprestimo(livroId, membroId, prazo);
    setModalAberto(false);
  };

  const handleDevolver = (emprestimoId) => {
    devolverLivro(emprestimoId);
    setConfirmDevolver(null);
  };

  const badgeStatus = (emp) => {
    if (emp.status === 'devolvido') return <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">Devolvido</span>;
    const atrasado = emp.dataDevolucaoPrevista < hoje;
    if (atrasado) return <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Atrasado</span>;
    return <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">Ativo</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Empréstimos</h1>
          <p className="text-gray-500 mt-1">
            {emprestimos.filter(e => e.status !== 'devolvido').length} empréstimos ativos
          </p>
        </div>
        <button
          onClick={() => setModalAberto(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Empréstimo
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por livro ou membro..."
            className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={filtroStatus}
            onChange={e => setFiltroStatus(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="atrasado">Atrasado</option>
            <option value="devolvido">Devolvido</option>
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {emprestimosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <BookMarked className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-medium">Nenhum empréstimo encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Livro</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Membro</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Empréstimo</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Devolução Prev.</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {emprestimosFiltrados.map(emp => {
                  const livro = livros.find(l => l.id === emp.livroId);
                  const membro = membros.find(m => m.id === emp.membroId);
                  const atrasado = emp.dataDevolucaoPrevista < hoje && emp.status !== 'devolvido';
                  return (
                    <tr key={emp.id} className={`hover:bg-gray-50 transition-colors ${atrasado ? 'bg-red-50' : ''}`}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{livro?.titulo || '—'}</p>
                        <p className="text-xs text-gray-400 sm:hidden">{membro?.nome}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{membro?.nome || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{emp.dataEmprestimo}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={atrasado ? 'text-red-600 font-medium' : 'text-gray-500'}>
                          {emp.dataDevolucaoPrevista}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">{badgeStatus(emp)}</td>
                      <td className="px-4 py-3 text-right">
                        {emp.status !== 'devolvido' && (
                          <button
                            onClick={() => setConfirmDevolver(emp)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ml-auto"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Devolver
                          </button>
                        )}
                        {emp.status === 'devolvido' && (
                          <span className="text-xs text-gray-400">{emp.dataDevolucaoReal}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Novo Empréstimo */}
      {modalAberto && (
        <Modal titulo="Novo Empréstimo" onFechar={() => setModalAberto(false)}>
          <FormEmprestimo onSalvar={handleEmprestimo} onCancelar={() => setModalAberto(false)} />
        </Modal>
      )}

      {/* Modal Confirmar Devolução */}
      {confirmDevolver && (
        <Modal titulo="Confirmar Devolução" onFechar={() => setConfirmDevolver(null)} tamanho="sm">
          <div className="space-y-4">
            <p className="text-gray-600">
              Confirmar devolução do livro <strong>"{livros.find(l => l.id === confirmDevolver.livroId)?.titulo}"</strong> por{' '}
              <strong>{membros.find(m => m.id === confirmDevolver.membroId)?.nome}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDevolver(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={() => handleDevolver(confirmDevolver.id)} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                Confirmar Devolução
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
