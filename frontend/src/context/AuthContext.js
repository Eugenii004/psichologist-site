import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log('🔍 AuthContext: проверяю аутентификацию при загрузке...');
    const token = authService.getToken();
    const storedUser = authService.getCurrentUser();
    
    console.log('Токен из localStorage:', token ? 'есть' : 'нет');
    console.log('Пользователь из localStorage:', storedUser);
    
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(storedUser);
      console.log('✅ Пользователь уже авторизован');
    } else {
      console.log('❌ Пользователь не авторизован');
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    console.log('🔐 AuthContext.login() вызван с:', { username });
    try {
      setLoading(true);
      console.log('Вызываю authService.login()...');
      const data = await authService.login(username, password);
      console.log('✅ authService.login() успешно:', data);
      
      setIsAuthenticated(true);
      setUser(data.admin);
      console.log('✅ Состояние обновлено: isAuthenticated = true');
      
      return data;
    } catch (error) {
      console.error('❌ AuthContext.login() ошибка:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 Выход из системы...');
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    loading,
    user,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};