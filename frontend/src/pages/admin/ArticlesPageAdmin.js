// frontend/src/pages/admin/ArticlesPageAdmin.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articleService } from '../../services/api';
import './ArticlesPageAdmin.css';

const ArticlesPageAdmin = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const getToken = () => {
        return localStorage.getItem('token');
    };
    
    // Загружаем статьи
    const loadArticles = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await articleService.getAll();
            setArticles(data || []);
        } catch (err) {
            console.error('Ошибка при загрузке статей:', err);
            setError('Не удалось загрузить статьи');
            setArticles([]);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        loadArticles();
    }, []);
    
    // Удаление статьи
    const handleDelete = async (id, title) => {
        if (!window.confirm(`Вы уверены, что хотите удалить статью "${title}"?`)) {
            return;
        }
        
        try {
            const token = getToken();
            if (!token) {
                alert('Требуется авторизация');
                return;
            }
            
            await articleService.delete(id, token);
            alert('Статья удалена успешно!');
            loadArticles(); // Перезагружаем список
        } catch (err) {
            console.error('Ошибка при удалении статьи:', err);
            alert('Не удалось удалить статью');
        }
    };
    
    // Форматирование даты
    const formatDate = (dateString) => {
        if (!dateString) return 'Не опубликовано';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    };
    
    // Статус статьи
    const getStatusBadge = (isPublished) => {
        if (isPublished) {
            return <span className="badge badge-success">Опубликовано</span>;
        }
        return <span className="badge badge-secondary">Черновик</span>;
    };
    
    if (loading) {
        return (
            <div className="container">
                <div className="loading">Загрузка статей...</div>
            </div>
        );
    }
    
    return (
        <div className="container admin-articles-page">
            <div className="admin-articles-header">
                <h1>Управление статьями</h1>
                <div className="header-actions">
                    <Link to="/admin/articles/new" className="btn btn-primary">
                        + Новая статья
                    </Link>
                    <Link to="/admin" className="btn btn-outline">
                        ← Панель управления
                    </Link>
                </div>
            </div>
            
            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}
            
            <div className="stats-summary">
                <div className="stat-card">
                    <div className="stat-value">{articles.length}</div>
                    <div className="stat-label">Всего статей</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">
                        {articles.filter(a => a.is_published).length}
                    </div>
                    <div className="stat-label">Опубликовано</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">
                        {articles.filter(a => !a.is_published).length}
                    </div>
                    <div className="stat-label">Черновиков</div>
                </div>
            </div>
            
            {articles.length === 0 ? (
                <div className="no-articles">
                    <p>Статьи пока не созданы.</p>
                    <Link to="/admin/articles/new" className="btn btn-primary">
                        Создать первую статью
                    </Link>
                </div>
            ) : (
                <div className="articles-table-container">
                    <table className="articles-table">
                        <thead>
                            <tr>
                                <th>Заголовок</th>
                                <th>Статус</th>
                                <th>Дата</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map(article => (
                                <tr key={article.id}>
                                    <td className="article-title-cell">
                                        <Link to={`/articles/${article.id}`} className="article-link">
                                            {article.title}
                                        </Link>
                                        <div className="article-excerpt">
                                            {article.excerpt || article.content?.substring(0, 100) + '...'}
                                        </div>
                                    </td>
                                    <td>
                                        {getStatusBadge(article.is_published)}
                                    </td>
                                    <td>
                                        {formatDate(article.published_at)}
                                    </td>
                                    <td className="actions-cell">
                                        <Link 
                                            to={`/admin/articles/edit/${article.id}`}
                                            className="btn-action btn-edit"
                                        >
                                            ✏️ Редактировать
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(article.id, article.title)}
                                            className="btn-action btn-delete"
                                        >
                                            🗑️ Удалить
                                        </button>
                                        <Link 
                                            to={`/articles/${article.id}`}
                                            className="btn-action btn-view"
                                            target="_blank"
                                        >
                                            👁️ Просмотр
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ArticlesPageAdmin;