// frontend/src/pages/admin/ForumAdminPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ForumAdminPage.css';

const ForumAdminPage = () => {
    const [allTopics, setAllTopics] = useState([]);
    const [allPosts, setAllPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('topics');

    const getToken = () => localStorage.getItem('token');

    const loadAllForumData = async () => {
        try {
            setLoading(true);
            setError('');
            
            const token = getToken();
            console.log('🔑 Токен:', token ? 'Есть' : 'Нет');
            
            if (!token) {
                throw new Error('Требуется авторизация');
            }
    
            // Пробуем загрузить через два возможных эндпоинта
            let topicsUrl = 'http://localhost:5000/api/forum/admin/topics';
            let postsUrl = 'http://localhost:5000/api/forum/admin/posts';
            
            console.log('📡 Запрос тем по URL:', topicsUrl);
    
            // Пробуем первый эндпоинт
            let topicsResponse = await fetch(topicsUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
    
            // Если не сработал, пробуем альтернативный
            if (topicsResponse.status === 404) {
                console.log('⚠️ Первый эндпоинт не найден, пробуем альтернативный...');
                topicsUrl = 'http://localhost:5000/api/forum/topics?all=true';
                topicsResponse = await fetch(topicsUrl, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
    
            console.log('📊 Ответ тем:', {
                status: topicsResponse.status,
                ok: topicsResponse.ok,
                statusText: topicsResponse.statusText
            });
    
            if (!topicsResponse.ok) {
                const errorText = await topicsResponse.text();
                console.error('❌ Ошибка тем:', errorText);
                
                // Используем демо-данные для разработки
                throw new Error(`API endpoint not found (${topicsResponse.status}). Using demo data.`);
            }
    
            const topics = await topicsResponse.json();
            console.log('📋 Получено тем:', topics);
    
            // Пробуем загрузить сообщения
            let postsResponse = await fetch(postsUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
    
            if (postsResponse.status === 404) {
                postsUrl = 'http://localhost:5000/api/forum/posts?all=true';
                postsResponse = await fetch(postsUrl, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
    
            let posts = [];
            if (postsResponse.ok) {
                posts = await postsResponse.json();
            } else {
                console.log('ℹ️ Сообщения не загружены, используем пустой массив');
            }
    
            setAllTopics(topics);
            setAllPosts(posts);
            
        } catch (err) {
            console.error('❌ Критическая ошибка:', err);
            setError(`Ошибка: ${err.message}. Используются демо-данные.`);
            
            // Демо-данные для разработки
            setAllTopics([
                {
                    id: 1,
                    title: "Тестовая тема 1",
                    content: "Это тема для тестирования",
                    category_name: "Общие вопросы",
                    author_name: "Админ",
                    created_at: new Date().toISOString(),
                    is_approved: true,
                    views: 5
                },
                {
                    id: 2,
                    title: "Тестовая тема 2",
                    content: "Еще одна тема для теста",
                    category_name: "Психология",
                    author_name: "Пользователь",
                    created_at: new Date().toISOString(),
                    is_approved: false,
                    views: 0
                }
            ]);
            
            setAllPosts([]);
        } finally {
            setLoading(false);
        }
    };

    // Удалить тему
    const deleteTopic = async (id, title) => {
        if (!window.confirm(`Удалить тему "${title}"?`)) return;

        try {
            const token = getToken();
            const response = await fetch(`http://localhost:5000/api/forum/admin/topics/${id}`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                alert('Тема удалена!');
                loadAllForumData();
            } else {
                alert('Ошибка удаления темы');
            }
        } catch (error) {
            console.error('Ошибка удаления:', error);
            alert('Ошибка сервера');
        }
    };

    // Удалить сообщение
    const deletePost = async (id) => {
        if (!window.confirm('Удалить это сообщение?')) return;

        try {
            const token = getToken();
            const response = await fetch(`http://localhost:5000/api/forum/admin/posts/${id}`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                alert('Сообщение удалено!');
                loadAllForumData();
            } else {
                alert('Ошибка удаления сообщения');
            }
        } catch (error) {
            console.error('Ошибка удаления:', error);
            alert('Ошибка сервера');
        }
    };

    // Форматирование даты
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU') + ' ' + date.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    useEffect(() => {
        loadAllForumData();
    }, []);

    if (loading) {
        return (
            <div className="forum-admin-container">
                <div className="loading">Загрузка данных форума...</div>
            </div>
        );
    }

    return (
        <div className="forum-admin-container">
            <div className="forum-admin-header">
                <h1>Управление форумом</h1>
                <p className="subtitle">Удаление любых тем и сообщений</p>
                <div className="header-actions">
                    <button onClick={loadAllForumData} className="btn-refresh">
                        🔄 Обновить
                    </button>
                    <Link to="/admin" className="btn-back">
                        ← Назад в панель
                    </Link>
                </div>
            </div>

            {error && (
                <div className="alert alert-error">
                    <strong>Ошибка:</strong> {error}
                </div>
            )}

            {/* Статистика */}
            <div className="forum-stats">
                <div className="stat-card">
                    <div className="stat-number">{allTopics.length}</div>
                    <div className="stat-label">Всего тем</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{allPosts.length}</div>
                    <div className="stat-label">Всего сообщений</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">
                        {allTopics.filter(t => !t.is_approved).length}
                    </div>
                    <div className="stat-label">Тем на модерации</div>
                </div>
                <div className="stat-card">
                    <Link to="/admin/forum/moderate" className="stat-link">
                        Перейти к модерации →
                    </Link>
                </div>
            </div>

            {/* Табы */}
            <div className="admin-tabs">
                <button 
                    className={`tab ${activeTab === 'topics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('topics')}
                >
                    Все темы ({allTopics.length})
                </button>
                <button 
                    className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('posts')}
                >
                    Все сообщения ({allPosts.length})
                </button>
            </div>

            {/* Вкладка всех тем */}
            {activeTab === 'topics' && (
                <div className="forum-content">
                    <h2>Все темы форума</h2>
                    
                    {allTopics.length === 0 ? (
                        <div className="empty-state">
                            <p>😕 На форуме пока нет тем</p>
                        </div>
                    ) : (
                        <div className="topics-list">
                            {allTopics.map(topic => (
                                <div key={topic.id} className="forum-item">
                                    <div className="item-header">
                                        <h3>{topic.title}</h3>
                                        <div className="item-meta">
                                            <span className="category">#{topic.category_name}</span>
                                            <span className="author">👤 {topic.author_name}</span>
                                            <span className="date">📅 {formatDate(topic.created_at)}</span>
                                            <span className="views">👁️ {topic.views || 0}</span>
                                            {topic.is_approved ? (
                                                <span className="status approved">✅ Одобрена</span>
                                            ) : (
                                                <span className="status pending">⏳ На модерации</span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="item-content">
                                        <p>{topic.content}</p>
                                    </div>
                                    
                                    <div className="item-actions">
                                        <button 
                                            onClick={() => deleteTopic(topic.id, topic.title)}
                                            className="btn-delete"
                                        >
                                            🗑️ Удалить тему
                                        </button>
                                        <Link 
                                            to={`/forum/topics/${topic.id}`}
                                            target="_blank"
                                            className="btn-view"
                                        >
                                            👁️ Просмотр
                                        </Link>
                                        {!topic.is_approved && (
                                            <Link 
                                                to="/admin/forum/moderate"
                                                className="btn-moderate"
                                            >
                                                ⏳ Модерировать
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Вкладка всех сообщений */}
            {activeTab === 'posts' && (
                <div className="forum-content">
                    <h2>Все сообщения форума</h2>
                    
                    {allPosts.length === 0 ? (
                        <div className="empty-state">
                            <p>😕 На форуме пока нет сообщений</p>
                        </div>
                    ) : (
                        <div className="posts-list">
                            {allPosts.map(post => (
                                <div key={post.id} className="forum-item">
                                    <div className="item-header">
                                        <h3>
                                            Сообщение в теме: 
                                            <strong> {post.topic_title || `ID: ${post.topic_id}`}</strong>
                                        </h3>
                                        <div className="item-meta">
                                            <span className="author">👤 {post.author_name}</span>
                                            <span className="date">📅 {formatDate(post.created_at)}</span>
                                            {post.is_approved ? (
                                                <span className="status approved">✅ Одобрено</span>
                                            ) : (
                                                <span className="status pending">⏳ На модерации</span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="item-content">
                                        <p>{post.content}</p>
                                    </div>
                                    
                                    <div className="item-actions">
                                        <button 
                                            onClick={() => deletePost(post.id)}
                                            className="btn-delete"
                                        >
                                            🗑️ Удалить сообщение
                                        </button>
                                        <Link 
                                            to={`/forum/topics/${post.topic_id}`}
                                            target="_blank"
                                            className="btn-view"
                                        >
                                            👁️ К теме
                                        </Link>
                                        {!post.is_approved && (
                                            <Link 
                                                to="/admin/forum/moderate"
                                                className="btn-moderate"
                                            >
                                                ⏳ Модерировать
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Информация */}
            <div className="admin-info">
                <h3>📋 Информация</h3>
                <ul>
                    <li>На этой странице можно удалять <strong>любые</strong> темы и сообщения</li>
                    <li>Для модерации новых тем перейдите в раздел <Link to="/admin/forum/moderate">Модерация</Link></li>
                    <li>Удаление необратимо - будьте осторожны!</li>
                    <li>Одобренные темы отображаются с зеленой галочкой</li>
                </ul>
            </div>
        </div>
    );
};

export default ForumAdminPage;