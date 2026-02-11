// src/services/authService.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const authService = {
  login: async (username, password) => {
    console.log('📡 authService.login(): отправляю запрос...');
    console.log('URL:', `${API_URL}/auth/login`);
    console.log('Данные:', { username, password: '***' });
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      console.log('📥 Получен ответ. Статус:', response.status);
      console.log('Заголовки:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Ошибка HTTP:', response.status, errorText);
        throw new Error(`Ошибка сервера: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Данные ответа:', data);
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('admin', JSON.stringify(data.admin));
        console.log('💾 Токен сохранен в localStorage');
      } else {
        console.warn('⚠️ В ответе нет токена!');
      }
      
      return data;
      
    } catch (error) {
      console.error('🔥 Ошибка сети или парсинга:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    console.log('🧹 localStorage очищен');
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('admin');
    return userStr ? JSON.parse(userStr) : null;
  }
};

export default authService;