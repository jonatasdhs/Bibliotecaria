import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, BookOpen, Filter } from 'lucide-react';
import { useBiblioteca } from '../context/BibliotecaContext';
import Modal from '../components/Modal';

const CATEGORIAS = ['Literatura Brasileira', 'Ficção', 'História', 'Fantasia', 'Tecnologia', 'Ciências', 'Filosofia', 'Biografia', 'Outros'];

function FormLivro({ inicial, onSalvar, onCancelar }) {
  const [form, setForm] = useState(inicial || {
    titulo: '', autor: '', isbn: '', categoria: 'Ficção', ano: '', quantidade: 1,
  });

  const set = (campo, valor) => setForm(prev => ({ ...prev, [campo]: valor }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSalvar({ ...form, quantidade: Number(form.quantidade), ano: Number(form.ano) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
          <input
            required
            value={form.titulo}
            onChange={e => set('titulo', e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Título do livro"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Autor *</label>
          <input
            required
            value={form.autor}
            onChange={e => set('autor', e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Nome do autor"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
          <input
            value={form.isbn}
            onChange={e => set('isbn', e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="978-xx-xxx-xxxx-x"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
          <select
            value={form.categoria}
            onChange={e => set('categoria', e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
          <input
            type="number"
            value={form.ano}
            onChange={e => set('ano', e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Ano de publicação"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade *</label>
          <input
            required
            type="number"
            min="1"
            value={form.quantidade}
            onChange={e => set('quantidade', e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
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

export default function Livros() {
  const { livros, adicionarLivro, editarLivro, excluirLivro } = useBiblioteca();
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [livroEditando, setLivroEditando] = useState(null);
  const [confirmExcluir, setConfirmExcluir] = useState(null);

  const livrosFiltrados = livros.filter(l => {
    const matchBusca = !busca ||
      l.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      l.autor.toLowerCase().includes(busca.toLowerCase()) ||
      l.isbn?.includes(busca);
    const matchCategoria = !categoriaFiltro || l.categoria === categoriaFiltro;
    return matchBusca && matchCategoria;
  });

  const abrirAdicionar = () => { setLivroEditando(null); setModalAberto(true); };
  const abrirEditar = (livro) => { setLivroEditando(livro); setModalAberto(true); };
  const fecharModal = () => { setModalAberto(false); setLivroEditando(null); };

  const handleSalvar = (dados) => {
    if (livroEditando) {
      const diff = dados.quantidade - livroEditando.quantidade;
      editarLivro(livroEditando.id, { ...dados, disponivel: Math.max(0, livroEditando.disponivel + diff) });
    } else {
      adicionarLivro(dados);
    }
    fecharModal();
  };

  const handleExcluir = (id) => {
    excluirLivro(id);
    setConfirmExcluir(null);
  };

  const badgeDisponivel = (livro) => {
    if (livro.disponivel === 0) return <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">Indisponível</span>;
    if (livro.disponivel === livro.quantidade) return <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">Disponível</span>;
    return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">Parcial</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Acervo de Livros</h1>
          <p className="text-gray-500 mt-1">{livros.length} {livros.length === 1 ? 'livro cadastrado' : 'livros cadastrados'}</p>
        </div>
        <button
          onClick={abrirAdicionar}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Livro
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por título, autor ou ISBN..."
            className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={categoriaFiltro}
            onChange={e => setCategoriaFiltro(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">Todas as categorias</option>
            {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {livrosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <BookOpen className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-medium">Nenhum livro encontrado</p>
            <p className="text-sm mt-1">Tente ajustar os filtros ou adicione um novo livro</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Título</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Autor</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Categoria</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Disponível</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {livrosFiltrados.map(livro => (
                  <tr key={livro.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-800">{livro.titulo}</p>
                        <p className="text-xs text-gray-400 md:hidden">{livro.autor}</p>
                        {livro.isbn && <p className="text-xs text-gray-400">{livro.isbn}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{livro.autor}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-50 text-indigo-700">{livro.categoria}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      <span className="font-medium">{livro.disponivel}</span>
                      <span className="text-gray-400">/{livro.quantidade}</span>
                    </td>
                    <td className="px-4 py-3 text-center">{badgeDisponivel(livro)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => abrirEditar(livro)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmExcluir(livro)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Adicionar/Editar */}
      {modalAberto && (
        <Modal titulo={livroEditando ? 'Editar Livro' : 'Novo Livro'} onFechar={fecharModal}>
          <FormLivro
            inicial={livroEditando}
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
              Tem certeza que deseja excluir o livro <strong>"{confirmExcluir.titulo}"</strong>?
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
