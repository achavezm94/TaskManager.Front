import React, { useState, useEffect } from 'react';
import axios from 'axios';

const STATUS_LABELS = {
  0: "Pendiente",
  1: "En progreso",
  2: "Completada"
};

const STATUS_MAP = {
  "Pending": 0,
  "InProgress": 1,
  "Completed": 2
};

const EditTaskModal = ({ task, token, onClose, onTaskUpdated }) => {
  const [title, setTitle] = useState(task.title || '');
  const [description, setDescription] = useState(task.description || '');
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.split('T')[0] : '');
  const [status, setStatus] = useState(typeof task.status === 'string' && STATUS_MAP[task.status] !== undefined ? STATUS_MAP[task.status].toString() : '0');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const response = await axios.get('https://localhost:7083/api/Users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data);
        if (task.assignedUserId) {
          setAssignedUserId(task.assignedUserId.toString());
        } else if (response.data.length > 0) {
          setAssignedUserId(response.data[0].id.toString());
        }
      } catch (e) {
        console.error(e);
        setError('Error al cargar usuarios');
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!title.trim() || !dueDate || !assignedUserId) {
      setError('Por favor completa todos los campos.');
      return;
    }

    try {
      setLoadingSave(true);
      setError('');
      await axios.put(`https://localhost:7083/api/Tasks/${task.id}`, {
        title,
        description,
        dueDate,
        status: parseInt(status, 10),
        assignedUserId: parseInt(assignedUserId, 10),
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      onTaskUpdated();
      onClose();
    } catch (e) {
      setError('Error al actualizar la tarea: ' + (e.response?.data || e.message));
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">Editar Tarea</h2>

        {error && <div className="text-red-600 mb-3">{error}</div>}

        <label className="block mb-4">
          Título
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </label>

        <label className="block mb-4">
          Descripción
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
        </label>

        <label className="block mb-4">
          Fecha límite
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </label>
        <label className="block mb-4">
          Estado
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
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
              onChange={e => setAssignedUserId(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            >
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          )}
        </label>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            disabled={loadingSave}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loadingSave || loadingUsers}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {loadingSave ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;
