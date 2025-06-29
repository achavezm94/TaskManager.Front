// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AdminPanel from '../components/AdminPanel';
import TasksPanel from '../components/TasksPanel'; // Nuevo componente para tareas
import axios from 'axios';

const DashboardPage = () => {
  const { logout, user, token } = useAuth();
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState('dashboard');
  const [userCount, setUserCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Verificar si el usuario es administrador
  const isAdmin = user?.role === 'Admin';

  // Configurar axios con token
  const api = axios.create({
    baseURL: 'https://localhost:7083/api',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  // Obtener estadísticas
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      setErrorStats('');
      
      // Obtener conteo de usuarios (solo si es admin)
      if (isAdmin) {
        const usersResponse = await api.get('/Users/count');
        setUserCount(usersResponse.data);
      }
      
      // Obtener conteo de tareas
      const tasksResponse = await api.get('/Tasks/count');
      setTaskCount(tasksResponse.data);
      
    } catch (err) {
      setErrorStats('Error al cargar estadísticas: ' + (err.response?.data || err.message));
      console.error('Error fetching stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStats();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Manejar clic en tarjeta de usuarios
  const handleUsersClick = () => {
    if (isAdmin) {
      setActiveModule('users');
    }
  };

  // Manejar clic en tarjeta de tareas
  const handleTasksClick = () => {
    setActiveModule('tasks');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-indigo-700 to-indigo-900 text-white">
        <div className="p-5 border-b border-indigo-600">
          <h2 className="text-xl font-bold">TaskManager</h2>
        </div>
        
        <div className="p-5 flex items-center border-b border-indigo-600">
          <div className="bg-indigo-500 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="ml-3">
            <div className="font-medium">{user?.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : 'Usuario'}</div>
            <div className="text-xs text-indigo-200">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Rol no definido'}</div>
          </div>
        </div>
        
        <nav className="p-2">
          <button 
            className={`w-full text-left px-4 py-3 rounded-lg mb-1 flex items-center ${
              activeModule === 'dashboard' 
                ? 'bg-indigo-600 text-white' 
                : 'text-indigo-200 hover:bg-indigo-700'
            }`}
            onClick={() => setActiveModule('dashboard')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </button>
          
          {isAdmin && (
            <button 
              className={`w-full text-left px-4 py-3 rounded-lg mb-1 flex items-center ${
                activeModule === 'users' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-indigo-200 hover:bg-indigo-700'
              }`}
              onClick={() => setActiveModule('users')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Administrar Usuarios
            </button>
          )}
          
          <button 
            className={`w-full text-left px-4 py-3 rounded-lg mb-1 flex items-center ${
              activeModule === 'tasks' 
                ? 'bg-indigo-600 text-white' 
                : 'text-indigo-200 hover:bg-indigo-700'
            }`}
            onClick={() => setActiveModule('tasks')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Administrar Tareas
          </button>
          
          <button 
            className="w-full text-left px-4 py-3 rounded-lg mb-1 flex items-center text-indigo-200 hover:bg-indigo-700"
            onClick={handleLogout}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
          </button>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200">
          <div className="flex justify-between items-center py-4 px-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {activeModule === 'dashboard' ? 'Dashboard' : 
               activeModule === 'users' ? 'Administración de Usuarios' :
               activeModule === 'tasks' ? 'Administración de Tareas' : 'Dashboard'}
            </h1>
            <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium">
              Bienvenido, <strong>{user?.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : 'Usuario'}</strong>
            </div>
          </div>
        </header>
        
        <main className="p-6">
          {activeModule === 'dashboard' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Resumen del Sistema</h2>
              
              {errorStats && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errorStats}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isAdmin && (
                  <div 
                    className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 transition-all ${
                      loadingStats ? 'opacity-75' : 'hover:shadow-md hover:-translate-y-1 cursor-pointer'
                    }`}
                    onClick={!loadingStats ? handleUsersClick : undefined}
                  >
                    <div className="text-blue-500 mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium mb-1">Usuarios Registrados</h3>
                    {loadingStats ? (
                      <div className="animate-pulse h-8 w-1/2 bg-gray-200 rounded"></div>
                    ) : (
                      <p className="text-3xl font-bold text-gray-800">{userCount}</p>
                    )}
                  </div>
                )}
                
                <div 
                  className={`bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl p-5 transition-all ${
                    loadingStats ? 'opacity-75' : 'hover:shadow-md hover:-translate-y-1 cursor-pointer'
                  }`}
                  onClick={!loadingStats ? handleTasksClick : undefined}
                >
                  <div className="text-green-500 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium mb-1">Tareas Totales</h3>
                  {loadingStats ? (
                    <div className="animate-pulse h-8 w-1/2 bg-gray-200 rounded"></div>
                  ) : (
                    <p className="text-3xl font-bold text-gray-800">{taskCount}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {activeModule === 'users' && isAdmin && (
            <AdminPanel />
          )}
          
          {activeModule === 'tasks' && (
            <TasksPanel />
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;