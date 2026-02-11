import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articleService, videoService } from '../services/api';
import ArticleCard from '../components/ArticleCard';
import VideoCard from '../components/VideoCard';
import './HomePage.css';

const HomePage = () => {
  const [articles, setArticles] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articlesData, videosData] = await Promise.all([
          articleService.getAll(),
          videoService.getAll()
        ]);
        
        // Берем только последние 3 статьи и 2 видео
        setArticles(articlesData.slice(0, 3));
        setVideos(videosData.slice(0, 2));
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container text-center">
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Герой секция */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1>Профессиональная психологическая помощь</h1>
            <p className="hero-subtitle">
              Помогаю обрести гармонию, справиться со стрессом 
              и улучшить качество жизни через психологическую поддержку
            </p>
            <div className="hero-buttons">
              <Link to="/contacts" className="btn btn-primary">
                Записаться на консультацию
              </Link>
              <Link to="/articles" className="btn btn-secondary">
                Читать статьи
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Преимущества */}
      <section className="benefits-section">
        <div className="container">
          <h2 className="section-title">Почему стоит обратиться</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">🔒</div>
              <h3>Конфиденциальность</h3>
              <p>Полная анонимность и защита ваших данных</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🎓</div>
              <h3>Профессионализм</h3>
              <p>Опытный специалист с высшим психологическим образованием</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">💻</div>
              <h3>Онлайн формат</h3>
              <p>Удобные консультации из любой точки мира</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🤝</div>
              <h3>Индивидуальный подход</h3>
              <p>Персональная программа для каждого клиента</p>
            </div>
          </div>
        </div>
      </section>

      {/* Последние статьи */}
      <section className="articles-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Последние статьи</h2>
            <Link to="/articles" className="section-link">
              Все статьи →
            </Link>
          </div>
          <div className="articles-grid">
            {articles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* Видео материалы */}
      <section className="videos-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Видео материалы</h2>
            <Link to="/videos" className="section-link">
              Все видео →
            </Link>
          </div>
          <div className="videos-grid">
            {videos.map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      </section>

      {/* Призыв к действию */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Готовы начать путь к изменениям?</h2>
            <p>Запишитесь на первую консультацию и сделайте первый шаг к гармонии</p>
            <Link to="/contacts" className="btn btn-primary btn-large">
              Записаться на консультацию
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;    