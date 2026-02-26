import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const BibliotecaContext = createContext();

export function BibliotecaProvider({ children }) {
  const [livros, setLivros] = useState([]);
  const [membros, setMembros] = useState([]);
  const [emprestimos, setEmprestimos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Mapeadores snake_case → camelCase
  const mapLivro = (l) => ({
    id: l.id, titulo: l.titulo, autor: l.autor, isbn: l.isbn,
    categoria: l.categoria, ano: l.ano, quantidade: l.quantidade, disponivel: l.disponivel,
  });
  const mapMembro = (m) => ({
    id: m.id, nome: m.nome, matricula: m.matricula, telefone: m.telefone,
    cpf: m.cpf, dataRegistro: m.data_registro, ativo: m.ativo,
  });
  const mapEmprestimo = (e) => ({
    id: e.id, livroId: e.livro_id, membroId: e.membro_id,
    dataEmprestimo: e.data_emprestimo, dataDevolucaoPrevista: e.data_devolucao_prevista,
    dataDevolucaoReal: e.data_devolucao_real, status: e.status,
  });

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    const [{ data: l }, { data: m }, { data: e }] = await Promise.all([
      supabase.from('livros').select('*').order('titulo'),
      supabase.from('membros').select('*').order('nome'),
      supabase.from('emprestimos').select('*').order('data_emprestimo', { ascending: false }),
    ]);
    setLivros((l || []).map(mapLivro));
    setMembros((m || []).map(mapMembro));
    setEmprestimos((e || []).map(mapEmprestimo));
    setCarregando(false);
  }, []);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  // Livros
  const adicionarLivro = async (livro) => {
    const { data, error } = await supabase.from('livros').insert([{
      titulo: livro.titulo, autor: livro.autor, isbn: livro.isbn,
      categoria: livro.categoria, ano: livro.ano,
      quantidade: livro.quantidade, disponivel: livro.quantidade,
    }]).select().single();
    if (!error) setLivros(prev => [...prev, mapLivro(data)]);
  };

  const editarLivro = async (id, dados) => {
    const payload = {};
    if (dados.titulo !== undefined) payload.titulo = dados.titulo;
    if (dados.autor !== undefined) payload.autor = dados.autor;
    if (dados.isbn !== undefined) payload.isbn = dados.isbn;
    if (dados.categoria !== undefined) payload.categoria = dados.categoria;
    if (dados.ano !== undefined) payload.ano = dados.ano;
    if (dados.quantidade !== undefined) payload.quantidade = dados.quantidade;
    if (dados.disponivel !== undefined) payload.disponivel = dados.disponivel;
    const { data, error } = await supabase.from('livros').update(payload).eq('id', id).select().single();
    if (!error) setLivros(prev => prev.map(l => l.id === id ? mapLivro(data) : l));
  };

  const excluirLivro = async (id) => {
    const { error } = await supabase.from('livros').delete().eq('id', id);
    if (!error) setLivros(prev => prev.filter(l => l.id !== id));
  };

  // Membros
  const adicionarMembro = async (membro) => {
    const { data, error } = await supabase.from('membros').insert([{
      nome: membro.nome, matricula: membro.matricula, telefone: membro.telefone,
      cpf: membro.cpf, data_registro: new Date().toISOString().split('T')[0], ativo: true,
    }]).select().single();
    if (!error) setMembros(prev => [...prev, mapMembro(data)]);
  };

  const editarMembro = async (id, dados) => {
    const payload = {};
    if (dados.nome !== undefined) payload.nome = dados.nome;
    if (dados.matricula !== undefined) payload.matricula = dados.matricula;
    if (dados.telefone !== undefined) payload.telefone = dados.telefone;
    if (dados.cpf !== undefined) payload.cpf = dados.cpf;
    if (dados.ativo !== undefined) payload.ativo = dados.ativo;
    const { data, error } = await supabase.from('membros').update(payload).eq('id', id).select().single();
    if (!error) setMembros(prev => prev.map(m => m.id === id ? mapMembro(data) : m));
  };

  const excluirMembro = async (id) => {
    const { error } = await supabase.from('membros').delete().eq('id', id);
    if (!error) setMembros(prev => prev.filter(m => m.id !== id));
  };

  // Empréstimos
  const realizarEmprestimo = async (livroId, membroId, diasPrazo = 14) => {
    const hoje = new Date();
    const devolucao = new Date(hoje);
    devolucao.setDate(devolucao.getDate() + diasPrazo);

    const { data, error } = await supabase.from('emprestimos').insert([{
      livro_id: livroId, membro_id: membroId,
      data_emprestimo: hoje.toISOString().split('T')[0],
      data_devolucao_prevista: devolucao.toISOString().split('T')[0],
      data_devolucao_real: null, status: 'ativo',
    }]).select().single();

    if (!error) {
      setEmprestimos(prev => [mapEmprestimo(data), ...prev]);
      const livro = livros.find(l => l.id === livroId);
      if (livro) {
        await supabase.from('livros').update({ disponivel: livro.disponivel - 1 }).eq('id', livroId);
        setLivros(prev => prev.map(l => l.id === livroId ? { ...l, disponivel: l.disponivel - 1 } : l));
      }
    }
  };

  const devolverLivro = async (emprestimoId) => {
    const emprestimo = emprestimos.find(e => e.id === emprestimoId);
    if (!emprestimo) return;
    const hoje = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from('emprestimos').update({
      data_devolucao_real: hoje, status: 'devolvido',
    }).eq('id', emprestimoId);

    if (!error) {
      setEmprestimos(prev => prev.map(e =>
        e.id === emprestimoId ? { ...e, dataDevolucaoReal: hoje, status: 'devolvido' } : e
      ));
      const livro = livros.find(l => l.id === emprestimo.livroId);
      if (livro) {
        await supabase.from('livros').update({ disponivel: livro.disponivel + 1 }).eq('id', livro.id);
        setLivros(prev => prev.map(l => l.id === livro.id ? { ...l, disponivel: l.disponivel + 1 } : l));
      }
    }
  };

  const stats = {
    totalLivros: livros.length,
    totalExemplares: livros.reduce((acc, l) => acc + l.quantidade, 0),
    livrosDisponiveis: livros.filter(l => l.disponivel > 0).length,
    totalMembros: membros.filter(m => m.ativo).length,
    emprestimosAtivos: emprestimos.filter(e => e.status === 'ativo' || e.status === 'atrasado').length,
    emprestimosAtrasados: emprestimos.filter(e => e.status === 'atrasado').length,
  };

  return (
    <BibliotecaContext.Provider value={{
      livros, membros, emprestimos, stats, carregando,
      adicionarLivro, editarLivro, excluirLivro,
      adicionarMembro, editarMembro, excluirMembro,
      realizarEmprestimo, devolverLivro,
    }}>
      {children}
    </BibliotecaContext.Provider>
  );
}

export const useBiblioteca = () => useContext(BibliotecaContext);
