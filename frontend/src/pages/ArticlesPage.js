import React, { useState, useEffect } from 'react';
import { articleService } from '../services/api';
import ArticleCard from '../components/ArticleCard';
import './ArticlesPage.css';

const ArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const data = await articleService.getAll();
        setArticles(data);
        setError(null);
      } catch (err) {
        console.error('Ошибка при загрузке статей:', err);
        setError('Не удалось загрузить статьи. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) {
    return (
      <div className="container text-center">
        <div className="loading">Загрузка статей...</div>
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
    <div className="articles-page">
      <div className="container">
        <div className="page-header">
          <h1>Психологические статьи</h1>
          <p className="page-subtitle">
            Полезные материалы о психическом здоровье, отношениях и саморазвитии
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="no-articles">
            <p>Статьи скоро будут добавлены...</p>
          </div>
        ) : (
          <div className="articles-grid">
            {articles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        <div className="articles-info">
          <p>
            Все статьи написаны профессиональным психологом и основаны 
            на научных исследованиях и практическом опыте.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArticlesPage;