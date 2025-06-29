// src/components/TasksPanel.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import AssignTaskModal from './AssignTaskModal';
import ChangeStatusModal from './ChangeStatusModal';
import EditTaskModal from './EditTaskModal';
import CreateTaskModal from './CreateTaskModal';

const STATUS_LABELS = {
  "Pending": "Pendiente",
  "InProgress": "En progreso",
  "Completed": "Completada"
};

const STATUS_CLASSES = {
  "Pending": "bg-red-100 text-red-800",
  "InProgress": "bg-yellow-100 text-yellow-800",
  "Completed": "bg-green-100 text-green-800"
};

const TasksPanel = () => {
  const { token, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [taskToAssign, setTaskToAssign] = useState(null);
  const [selectedTaskForStatus, setSelectedTaskForStatus] = useState(null);
  const [editTaskModalOpen, setEditTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);



  const api = axios.create({
    baseURL: 'https://localhost:7083/api',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const openAssignModal = (task) => {
    setTaskToAssign(task);
    setShowAssignModal(true);
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/Tasks');
      setTasks(response.data);
    } catch (err) {
      setError('Error al cargar tareas: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta tarea?')) {
      try {
        setLoading(true);
        await api.delete(`/Tasks/${id}`);
        // Refrescar lista de tareas
        await fetchTasks();
      } catch (error) {
        setError('Error al eliminar la tarea: ' + (error.response?.data || error.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const openEditModal = (task) => {
    setTaskToEdit(task);
    setEditTaskModalOpen(true);
  };



  useEffect(() => {
    fetchTasks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

const userRole = user?.role;
const canEdit = user?.role === "Admin";
const canAssignOrChangeStatus = user?.role === "Supervisor";
const canChangeStatusOnly = user?.role === "Employee";
const canChangeStatus = canEdit || canAssignOrChangeStatus || canChangeStatusOnly;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Administración de Tareas</h2>
        {canEdit && (
         <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nueva Tarea
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

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No hay tareas registradas</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignado a</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.map(task => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${STATUS_CLASSES[task.status]}`}>
                      {STATUS_LABELS[task.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.assignedUserName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      {canEdit && (
                        <>
                          <button 
                            onClick={() => openEditModal(task)}
                            className="text-indigo-600 hover:text-indigo-900 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                          </button>
                          <button 
                            onClick={() => deleteTask(task.id)}
                            className="text-red-600 hover:text-red-900 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Eliminar
                          </button>
                        </>
                      )}
                      {canChangeStatus && (
                        <button 
                         onClick={() => setSelectedTaskForStatus(task)}
                         className="text-green-600 hover:text-green-800 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582c.18-1.18.94-2.134 1.918-2.575C8.15 5.957 10.008 6.33 11 7.586c.992 1.256.56 3.113-.999 3.856A3.5 3.5 0 007 15.5V20h10v-5.5a3.5 3.5 0 00-2.999-3.058c-1.56-.743-1.991-2.6-.999-3.856.992-1.256 2.85-1.63 4.5-.99.978.441 1.738 1.395 1.918 2.575H20V4H4z" />
                          </svg>
                          Cambiar Estado
                        </button>
                      )}
                      {(userRole === 'Admin' || userRole === 'Supervisor') && (
                        <button
                          onClick={() => openAssignModal(task)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                           <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
                            </svg>
                          Asignar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
       {showAssignModal && taskToAssign && (
          <AssignTaskModal
            taskId={taskToAssign.id}
            token={token}
            onClose={() => setShowAssignModal(false)}
            onAssigned={() => {
              fetchTasks();
              setShowAssignModal(false);
            }}
          />
        )}
        {selectedTaskForStatus && (
          <ChangeStatusModal
            taskId={selectedTaskForStatus.id}
            currentStatus={selectedTaskForStatus.status}
            token={token}
            onClose={() => setSelectedTaskForStatus(null)}
            onStatusChanged={fetchTasks}
          />
        )}
        {editTaskModalOpen && (
          <EditTaskModal
            task={taskToEdit}
            token={token}
            onClose={() => setEditTaskModalOpen(false)}
            onTaskUpdated={fetchTasks}
          />
        )}
        {showCreateModal && (
          <CreateTaskModal
            token={token}
            onClose={() => setShowCreateModal(false)}
            onTaskCreated={fetchTasks}
          />
        )}
    </div>
  );
};

export default TasksPanel;
