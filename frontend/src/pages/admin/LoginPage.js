import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔄 Начало процесса входа...');
    console.log('Введенные данные:', { username, password });
    
    setError('');
    setLoading(true);
    
    try {
      console.log('Вызываю login() из AuthContext...');
      await login(username, password);
      console.log('✅ login() успешно выполнен');
      
      console.log('Пытаюсь перейти на /admin/dashboard...');
      navigate('/admin/dashboard');
      console.log('✅ navigate() вызван');
      
    } catch (error) {
      console.error('❌ Ошибка входа:', error);
      console.error('Детали ошибки:', error.message);
      setError(error.message || 'Ошибка входа. Проверьте данные.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Вход в админ-панель</h2>
        <p className="login-subtitle">Психолог Евгений Плахов</p>
        
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Имя пользователя</label>
            <input 
              type="text" 
              id="username"
              placeholder="Введите имя пользователя" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input 
              type="password" 
              id="password"
              placeholder="Введите пароль" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-login"
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        
        <div className="login-info">
          <p><strong>Тестовые данные:</strong></p>
          <p>Имя пользователя: <code>admin</code></p>
          <p>Пароль: <code>admin123</code></p>
          <p style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
            Откройте консоль браузера (F12 → Console) для отладки
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;