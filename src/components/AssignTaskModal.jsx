import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const AssignTaskModal = ({ taskId, onClose, onAssigned }) => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Configuración de axios
  const api = axios.create({
    baseURL: 'https://localhost:7083/api',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  // Obtener lista de usuarios
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/Users');
      setUsers(response.data);
      setError('');
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

  // Asignar tarea usando PATCH exclusivo
  const handleAssign = async () => {
    try {
      await api.patch(`/Tasks/${taskId}/${selectedUserId}`);
      onAssigned(); // Notificar éxito
      onClose();
    } catch (err) {
      alert('Error al asignar tarea: ' + (err.response?.data || err.message));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Asignar tarea</h2>

        {loading ? (
          <p className="text-gray-600">Cargando usuarios...</p>
        ) : error ? (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">{error}</div>
        ) : (
          <select
            className="w-full p-2 border border-gray-300 rounded mb-4"
            value={selectedUserId || ''}
            onChange={(e) => setSelectedUserId(parseInt(e.target.value))}
          >
            <option value="">Selecciona un usuario</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedUserId || !!error}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            Asignar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignTaskModal;
