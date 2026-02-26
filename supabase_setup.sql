-- Execute este script no Supabase: Dashboard > SQL Editor > New Query

-- Tabela de Livros
create table if not exists livros (
  id bigint primary key generated always as identity,
  titulo text not null,
  autor text not null,
  isbn text,
  categoria text default 'Outros',
  ano integer,
  quantidade integer not null default 1,
  disponivel integer not null default 1,
  created_at timestamptz default now()
);

-- Tabela de Membros
create table if not exists membros (
  id bigint primary key generated always as identity,
  nome text not null,
  email text not null,
  telefone text,
  cpf text,
  data_registro date default current_date,
  ativo boolean default true,
  created_at timestamptz default now()
);

-- Tabela de Empréstimos
create table if not exists emprestimos (
  id bigint primary key generated always as identity,
  livro_id bigint references livros(id) on delete cascade,
  membro_id bigint references membros(id) on delete cascade,
  data_emprestimo date not null default current_date,
  data_devolucao_prevista date not null,
  data_devolucao_real date,
  status text not null default 'ativo' check (status in ('ativo', 'atrasado', 'devolvido')),
  created_at timestamptz default now()
);

-- Habilitar acesso público (Row Level Security desativado para uso simples)
alter table livros enable row level security;
alter table membros enable row level security;
alter table emprestimos enable row level security;

create policy "Acesso público a livros" on livros for all using (true) with check (true);
create policy "Acesso público a membros" on membros for all using (true) with check (true);
create policy "Acesso público a emprestimos" on emprestimos for all using (true) with check (true);

-- Dados de exemplo (opcional)
insert into livros (titulo, autor, isbn, categoria, ano, quantidade, disponivel) values
  ('Dom Casmurro', 'Machado de Assis', '978-85-325-0196-3', 'Literatura Brasileira', 1899, 3, 3),
  ('O Alquimista', 'Paulo Coelho', '978-85-325-0082-9', 'Ficção', 1988, 2, 2),
  ('Sapiens', 'Yuval Noah Harari', '978-85-8057-566-3', 'História', 2011, 4, 4),
  ('O Senhor dos Anéis', 'J.R.R. Tolkien', '978-85-325-2248-7', 'Fantasia', 1954, 2, 2),
  ('Clean Code', 'Robert C. Martin', '978-0-13-235088-4', 'Tecnologia', 2008, 3, 3),
  ('A Revolução dos Bichos', 'George Orwell', '978-85-7547-243-3', 'Ficção', 1945, 2, 2);

insert into membros (nome, email, telefone, cpf, data_registro, ativo) values
  ('Ana Silva', 'ana.silva@email.com', '(11) 99999-1111', '123.456.789-00', '2024-01-15', true),
  ('Carlos Souza', 'carlos.souza@email.com', '(11) 99999-2222', '987.654.321-00', '2024-02-20', true),
  ('Maria Oliveira', 'maria.oliveira@email.com', '(11) 99999-3333', '456.789.123-00', '2024-03-10', true),
  ('João Lima', 'joao.lima@email.com', '(11) 99999-4444', '321.654.987-00', '2024-04-05', false);
