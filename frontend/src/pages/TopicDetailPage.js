import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { forumService } from '../services/api';
import PostCard from '../components/forum/PostCard';
import PostForm from '../components/forum/PostForm';
import './TopicDetailPage.css';

const TopicDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [topic, setTopic] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPostForm, setShowPostForm] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 1
    });

    // Функция загрузки темы и сообщений
    const loadTopicData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Загрузка темы с ID:', id);
            
            // Загружаем тему (API возвращает { topic, posts } или просто topic)
            const response = await forumService.getTopic(id);
            console.log('Ответ от сервера:', response);
            
            // Определяем структуру ответа
            let topicData, postsData;
            
            if (response.topic && response.posts) {
                // Новая структура { topic, posts }
                topicData = response.topic;
                postsData = response.posts;
            } else if (response.id || response.title) {
                // Старая структура - тема без сообщений
                topicData = response;
                postsData = [];
            } else {
                throw new Error('Неправильная структура ответа от сервера');
            }
            
            // Проверяем одобрена ли тема
            if (!topicData.is_approved && topicData.is_approved !== undefined) {
                setError('Эта тема ожидает модерации и пока недоступна для просмотра.');
                setTopic(topicData);
                setPosts([]);
                return;
            }
            
            setTopic(topicData);
            setPosts(postsData || []);
            
            // Обновляем пагинацию
            setPagination(prev => ({
                ...prev,
                total: postsData?.length || 0,
                pages: Math.ceil((postsData?.length || 0) / prev.limit)
            }));
            
        } catch (error) {
            console.error('Ошибка при загрузке темы:', error);
            
            // Проверяем тип ошибки
            if (error.response?.status === 404) {
                setError('Тема не найдена. Возможно, она была удалена.');
            } else {
                setError('Не удалось загрузить тему. Пожалуйста, попробуйте позже.');
            }
        } finally {
            setLoading(false);
        }
    }, [id]);

    // Загрузка данных при изменении ID
    useEffect(() => {
        loadTopicData();
    }, [loadTopicData]);

    // Обработчик добавления нового сообщения
    const handleAddPost = async (postData) => {
        try {
            console.log('Добавление сообщения:', postData);
            
            // Добавляем topic_id в данные сообщения
            const postWithTopic = {
                ...postData,
                topic_id: parseInt(id)
            };
            
            const newPost = await forumService.createPost(id, postWithTopic);
            console.log('Новое сообщение добавлено:', newPost);
            
            // Добавляем новое сообщение в начало списка
            setPosts(prev => [newPost, ...prev]);
            
            // Обновляем счетчик сообщений
            if (topic) {
                setTopic(prev => ({
                    ...prev,
                    post_count: (prev.post_count || 0) + 1
                }));
            }
            
            // Скрываем форму
            setShowPostForm(false);
            
            // Показываем уведомление
            setTimeout(() => {
                alert('✅ Ваше сообщение добавлено! Оно появится после модерации.');
            }, 100);
            
        } catch (error) {
            console.error('Ошибка при добавлении сообщения:', error);
            
            let errorMessage = '❌ Не удалось добавить сообщение. Попробуйте позже.';
            if (error.response?.status === 401) {
                errorMessage = '❌ Для добавления сообщения необходимо авторизоваться.';
            } else if (error.response?.data?.error) {
                errorMessage = `❌ ${error.response.data.error}`;
            }
            
            alert(errorMessage);
        }
    };

    // Форматирование даты
    const formatDate = (dateString) => {
        if (!dateString) return 'Дата не указана';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Ошибка форматирования даты:', error);
            return dateString;
        }
    };

    // Обработчик изменения страницы сообщений
    const handlePageChange = (newPage) => {
        // Пока у нас вся пагинация на одной странице, т.к. сообщения приходят с темой
        console.log('Изменение страницы на:', newPage);
        
        // Если нужно реализовать пагинацию, нужно будет сделать отдельный запрос
        setPagination(prev => ({ ...prev, page: newPage }));
        
        // Прокручиваем к сообщениям
        window.scrollTo({ top: 400, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="topic-detail-page">
                <div className="container">
                    <div className="loading">
                        <div className="spinner"></div>
                        <p>Загрузка темы...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="topic-detail-page">
                <div className="container">
                    <div className="error-message">
                        <h2>Тема недоступна</h2>
                        <p>{error}</p>
                        <div className="error-actions">
                            <button 
                                className="btn btn-primary"
                                onClick={() => navigate('/forum')}
                            >
                                Вернуться на форум
                            </button>
                            <Link to="/forum" className="btn btn-secondary">
                                К списку тем
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Защита от undefined
    if (!topic) {
        return (
            <div className="topic-detail-page">
                <div className="container">
                    <div className="error-message">
                        <h2>Ошибка</h2>
                        <p>Данные темы не загружены</p>
                        <button 
                            className="btn btn-primary"
                            onClick={() => navigate('/forum')}
                        >
                            Вернуться на форум
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="topic-detail-page">
            <div className="container">
                {/* Хлебные крошки */}
                <div className="breadcrumbs">
                    <Link to="/">Главная</Link> /{' '}
                    <Link to="/forum">Форум</Link> /{' '}
                    <span>{topic.title || 'Без названия'}</span>
                </div>

                {/* Заголовок темы */}
                <div className="topic-header">
                    <div className="topic-title-section">
                        <h1 className="topic-title">{topic.title || 'Без названия'}</h1>
                        <div className="topic-meta">
                            <span className="meta-item">
                                <span role="img" aria-label="author">👤</span> {topic.author_name || 'Аноним'}
                            </span>
                            <span className="meta-item">
                                <span role="img" aria-label="date">📅</span> {formatDate(topic.created_at)}
                            </span>
                            {topic.category_name && (
                                <span className="meta-item category">
                                    <span role="img" aria-label="category">🏷️</span> {topic.category_name}
                                </span>
                            )}
                            <span className="meta-item">
                                <span role="img" aria-label="comments">💬</span> {topic.post_count || posts.length} сообщений
                            </span>
                        </div>
                    </div>
                    
                    <div className="topic-actions">
                        <button 
                            className="btn btn-primary"
                            onClick={() => setShowPostForm(!showPostForm)}
                            type="button"
                            disabled={!topic.is_approved && topic.is_approved !== undefined}
                        >
                            {showPostForm ? '✖️ Отмена' : '✏️ Ответить'}
                        </button>
                        <button 
                            className="btn btn-secondary"
                            onClick={() => navigate('/forum')}
                            type="button"
                        >
                            ← Назад к темам
                        </button>
                    </div>
                </div>

                {/* Содержание темы */}
                <div className="topic-content">
                    <div className="original-post">
                        <div className="post-author">
                            <span className="author-avatar">👤</span>
                            <div className="author-info">
                                <span className="author-name">{topic.author_name || 'Аноним'}</span>
                                <span className="post-date">{formatDate(topic.created_at)}</span>
                            </div>
                        </div>
                        <div className="post-content">
                            {topic.content ? (
                                topic.content.split('\n').map((paragraph, index) => (
                                    paragraph.trim() ? <p key={index}>{paragraph}</p> : <br key={index} />
                                ))
                            ) : (
                                <p>Содержимое темы отсутствует.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Форма добавления сообщения */}
                {showPostForm && (
                    <div className="post-form-section">
                        <PostForm 
                            onSubmit={handleAddPost}
                            onCancel={() => setShowPostForm(false)}
                            topicId={id}
                        />
                    </div>
                )}

                {/* Список сообщений */}
                <div className="posts-section">
                    <div className="section-header">
                        <h2>Ответы ({posts.length})</h2>
                        {!showPostForm && topic.is_approved && (
                            <button 
                                className="btn btn-primary btn-small"
                                onClick={() => setShowPostForm(true)}
                                type="button"
                            >
                                + Добавить ответ
                            </button>
                        )}
                    </div>

                    {posts.length === 0 ? (
                        <div className="no-posts">
                            <p>Пока нет ответов. Будьте первым!</p>
                            {topic.is_approved && (
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => setShowPostForm(true)}
                                >
                                    Написать первый ответ
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="posts-list">
                                {posts.map(post => (
                                    <PostCard key={post.id || Math.random()} post={post} />
                                ))}
                            </div>

                            {/* Пагинация для сообщений */}
                            {pagination.pages > 1 && (
                                <div className="pagination">
                                    <button
                                        className="pagination-btn"
                                        disabled={pagination.page === 1}
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        type="button"
                                    >
                                        ← Назад
                                    </button>
                                    
                                    <div className="page-numbers">
                                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                                            let pageNum;
                                            if (pagination.pages <= 5) {
                                                pageNum = i + 1;
                                            } else if (pagination.page <= 3) {
                                                pageNum = i + 1;
                                            } else if (pagination.page >= pagination.pages - 2) {
                                                pageNum = pagination.pages - 4 + i;
                                            } else {
                                                pageNum = pagination.page - 2 + i;
                                            }
                                            
                                            return (
                                                <button
                                                    key={pageNum}
                                                    className={`page-btn ${pagination.page === pageNum ? 'active' : ''}`}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    type="button"
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    
                                    <button
                                        className="pagination-btn"
                                        disabled={pagination.page === pagination.pages}
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        type="button"
                                    >
                                        Вперёд →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Правила комментирования */}
                <div className="commenting-rules">
                    <h3><span role="img" aria-label="rules">📝</span> Правила комментирования</h3>
                    <ul>
                        <li>Будьте вежливы и уважительны к автору и другим участникам</li>
                        <li>Придерживайтесь темы обсуждения</li>
                        <li>Не размещайте ссылки на сторонние ресурсы без необходимости</li>
                        <li>Избегайте оффтопа и флуда</li>
                        <li>Конструктивная критика приветствуется, оскорбления запрещены</li>
                        <li>Все сообщения проходят модерацию</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default TopicDetailPage;