import React, { useState, useEffect } from 'react';
import axios from 'axios';

const STATUS_LABELS = {
  0: 'Pendiente',
  1: 'En progreso',
  2: 'Completada'
};

const CreateTaskModal = ({ token, onClose, onTaskCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('0');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const res = await axios.get('https://localhost:7083/api/Users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data);
        if (res.data.length > 0) {
          setAssignedUserId(res.data[0].id.toString()); // Preselecciona el primero
        }
      } catch (err) {
        console.log(err);
        setError('Error al cargar usuarios.');
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [token]);

  const handleCreate = async () => {
    if (!title.trim() || !dueDate || !assignedUserId) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    try {
      setLoadingCreate(true);
      setError('');
      await axios.post('https://localhost:7083/api/Tasks', {
        title,
        description,
        dueDate,
        status: parseInt(status),
        assignedUserId: parseInt(assignedUserId)
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      onTaskCreated();
      onClose();
    } catch (err) {
      console.error(err);
      setError('Error al crear la tarea.');
    } finally {
      setLoadingCreate(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">Nueva Tarea</h2>

        {error && <div className="text-red-600 mb-3">{error}</div>}

        <label className="block mb-4">
          Título
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </label>

        <label className="block mb-4">
          Descripción
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
        </label>

        <label className="block mb-4">
          Fecha límite
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </label>

        <label className="block mb-4">
          Estado
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </label>

        <label className="block mb-4">
          Asignar a usuario
          {loadingUsers ? (
            <div className="text-gray-500">Cargando usuarios...</div>
          ) : (
            <select
              value={assignedUserId}
              onChange={(e) => setAssignedUserId(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          )}
        </label>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={loadingCreate || loadingUsers}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {loadingCreate ? 'Creando...' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;
