// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Verificar si hay token antes de renderizar
const root = ReactDOM.createRoot(document.getElementById('root'));

const renderApp = () => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Intenta recuperar el token del localStorage
const token = localStorage.getItem('authToken');
if (token) {
  // Verificar si el token es válido
  try {
    // Aquí podrías agregar una verificación de expiración
    renderApp();
  } catch (error) {
    console.error('Invalid token:', error);
    localStorage.removeItem('authToken');
    renderApp();
  }
} else {
  renderApp();
}