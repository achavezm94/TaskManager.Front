import React, { useState, useEffect } from 'react';
import axios from 'axios';

const STATUS_LABELS = {
  0: "Pendiente",
  1: "En progreso",
  2: "Completada"
};

const STATUS_KEYS = {
  "Pending": 0,
  "InProgress": 1,
  "Completed": 2
};

const ChangeStatusModal = ({ taskId, currentStatus, token, onClose, onStatusChanged }) => {
  const [newStatus, setNewStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Convertir estado string a número
  const cleanCurrentStatus = STATUS_KEYS[currentStatus];

  // Filtrar los estados excepto el actual
  const availableStatuses = Object.entries(STATUS_LABELS)
    .filter(([key]) => parseInt(key) !== cleanCurrentStatus);

  useEffect(() => {
    if (availableStatuses.length > 0) {
      setNewStatus(availableStatuses[0][0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Ejecutar solo al montar

  const handleChange = async () => {
    if (newStatus === '') return;

    try {
      setLoading(true);
      await axios.patch(`https://localhost:7083/api/Tasks/${taskId}/status`, {
        status: parseInt(newStatus, 10)
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      onStatusChanged();
      onClose();
    } catch (e) {
      console.error(e);
      setError('Error al cambiar el estado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Cambiar estado de la tarea</h2>

        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}

        <select
          className="w-full p-2 border rounded mb-4"
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
        >
          {availableStatuses.map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleChange}
            disabled={newStatus === '' || loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Cambiando..." : "Cambiar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeStatusModal;
