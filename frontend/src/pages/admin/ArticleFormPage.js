// frontend/src/pages/admin/ArticleFormPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const ArticleFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    cover_image: '',
    is_published: true
  });
  
  // Функция для получения токена
  const getToken = () => {
    return localStorage.getItem('token');
  };
  
  // Загружаем статью для редактирования
  useEffect(() => {
    if (id) {
      const loadArticle = async () => {
        try {
          setInitialLoading(true);
          const token = getToken();
          
          const response = await fetch(`http://localhost:5000/api/articles/${id}`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          });
          
          if (!response.ok) {
            throw new Error('Статья не найдена');
          }
          
          const data = await response.json();
          setFormData({
            title: data.title || '',
            content: data.content || '',
            excerpt: data.excerpt || '',
            cover_image: data.cover_image || '',
            is_published: data.is_published || false
          });
        } catch (err) {
          console.error('Ошибка при загрузке статьи:', err);
          setError('Не удалось загрузить статью');
        } finally {
          setInitialLoading(false);
        }
      };
      
      loadArticle();
    }
  }, [id]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = getToken();
      
      if (!token) {
        setError('Требуется авторизация. Войдите в систему.');
        setLoading(false);
        return;
      }
      
      // Проверяем обязательные поля
      if (!formData.title.trim()) {
        setError('Заголовок обязателен');
        setLoading(false);
        return;
      }
      
      if (!formData.content.trim()) {
        setError('Содержание обязательно');
        setLoading(false);
        return;
      }
      
      // Подготавливаем данные для отправки
      const articleData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || formData.content.substring(0, 200) + '...',
        cover_image: formData.cover_image || null,
        is_published: formData.is_published
      };
      
      console.log('Отправка данных:', articleData);
      
      const url = id 
        ? `http://localhost:5000/api/articles/${id}`
        : 'http://localhost:5000/api/articles';
      
      const method = id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(articleData)
      });
      
      console.log('Статус ответа:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Ошибка сервера: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Успешный ответ:', result);
      
      alert(id ? '✅ Статья обновлена!' : '✅ Статья создана!');
      navigate('/admin/articles');
      
    } catch (err) {
      console.error('Ошибка при сохранении статьи:', err);
      setError(err.message || 'Произошла ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };
  
  // Функция для проверки работы API
  const testAPI = async () => {
    try {
      const token = getToken();
      console.log('Токен:', token);
      
      const response = await fetch('http://localhost:5000/api/articles', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      console.log('API статус:', response.status);
      console.log('API заголовки:', response.headers);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API данные:', data);
        alert(`API работает! Статей: ${data.length || 0}`);
      } else {
        alert(`API ошибка: ${response.status}`);
      }
    } catch (error) {
      console.error('API тест ошибка:', error);
      alert('API недоступен: ' + error.message);
    }
  };
  
  if (initialLoading) {
    return (
      <div className="container" style={{ 
        maxWidth: '800px', 
        margin: '2rem auto', 
        padding: '0 1rem',
        textAlign: 'center' 
      }}>
        <div style={{ padding: '3rem', color: '#666' }}>
          <h2>Загрузка статьи...</h2>
          <p>Пожалуйста, подождите</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container" style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem', 
        paddingBottom: '1rem', 
        borderBottom: '2px solid #eee' 
      }}>
        <h1 style={{ margin: 0, color: '#333' }}>
          {id ? 'Редактировать статью' : 'Создать новую статью'}
        </h1>
        <button 
          onClick={() => navigate('/admin/articles')}
          style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          ← Назад к статьям
        </button>
      </div>
      
      {error && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#f8d7da', 
          border: '1px solid #f5c6cb', 
          color: '#721c24', 
          borderRadius: '4px', 
          marginBottom: '1.5rem' 
        }}>
          <strong>Ошибка:</strong> {error}
        </div>
      )}
      
      <div style={{ marginBottom: '1rem' }}>
        <button 
          onClick={testAPI}
          style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: '#6f42c1', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          🔧 Тест API
        </button>
        <small style={{ marginLeft: '1rem', color: '#6c757d' }}>
          Проверка подключения к бэкенду
        </small>
      </div>
      
      <form onSubmit={handleSubmit} style={{ 
        background: 'white', 
        padding: '2rem', 
        borderRadius: '8px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#444' }}>
            Заголовок *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              fontSize: '1rem' 
            }}
            placeholder="Введите заголовок статьи"
            required
            disabled={loading}
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#444' }}>
            Краткое описание
          </label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              fontSize: '1rem',
              minHeight: '100px' 
            }}
            placeholder="Краткое описание статьи (отображается в списке)"
            disabled={loading}
          />
          <small style={{ display: 'block', marginTop: '0.25rem', color: '#6c757d', fontSize: '0.85rem' }}>
            Если оставить пустым, будет использовано начало статьи
          </small>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#444' }}>
            URL обложки
          </label>
          <input
            type="url"
            name="cover_image"
            value={formData.cover_image}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              fontSize: '1rem' 
            }}
            placeholder="https://example.com/image.jpg"
            disabled={loading}
          />
          <small style={{ display: 'block', marginTop: '0.25rem', color: '#6c757d', fontSize: '0.85rem' }}>
            Необязательно. Ссылка на изображение для статьи
          </small>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#444' }}>
            Содержание *
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              fontSize: '1rem',
              minHeight: '300px',
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              lineHeight: '1.6'
            }}
            placeholder="Напишите содержание статьи здесь..."
            required
            disabled={loading}
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            id="is_published"
            name="is_published"
            checked={formData.is_published}
            onChange={handleChange}
            disabled={loading}
          />
          <label htmlFor="is_published" style={{ margin: 0, fontWeight: '600' }}>
            Опубликовать сразу
          </label>
          <small style={{ color: '#6c757d', fontSize: '0.85rem' }}>
            Если не отмечено, статья сохранится как черновик
          </small>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '1rem', 
          marginTop: '2rem', 
          paddingTop: '1.5rem', 
          borderTop: '1px solid #eee' 
        }}>
          <button
            type="button"
            onClick={() => navigate('/admin/articles')}
            style={{ 
              padding: '0.75rem 1.5rem', 
              backgroundColor: 'transparent', 
              color: '#6c757d', 
              border: '1px solid #6c757d', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '1rem'
            }}
            disabled={loading}
          >
            Отмена
          </button>
          <button
            type="submit"
            style={{ 
              padding: '0.75rem 1.5rem', 
              backgroundColor: loading ? '#6c757d' : '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem'
            }}
            disabled={loading}
          >
            {loading ? '⏳ Сохранение...' : (id ? '✏️ Обновить статью' : '📝 Создать статью')}
          </button>
        </div>
      </form>
      
      <div style={{ 
        marginTop: '2rem', 
        padding: '1.5rem', 
        backgroundColor: '#e7f3ff', 
        borderRadius: '8px', 
        border: '1px solid #b3d7ff' 
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#004085' }}>ℹ️ Инструкция по настройке</h3>
        
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ color: '#004085' }}>1. Проверьте бэкенд:</h4>
          <ul style={{ paddingLeft: '1.5rem', color: '#666' }}>
            <li>Запущен ли сервер? (<code>cd backend && npm start</code>)</li>
            <li>Работает ли база данных? (PostgreSQL)</li>
            <li>Создана ли таблица <code>articles</code>?</li>
          </ul>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ color: '#004085' }}>2. Проверьте CORS:</h4>
          <p style={{ color: '#666' }}>
            В <code>server.js</code> бэкенда должна быть настройка:
          </p>
          <pre style={{ 
            background: '#f8f9fa', 
            padding: '1rem', 
            borderRadius: '4px',
            fontSize: '0.9rem',
            overflow: 'auto'
          }}>
{`const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));`}
          </pre>
        </div>
        
        <div>
          <h4 style={{ color: '#004085' }}>3. Токен аутентификации:</h4>
          <p style={{ color: '#666' }}>
            Убедитесь, что в localStorage есть токен. Нажмите кнопку "Тест API" выше.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArticleFormPage;