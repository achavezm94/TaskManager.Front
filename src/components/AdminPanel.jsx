import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import UserForm from './UserForm';
import axios from 'axios';

const AdminPanel = () => {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Configurar axios con token
  const api = axios.create({
    baseURL: 'https://localhost:7083/api',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  // Obtener usuarios
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/Users');
      setUsers(response.data);
    } catch (err) {
      setError('Error al cargar usuarios: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si el usuario no es admin, mostrar mensaje
  if (user?.role !== 'Admin') {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-10">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg inline-block">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-xl font-medium mb-2">Acceso no autorizado</h3>
            <p>No tienes permisos para acceder a esta sección</p>
          </div>
        </div>
      </div>
    );
  }

  // Crear usuario
  const createUser = async (userData) => {
    try {
      await api.post('/Users', userData);
      fetchUsers();
      closeForm(); // Cerrar el formulario
      return true;
    } catch (err) {
      setError('Error al crear usuario: ' + (err.response?.data || err.message));
      return false;
    }
  };

  // Actualizar usuario
  const updateUser = async (id, userData) => {
    try {
      await api.put(`/Users/${id}`, userData);
      fetchUsers();
      closeForm(); // Cerrar el formulario
      return true;
    } catch (err) {
      setError('Error al actualizar usuario: ' + (err.response?.data || err.message));
      return false;
    }
  };

  // Eliminar usuario
  const deleteUser = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await api.delete(`/Users/${id}`);
        fetchUsers();
      } catch (err) {
        setError('Error al eliminar usuario: ' + (err.response?.data || err.message));
      }
    }
  };

  // Función para manejar edición
  const handleEdit = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  // Función para cerrar el formulario y resetear estados
  const closeForm = () => {
    setEditingUser(null);
    setShowForm(false);
  };

  // const roleNames = {
  //   0: 'Admin',
  //   1: 'Supervisor',
  //   2: 'Usuario'
  // };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        
        {/* Mostrar botón "Nuevo Usuario" solo cuando no estemos en el formulario */}
        {!showForm && (
          <button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center"
            onClick={() => {
              setEditingUser(null);
              setShowForm(true);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nuevo Usuario
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {showForm ? (
        <UserForm 
          user={editingUser} 
          onSubmit={editingUser ? 
            (data) => updateUser(editingUser.id, data) : 
            createUser
          } 
          onCancel={() => {
            setEditingUser(null);
            setShowForm(false);
          }} 
        />
      ) : (
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-4 text-gray-500">No hay usuarios registrados</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'Admin' 
                          ? 'bg-indigo-100 text-indigo-800' 
                          : user.role === 'Supervisor' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          onClick={() => handleEdit(user)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Editar
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900 flex items-center"
                          onClick={() => deleteUser(user.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;