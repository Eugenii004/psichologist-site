// frontend/src/components/PrivateRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  // Простейшая проверка - всегда пропускаем для теста
  const isAuthenticated = true; // ← ВРЕМЕННО ВСЕГДА TRUE
  
  // Или проверяем токен:
  // const token = localStorage.getItem('token');
  // const isAuthenticated = !!token;
  
  console.log('🔐 PrivateRoute проверка:', {
    isAuthenticated,
    token: localStorage.getItem('token'),
    path: window.location.pathname
  });
  
  if (!isAuthenticated) {
    console.log('❌ Не авторизован, редирект на /login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('✅ Авторизован, пропускаем');
  return <Outlet />;
};

export default PrivateRoute;