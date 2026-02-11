// frontend/src/pages/admin/VideosPageAdmin.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import VideoCard from '../../components/VideoCard'; // ← ИСПРАВЛЕННЫЙ ПУТЬ
import './VideosPageAdmin.css';

const VideosPageAdmin = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Получение токена
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Загрузка видео
  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      const response = await fetch('http://localhost:5000/api/videos', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Videos data:', data);
        setVideos(data);
        setError('');
      } else {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        setError(`Ошибка сервера: ${response.status}`);
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Удаление видео
  const handleDelete = async (video) => {
    if (!window.confirm(`Удалить видео "${video.title}"?`)) return;
    
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:5000/api/videos/${video.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        alert('✅ Видео удалено');
        fetchVideos();
      } else {
        alert('Ошибка при удалении видео');
      }
    } catch (err) {
      console.error('Ошибка удаления:', err);
      alert('Ошибка соединения');
    }
  };

  // Редактирование видео
  const handleEdit = (video) => {
    window.location.href = `/admin/videos/edit/${video.id}`;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Загрузка видео...</div>
      </div>
    );
  }

  return (
    <div className="container videos-admin-page">
      <div className="admin-header">
        <h1>Управление видео</h1>
        <div className="header-actions">
          <Link to="/admin/videos/new" className="btn btn-primary">
            + Добавить видео
          </Link>
          <Link to="/admin" className="btn btn-outline">
            ← Панель управления
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <strong>Ошибка:</strong> {error}
        </div>
      )}

      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-value">{videos.length}</div>
          <div className="stat-label">Всего видео</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {videos.filter(v => v.is_published).length}
          </div>
          <div className="stat-label">Опубликовано</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {videos.filter(v => !v.is_published).length}
          </div>
          <div className="stat-label">Черновиков</div>
        </div>
      </div>

      {videos.length === 0 ? (
        <div className="no-videos">
          <p>Видео пока не добавлены.</p>
          <Link to="/admin/videos/new" className="btn btn-primary">
            Добавить первое видео
          </Link>
        </div>
      ) : (
        <div className="videos-grid">
          {videos.map(video => (
            <VideoCard
              key={video.id}
              video={video}
              isAdmin={true}
              onEdit={() => handleEdit(video)}
              onDelete={() => handleDelete(video)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VideosPageAdmin;