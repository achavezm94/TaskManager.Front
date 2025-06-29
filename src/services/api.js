import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7083', // Reemplaza con tu URL base
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;