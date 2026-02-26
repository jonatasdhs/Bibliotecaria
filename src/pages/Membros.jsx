import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, Users, UserCheck, UserX } from 'lucide-react';
import { useBiblioteca } from '../context/BibliotecaContext';
import Modal from '../components/Modal';

function FormMembro({ inicial, onSalvar, onCancelar }) {
  const [form, setForm] = useState(inicial || {
    nome: '', matricula: '', telefone: '', cpf: '', ativo: true,
  });

  const set = (campo, valor) => setForm(prev => ({ ...prev, [campo]: valor }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSalvar(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
          <input
            required
            value={form.nome}
            onChange={e => set('nome', e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Nome do membro"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula</label>
          <input
            value={form.matricula}
            onChange={e => set('matricula', e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Número de matrícula"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
          <input
            value={form.telefone}
            onChange={e => set('telefone', e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="(00) 00000-0000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
          <input
            value={form.cpf}
            onChange={e => set('cpf', e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="000.000.000-00"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="ativo"
            checked={form.ativo}
            onChange={e => set('ativo', e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded"
          />
          <label htmlFor="ativo" className="text-sm text-gray-700">Membro ativo</label>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancelar} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Salvar
        </button>
      </div>
    </form>
  );
}

export default function Membros() {
  const { membros, emprestimos, adicionarMembro, editarMembro, excluirMembro } = useBiblioteca();
  const [busca, setBusca] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [membroEditando, setMembroEditando] = useState(null);
  const [confirmExcluir, setConfirmExcluir] = useState(null);

  const membrosFiltrados = membros.filter(m => {
    const matchBusca = !busca ||
      m.nome.toLowerCase().includes(busca.toLowerCase()) ||
      m.matricula?.toLowerCase().includes(busca.toLowerCase()) ||
      m.cpf?.includes(busca);
    const matchAtivo = filtroAtivo === '' ? true : filtroAtivo === 'ativo' ? m.ativo : !m.ativo;
    return matchBusca && matchAtivo;
  });

  const abrirAdicionar = () => { setMembroEditando(null); setModalAberto(true); };
  const abrirEditar = (membro) => { setMembroEditando(membro); setModalAberto(true); };
  const fecharModal = () => { setModalAberto(false); setMembroEditando(null); };

  const handleSalvar = (dados) => {
    if (membroEditando) {
      editarMembro(membroEditando.id, dados);
    } else {
      adicionarMembro(dados);
    }
    fecharModal();
  };

  const handleExcluir = (id) => {
    excluirMembro(id);
    setConfirmExcluir(null);
  };

  const emprestimosAtivos = (membroId) =>
    emprestimos.filter(e => e.membroId === membroId && e.status !== 'devolvido').length;

  const totalEmprestimos = (membroId) =>
    emprestimos.filter(e => e.membroId === membroId).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Membros</h1>
          <p className="text-gray-500 mt-1">
            {membros.filter(m => m.ativo).length} membros ativos de {membros.length} cadastrados
          </p>
        </div>
        <button
          onClick={abrirAdicionar}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Membro
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome, matrícula ou CPF..."
            className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={filtroAtivo}
          onChange={e => setFiltroAtivo(e.target.value)}
          className="px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">Todos os membros</option>
          <option value="ativo">Ativos</option>
          <option value="inativo">Inativos</option>
        </select>
      </div>

      {/* Grid de membros */}
      {membrosFiltrados.length === 0 ? (
        <div className="bg-white rounded-xl border shadow-sm flex flex-col items-center justify-center py-16 text-gray-400">
          <Users className="w-12 h-12 mb-3 opacity-30" />
          <p className="font-medium">Nenhum membro encontrado</p>
          <p className="text-sm mt-1">Ajuste os filtros ou cadastre um novo membro</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {membrosFiltrados.map(membro => {
            const ativos = emprestimosAtivos(membro.id);
            const total = totalEmprestimos(membro.id);
            return (
              <div key={membro.id} className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0
                      ${membro.ativo ? 'bg-indigo-600' : 'bg-gray-400'}`}>
                      {membro.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 leading-tight">{membro.nome}</p>
                      <span className={`inline-flex items-center gap-1 text-xs mt-0.5 ${membro.ativo ? 'text-green-600' : 'text-gray-400'}`}>
                        {membro.ativo ? <><UserCheck className="w-3 h-3" />Ativo</> : <><UserX className="w-3 h-3" />Inativo</>}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => abrirEditar(membro)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setConfirmExcluir(membro)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-sm text-gray-500">
                  {membro.matricula && <p className="truncate">🎓 {membro.matricula}</p>}
                  {membro.telefone && <p>📞 {membro.telefone}</p>}
                  {membro.cpf && <p>🪪 {membro.cpf}</p>}
                </div>

                <div className="mt-3 pt-3 border-t flex gap-4 text-xs text-gray-500">
                  <div>
                    <span className="font-semibold text-gray-700">{ativos}</span> empréstimo{ativos !== 1 ? 's' : ''} ativo{ativos !== 1 ? 's' : ''}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">{total}</span> no total
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Cadastrado em {new Date(membro.dataRegistro + 'T00:00:00').toLocaleDateString('pt-BR')}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Adicionar/Editar */}
      {modalAberto && (
        <Modal titulo={membroEditando ? 'Editar Membro' : 'Novo Membro'} onFechar={fecharModal}>
          <FormMembro
            inicial={membroEditando}
            onSalvar={handleSalvar}
            onCancelar={fecharModal}
          />
        </Modal>
      )}

      {/* Modal Confirmar Exclusão */}
      {confirmExcluir && (
        <Modal titulo="Confirmar Exclusão" onFechar={() => setConfirmExcluir(null)} tamanho="sm">
          <div className="space-y-4">
            <p className="text-gray-600">
              Tem certeza que deseja excluir o membro <strong>"{confirmExcluir.nome}"</strong>?
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmExcluir(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={() => handleExcluir(confirmExcluir.id)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
                Excluir
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
