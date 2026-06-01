/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Directory from './pages/Directory';
import Editor from './pages/Editor';
import Login from './pages/Login';
import ProjectDetail from './pages/ProjectDetail';
import Dashboard from './pages/Dashboard';
import CreateProject from './pages/CreateProject';
import AdminPanel from './pages/AdminPanel';
import TestimonyForm from './pages/TestimonyForm';
import {AuthProvider, useAuth} from './context/AuthContext'

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const { loading } = useAuth();

  // Si todavía estamos preguntando a FastAPI quién es el usuario,
  // no mostramos nada de la app todavía.
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="loader">Cargando SocialTec...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {!isLoginPage && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/directory" element={<Directory />} />
          <Route path="/editor/:projectId" element={<Editor />} />
          <Route path="/dashboard/:projectId" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/create-project" element={<CreateProject />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/project/:projectId/testimonies" element={<TestimonyForm />} />
        </Routes>
      </main>
      {!isLoginPage && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
