import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Appointments from './pages/Appointments';
import Services from './pages/Services';
import Professionals from './pages/Professionals';
import Resources from './pages/Resources';
import Sales from './pages/Sales';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/services" element={<Services />} />
            <Route path="/professionals" element={<Professionals />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/sales" element={<Sales />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}