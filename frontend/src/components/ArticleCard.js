import React from 'react';
import { Link } from 'react-router-dom';
import './ArticleCard.css';

const ArticleCard = ({ article }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="article-card">
      {article.cover_image && (
        <div className="article-image">
          <img src={article.cover_image} alt={article.title} />
        </div>
      )}
      <div className="article-content">
        <h3 className="article-title">{article.title}</h3>
        {article.excerpt && (
          <p className="article-excerpt">{article.excerpt}</p>
        )}
        <div className="article-meta">
          <span className="article-date">
            📅 {formatDate(article.published_at)}
          </span>
        </div>
        <Link to={`/articles/${article.id}`} className="btn btn-primary">
          Читать далее
        </Link>
      </div>
    </div>
  );
};

export default ArticleCard;