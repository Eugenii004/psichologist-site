import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { articleService } from '../services/api';
import './ArticleDetailPage.css';

const ArticleDetailPage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const data = await articleService.getById(id);
        setArticle(data);
        setError(null);
      } catch (err) {
        console.error('Ошибка при загрузке статьи:', err);
        setError('Статья не найдена или произошла ошибка при загрузке.');
        // Создаем заглушку для демонстрации
        setArticle({
          id: id,
          title: `Статья #${id}`,
          content: 'Содержание статьи будет загружено...',
          excerpt: 'Краткое описание',
          published_at: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container text-center">
        <div className="loading">Загрузка статьи...</div>
      </div>
    );
  }

  return (
    <div className="article-detail-page">
      <div className="container">
        {/* Навигация */}
        <div className="breadcrumbs">
          <Link to="/">Главная</Link> /{' '}
          <Link to="/articles">Статьи</Link> /{' '}
          <span>{article.title}</span>
        </div>

        {/* Заголовок статьи */}
        <div className="article-header">
          <h1 className="article-title">{article.title}</h1>
          <div className="article-meta">
            <span className="article-date">
              📅 Опубликовано: {formatDate(article.published_at)}
            </span>
          </div>
        </div>

        {/* Изображение статьи */}
        {article.cover_image && (
          <div className="article-image">
            <img src={article.cover_image} alt={article.title} />
          </div>
        )}

        {/* Содержание статьи */}
        <div className="article-content">
          {article.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="article-paragraph">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Действия */}
        <div className="article-actions">
          <Link to="/articles" className="btn btn-secondary">
            ← Назад к статьям
          </Link>
          <div className="share-buttons">
            <button className="btn btn-outline">
              📢 Поделиться
            </button>
          </div>
        </div>

        {/* Рекомендации */}
        <div className="recommendations">
          <h2>Другие статьи</h2>
          <div className="recommendations-info">
            <p>
              Чтобы увидеть другие статьи, перейдите в раздел 
              <Link to="/articles"> "Все статьи"</Link>
            </p>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <p>Попробуйте выбрать другую статью из списка.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleDetailPage;