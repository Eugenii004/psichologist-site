
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './VideoFormPage.css';

const VideoFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_id: '',
    video_platform: 'rutube', // По умолчанию RuTube для РФ
    duration: '',
    category: 'Общее',
    tags: '',
    is_published: true,
    thumbnail_url: ''
  });
  
  // Получаем токен
  const getToken = () => {
    return localStorage.getItem('token');
  };
  
  // Загружаем видео для редактирования
  useEffect(() => {
    if (id) {
      const loadVideo = async () => {
        try {
          setInitialLoading(true);
          const token = getToken();
          
          const response = await fetch(`http://localhost:5000/api/videos/${id}`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          });
          
          if (!response.ok) {
            throw new Error('Видео не найдено');
          }
          
          const data = await response.json();
          setFormData({
            title: data.title || '',
            description: data.description || '',
            video_id: data.video_id || '',
            video_platform: data.video_platform || 'rutube',
            duration: data.duration || '',
            category: data.category || 'Общее',
            tags: data.tags ? data.tags.join(', ') : '',
            is_published: data.is_published || false,
            thumbnail_url: data.thumbnail_url || ''
          });
        } catch (err) {
          console.error('Ошибка при загрузке видео:', err);
          setError('Не удалось загрузить видео');
        } finally {
          setInitialLoading(false);
        }
      };
      
      loadVideo();
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
        setError('Требуется авторизация');
        setLoading(false);
        return;
      }
      
      // Валидация
      if (!formData.title.trim()) {
        setError('Заголовок обязателен');
        setLoading(false);
        return;
      }
      
      if (!formData.video_id.trim()) {
        setError('ID видео обязателен');
        setLoading(false);
        return;
      }
      
      if (!formData.video_platform) {
        setError('Выберите платформу');
        setLoading(false);
        return;
      }
      
      // Подготавливаем данные
      const videoData = {
        title: formData.title,
        description: formData.description,
        video_id: formData.video_id,
        video_platform: formData.video_platform,
        duration: formData.duration,
        category: formData.category,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        is_published: formData.is_published,
        thumbnail_url: formData.thumbnail_url || null
      };
      
      console.log('Отправка видео:', videoData);
      
      const url = id 
        ? `http://localhost:5000/api/videos/${id}`
        : 'http://localhost:5000/api/videos';
      
      const method = id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(videoData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Ошибка сервера: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Успешный ответ:', result);
      
      alert(id ? '✅ Видео обновлено!' : '✅ Видео создано!');
      navigate('/admin/videos');
      
    } catch (err) {
      console.error('Ошибка при сохранении видео:', err);
      setError(err.message || 'Произошла ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };
  
  // Примеры ID для разных платформ
  const getExamples = () => {
    switch(formData.video_platform) {
      case 'rutube':
        return '1234567890abcdef (16 символов) - из URL: rutube.ru/video/1234567890abcdef/';
      case 'youtube':
        return 'dQw4w9WgXcQ (11 символов) - из URL: youtube.com/watch?v=dQw4w9WgXcQ';
      case 'vk':
        return '-123456789_123456789 - из URL: vk.com/video-123456789_123456789';
      case 'vimeo':
        return '123456789 (цифры) - из URL: vimeo.com/123456789';
      default:
        return 'ID видео из URL';
    }
  };
  
  if (initialLoading) {
    return (
      <div className="container loading-container">
        <div className="loading">Загрузка видео...</div>
      </div>
    );
  }
  
  return (
    <div className="container video-form-container">
      <div className="video-form-header">
        <h1>{id ? 'Редактировать видео' : 'Добавить новое видео'}</h1>
        <button 
          onClick={() => navigate('/admin/videos')}
          className="btn btn-secondary"
        >
          ← Назад к видео
        </button>
      </div>
      
      {error && (
        <div className="alert alert-danger">
          <strong>Ошибка:</strong> {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="video-form">
        <div className="form-row">
          <div className="form-group">
            <label>Заголовок *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Название видео"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label>Категория</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="Общее">Общее</option>
              <option value="Психология">Психология</option>
              <option value="Самопомощь">Самопомощь</option>
              <option value="Медитация">Медитация</option>
              <option value="Стресс">Стресс</option>
              <option value="Отношения">Отношения</option>
              <option value="Работа">Работа</option>
              <option value="Здоровье">Здоровье</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label>Описание</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Описание видео"
            rows="4"
            disabled={loading}
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Платформа *</label>
            <select
              name="video_platform"
              value={formData.video_platform}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="rutube">RuTube (рекомендуется для РФ)</option>
              <option value="youtube">YouTube</option>
              <option value="vk">VK Видео</option>
              <option value="vimeo">Vimeo</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>ID видео *</label>
            <input
              type="text"
              name="video_id"
              value={formData.video_id}
              onChange={handleChange}
              placeholder={getExamples()}
              required
              disabled={loading}
            />
            <small className="form-help">
              Пример: {getExamples()}
            </small>
          </div>
          
          <div className="form-group">
            <label>Длительность</label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="HH:MM:SS или MM:SS"
              disabled={loading}
            />
            <small className="form-help">Например: 15:30 или 01:25:10</small>
          </div>
        </div>
        
        <div className="form-group">
          <label>Теги (через запятую)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="психология, стресс, медитация, самопомощь"
            disabled={loading}
          />
          <small className="form-help">Перечислите теги через запятую</small>
        </div>
        
        <div className="form-group">
          <label>URL превью (опционально)</label>
          <input
            type="url"
            name="thumbnail_url"
            value={formData.thumbnail_url}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            disabled={loading}
          />
          <small className="form-help">
            Оставьте пустым для автоматического превью с {formData.video_platform}
          </small>
        </div>
        
        <div className="form-check">
          <input
            type="checkbox"
            id="is_published"
            name="is_published"
            checked={formData.is_published}
            onChange={handleChange}
            disabled={loading}
          />
          <label htmlFor="is_published">Опубликовать сразу</label>
        </div>
        
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/admin/videos')}
            className="btn btn-outline"
            disabled={loading}
          >
            Отмена
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Сохранение...' : (id ? 'Обновить видео' : 'Добавить видео')}
          </button>
        </div>
      </form>
      
      <div className="form-info">
        <h3>💡 Как получить ID видео:</h3>
        <div className="platform-examples">
          <div className="example">
            <h4>RuTube</h4>
            <p>URL: <code>https://rutube.ru/video/<strong>1234567890abcdef</strong>/</code></p>
            <p>ID: <strong>1234567890abcdef</strong> (16 символов)</p>
          </div>
          <div className="example">
            <h4>YouTube</h4>
            <p>URL: <code>https://youtube.com/watch?v=<strong>dQw4w9WgXcQ</strong></code></p>
            <p>ID: <strong>dQw4w9WgXcQ</strong> (11 символов)</p>
          </div>
          <div className="example">
            <h4>VK Видео</h4>
            <p>URL: <code>https://vk.com/video<strong>-123456789_123456789</strong></code></p>
            <p>ID: <strong>-123456789_123456789</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoFormPage;