import React, { useState, useEffect } from 'react';

const UserForm = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 0
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializar formulario si estamos editando
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '', // Contraseña no se muestra por seguridad
        role: user.role === 'Admin' ? 0 : user.role === 'Supervisor' ? 1 : 2
      });
    } else {
      // Resetear formulario cuando no hay usuario (creación)
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 0
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error cuando se modifica el campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validación final
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Nombre es obligatorio';
    if (!formData.email.trim()) newErrors.email = 'Email es obligatorio';
    if (!user && !formData.password) newErrors.password = 'Contraseña es obligatoria';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }
    
    // Enviar datos
    const success = await onSubmit({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: parseInt(formData.role)
    });
    
    // Solo resetear si fue exitoso
    if (success && !user) {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 0
      });
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6 max-w-2xl mx-auto">
      <h3 className="text-lg font-medium text-gray-800 mb-6">
        {user ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ingrese el nombre completo"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.name 
                ? 'border-red-300 focus:ring-red-200' 
                : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-500'
            }`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="ejemplo@dominio.com"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.email 
                ? 'border-red-300 focus:ring-red-200' 
                : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-500'
            }`}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña {!user && '*'}
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={user ? 'Dejar en blanco para no cambiar' : 'Mínimo 6 caracteres'}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.password 
                ? 'border-red-300 focus:ring-red-200' 
                : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-500'
            }`}
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
          >
            <option value={0}>Administrador</option>
            <option value={1}>Supervisor</option>
            <option value={2}>Usuario Normal</option>
          </select>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button 
            type="button" 
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`px-4 py-2 text-white rounded-lg ${
              isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
            } flex items-center justify-center`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {user ? 'Actualizando...' : 'Creando...'}
              </>
            ) : user ? 'Actualizar Usuario' : 'Crear Usuario'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;