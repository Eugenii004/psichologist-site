// frontend/src/pages/VideoDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import VideoPlayer from '../components/video/VideoPlayer';
import './VideoDetailPage.css';

const VideoDetailPage = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/videos/${id}`);
        
        if (response.ok) {
          const data = await response.json();
          setVideo(data);
        } else {
          setError('Видео не найдено');
        }
      } catch (err) {
        console.error('Ошибка загрузки видео:', err);
        setError('Ошибка при загрузке видео');
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

  if (loading) {
    return (
      <div className="container text-center">
        <div className="loading">Загрузка видео...</div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="container">
        <div className="error-message">
          <h2>Видео не найдено</h2>
          <p>{error || 'Запрошенное видео не существует'}</p>
          <Link to="/videos" className="btn btn-primary">
            ← Вернуться к списку видео
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="video-detail-page">
      <div className="container">
        <div className="breadcrumbs">
          <Link to="/">Главная</Link> /{' '}
          <Link to="/videos">Видео</Link> /{' '}
          <span>{video.title}</span>
        </div>

        <VideoPlayer video={video} />
        
        <div className="navigation-links">
          <Link to="/videos" className="btn btn-secondary">
            ← К списку видео
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VideoDetailPage;