import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BibliotecaProvider } from './context/BibliotecaContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Livros from './pages/Livros';
import Emprestimos from './pages/Emprestimos';
import Membros from './pages/Membros';

function App() {
  return (
    <BrowserRouter>
      <BibliotecaProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/livros" element={<Livros />} />
            <Route path="/emprestimos" element={<Emprestimos />} />
            <Route path="/membros" element={<Membros />} />
          </Routes>
        </Layout>
      </BibliotecaProvider>
    </BrowserRouter>
  );
}

export default App;
