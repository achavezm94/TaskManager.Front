import api from './api';

export const login = async (credentials) => {
  try {
    const response = await api.post('/api/Auth/login', credentials);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error de autenticación');
  }
};