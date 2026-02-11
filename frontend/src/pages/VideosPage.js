import React, { useState, useEffect } from 'react';
import { videoService } from '../services/api';
import { Link } from 'react-router-dom'
import VideoCard from '../components/VideoCard';
import './VideosPage.css';

const VideosPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const data = await videoService.getAll();
        setVideos(data);
        setError(null);
      } catch (err) {
        console.error('Ошибка при загрузке видео:', err);
        setError('Не удалось загрузить видео. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div className="container text-center">
        <div className="loading">Загрузка видео...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="videos-page">
      <div className="container">
        <div className="page-header">
          <h1>Видео материалы</h1>
          <p className="page-subtitle">
            Психологические практики, медитации и обучающие материалы в видеоформате
          </p>
        </div>

        {videos.length === 0 ? (
          <div className="no-videos">
            <p>Видео скоро будут добавлены...</p>
          </div>
        ) : (
          <div className="videos-grid">
            {videos.map(video => (
  <Link to={`/videos/${video.id}`} key={video.id} style={{ textDecoration: 'none' }}>
    <VideoCard video={video} />
  </Link>
))}
          </div>
        )}

        <div className="videos-info">
          <p>
            Все видео материалы созданы для вашего удобства. Вы можете 
            смотреть их в любое время и возвращаться к нужным практикам.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideosPage;